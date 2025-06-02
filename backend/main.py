from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import pdfplumber
from io import BytesIO

# Initialize the FastAPI app
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key="")

# In-memory storage for uploaded PDFs
uploaded_reports = {}

# Request models
class QuestionRequest(BaseModel):
    report_id: str
    question: str

class SummaryRequest(BaseModel):
    report_id: str

# Upload PDF endpoint
@app.post("/upload/")
async def upload_report(file: UploadFile = File(...)):
    report_id = file.filename
    content = await file.read()

    try:
        with pdfplumber.open(BytesIO(content)) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""

        if not text.strip():
            return JSONResponse(status_code=400, content={"message": "No text found in PDF."})

        uploaded_reports[report_id] = text
        return {"message": "Report uploaded successfully", "report_id": report_id}
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Failed to read PDF", "error": str(e)})

# Question answering endpoint
@app.post("/ask/")
async def ask_question(request: QuestionRequest):
    if request.report_id not in uploaded_reports:
        return JSONResponse(status_code=404, content={"message": "Report not found"})

    full_text = uploaded_reports[request.report_id]
    shortened_text = full_text[:4000]

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful medical assistant."},
                {"role": "user", "content": f"The following is a medical report:\n\n{shortened_text}"},
                {"role": "user", "content": request.question}
            ],
            temperature=0.7,
            max_tokens=200
        )
        answer = response.choices[0].message.content.strip()
        return {"answer": answer}

    except Exception as e:
        print("OpenAI API Error:", str(e))
        return JSONResponse(status_code=500, content={"message": "OpenAI API error", "error": str(e)})

# Summary endpoint
@app.post("/summarize/")
async def summarize_report(request: SummaryRequest):
    if request.report_id not in uploaded_reports:
        return JSONResponse(status_code=404, content={"message": "Report not found"})

    full_text = uploaded_reports[request.report_id]
    shortened_text = full_text[:4000]

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a medical report summarizer."},
                {"role": "user", "content": f"Summarize the following medical report:\n\n{shortened_text}"}
            ],
            temperature=0.5,
            max_tokens=300
        )
        summary = response.choices[0].message.content.strip()
        return {"summary": summary}

    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "OpenAI API error", "error": str(e)})

# Static frontend routes
app.mount("/static", StaticFiles(directory="frontend"), name="static")

@app.get("/")
def serve_index():
    return FileResponse(os.path.join("frontend", "index.html"))

@app.get("/login.html")
def serve_login():
    return FileResponse(os.path.join("frontend", "login.html"))

@app.get("/dashboard.html")
def serve_dashboard():
    return FileResponse(os.path.join("frontend", "dashboard.html"))
