from fastapi import FastAPI

app = FastAPI()

food_items = {
    "indian": ["Samosa", "Paneer Tikka", "Butter Chicken"],
    "chinese": ["Spring Rolls", "Kung Pao Chicken", "Fried Rice"],
    "italian": ["Pasta", "Pizza", "Tiramisu"],
    "mexican": ["Tacos", "Burritos", "Guacamole"],
}

valid_cuisines = ["indian", "chinese", "italian", "mexican"]

@app.get("/get_items/{cuisine}")
async def get_items(cuisine):
    if cuisine not in valid_cuisines:
        return f"Supported cuisines are: {valid_cuisines})"

    return food_items.get(cuisine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app)

# from fastapi import FastAPI, File, UploadFile
# from fastapi.responses import JSONResponse
# from pydantic import BaseModel
# import openai
# import os

# # Initialize FastAPI app
# app = FastAPI()

# # Set your OpenAI API key
# openai.api_key = os.getenv("OPENAI_API_KEY")

# # In-memory storage for uploaded reports
# uploaded_reports = {}

# class QuestionRequest(BaseModel):
#     report_id: str
#     question: str

# @app.post("/upload/")
# async def upload_report(file: UploadFile = File(...)):
#     content = await file.read()
#     report_id = file.filename
#     uploaded_reports[report_id] = content.decode("utf-8")
#     return {"message": "Report uploaded successfully", "report_id": report_id}

# @app.post("/ask/")
# async def ask_question(request: QuestionRequest):
#     report_id = request.report_id
#     question = request.question

#     if report_id not in uploaded_reports:
#         return JSONResponse(status_code=404, content={"message": "Report not found"})

#     report_content = uploaded_reports[report_id]
#     prompt = f"The following is a medical report:\n\n{report_content}\n\nAnswer the following question based on the report:\n{question}"

#     try:
#         response = openai.Completion.create(
#             engine="text-davinci-003",
#             prompt=prompt,
#             max_tokens=200,
#             temperature=0.7
#         )
#         answer = response.choices[0].text.strip()
#         return {"answer": answer}
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"message": "Error processing the request", "error": str(e)})

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="main", port=8000)
# # Run the app with `uvicorn main:app --reload`