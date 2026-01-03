from mistralai import Mistral
import os

api_key = os.environ.get("MISTRAL_API_KEY")
client = Mistral(api_key=api_key)

ocr_response = client.ocr.process(
    model="mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2004.07606"
    },
    include_image_base64=True
)

print(ocr_response)