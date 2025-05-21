from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import OpenAI
import os
import pdfplumber
from io import BytesIO

app = FastAPI()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

uploaded_reports = {}

class QuestionRequest(BaseModel):
    report_id: str
    question: str

@app.post("/upload/")
async def upload_report(file: UploadFile = File(...)):
    report_id = file.filename
    content = await file.read()

    try:
        # Open the PDF using pdfplumber
        with pdfplumber.open(BytesIO(content)) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""

        if not text.strip():
            return JSONResponse(status_code=400, content={"message": "Could not extract any text from the PDF."})

        uploaded_reports[report_id] = text
        return {"message": "Report uploaded successfully", "report_id": report_id}
    
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Failed to read PDF", "error": str(e)})


@app.post("/ask/")
async def ask_question(request: QuestionRequest):
    report_id = request.report_id
    question = request.question

    if report_id not in uploaded_reports:
        return JSONResponse(status_code=404, content={"message": "Report not found"})

    report_content = uploaded_reports[report_id]

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful medical assistant."},
                {"role": "user", "content": f"The following is a medical report:\n\n{report_content}"},
                {"role": "user", "content": question}
            ],
            temperature=0.7,
            max_tokens=200
        )
        answer = response.choices[0].message.content.strip()
        return {"answer": answer}
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": "Error processing the request", "error": str(e)})