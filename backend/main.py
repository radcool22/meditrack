# from fastapi import FastAPI

# app = FastAPI()

# food_items = {
#     "indian": ["Samosa", "Paneer Tikka", "Butter Chicken"],
#     "chinese": ["Spring Rolls", "Kung Pao Chicken", "Fried Rice"],
#     "italian": ["Pasta", "Pizza", "Tiramisu"],
#     "mexican": ["Tacos", "Burritos", "Guacamole"],
# }

# valid_cuisines = ["indian", "chinese", "italian", "mexican"]

# @app.get("/get_items/{cuisine}")
# async def get_items(cuisine):
#     if cuisine not in valid_cuisines:
#         return f"Supported cuisines are: {valid_cuisines})"

#     return food_items.get(cuisine)

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app)

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import openai
import os
import pdfplumber

app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

# In-memory storage for uploaded reports
uploaded_reports = {}

class QuestionRequest(BaseModel):
    report_id: str
    question: str

def extract_text_from_file(file: UploadFile) -> str:
    if file.filename.endswith(".pdf"):
        with pdfplumber.open(file.file) as pdf:
            text = "".join(page.extract_text() or "" for page in pdf.pages)
        return text
    elif file.filename.endswith(".txt"):
        return file.file.read().decode("utf-8")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Only .pdf and .txt allowed.")

@app.post("/upload/")
async def upload_report(file: UploadFile = File(...)):
    try:
        content = extract_text_from_file(file)
        report_id = file.filename
        uploaded_reports[report_id] = content
        return {"message": "Report uploaded successfully", "report_id": report_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask/")
async def ask_question(request: QuestionRequest):
    report_id = request.report_id
    question = request.question

    if report_id not in uploaded_reports:
        raise HTTPException(status_code=404, detail="Report not found.")

    report_content = uploaded_reports[report_id]
    prompt = f"The following is a medical report:\n\n{report_content}\n\nAnswer this question:\n{question}"

    try:
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=prompt,
            max_tokens=200,
            temperature=0.5,
        )
        answer = response.choices[0].text.strip()
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")