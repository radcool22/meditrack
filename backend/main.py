from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI
import os
import pdfplumber
from io import BytesIO

app = FastAPI()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Store uploaded reports in memory
uploaded_reports = {}

# Input model for asking questions
class QuestionRequest(BaseModel):
    report_id: str
    question: str

# Upload PDF medical report
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

# Ask a question about the uploaded report
@app.post("/ask/")
async def ask_question(request: QuestionRequest):
    if request.report_id not in uploaded_reports:
        return JSONResponse(status_code=404, content={"message": "Report not found"})

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful medical assistant."},
                {"role": "user", "content": f"The following is a medical report:\n\n{uploaded_reports[request.report_id]}"},
                {"role": "user", "content": request.question}
            ],
            temperature=0.7,
            max_tokens=200
        )
        answer = response.choices[0].message.content.strip()
        return {"answer": answer}
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "OpenAI API error", "error": str(e)})