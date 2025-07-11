import os
import requests
import streamlit as st

def extract_with_landingai(file, api_key=None):
    """
    Extract text from a PDF using LandingAI Agentic Document Extraction API.
    Not used in the main app; for future use.
    """
    if api_key is None:
        api_key = os.environ.get("LANDINGAI_API_KEY")
    url = "https://api.va.landing.ai/v1/tools/agentic-document-analysis"
    headers = {"Authorization": f"Basic {api_key}"}
    files = {"pdf": (file.name, file, file.type)}
    data = {
        "include_marginalia": "true",
        "include_metadata_in_markdown": "true"
    }
    try:
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        result = response.json()
        markdown = result.get("data", {}).get("markdown", "")
        return markdown
    except Exception as e:
        st.error(f"LandingAI extraction failed: {e}")
        return "" 