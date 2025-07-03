import streamlit as st
import pdfplumber
from openai import OpenAI
import os

# Set your OpenAI API key here or as an environment variable
# OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "YOUR_OPENAI_KEY")
OPENAI_API_KEY = ""
client = OpenAI(api_key=OPENAI_API_KEY)

# Language selection
if "language" not in st.session_state:
    st.session_state.language = "Hindi"
language = st.selectbox("Choose Language / भाषा चुनें", ["Hindi", "English"], index=0)
st.session_state.language = language

# Reset answer and show_answer when language or report changes
if "last_language" not in st.session_state or st.session_state.last_language != language:
    st.session_state.answer = ""
    st.session_state.show_answer = False
    st.session_state.last_language = language
if "last_report_text" not in st.session_state:
    st.session_state.last_report_text = ""
    st.session_state.answer = ""
    st.session_state.show_answer = False

# Interface text based on language
if language == "Hindi":
    title = "मेडिकल रिपोर्ट हिंदी चैटबोट 🤖"
    upload_label = "अपनी मेडिकल रिपोर्ट (PDF या TXT) अपलोड करें"
    summary_button = "रिपोर्ट का हिंदी में सारांश प्राप्त करें"
    summary_spinner = "सारांश तैयार किया जा रहा है..."
    summary_error = "OpenAI API ने कोई सारांश नहीं लौटाया।"
    summary_success = "रिपोर्ट सफलतापूर्वक अपलोड हो गई!"
    summary_label = "**रिपोर्ट का सारांश:**"
    chat_divider = "---"
    chat_label = "### रिपोर्ट से संबंधित कोई भी सवाल हिंदी में पूछें:"
    chat_input = "अपना सवाल लिखें..."
    chat_button = "भेजें"
    chat_spinner = "उत्तर तैयार किया जा रहा है..."
    chat_error = "OpenAI API ने कोई उत्तर नहीं लौटाया।"
    agent_label = "**एजेंट:**"
    upload_info = "कृपया पहले अपनी मेडिकल रिपोर्ट अपलोड करें।"
    extract_error = "रिपोर्ट से कोई टेक्स्ट नहीं निकला। कृपया सही फाइल अपलोड करें।"
    system_prompt = "You are a helpful medical assistant who always answers only in Hindi. The user will ask questions in Hindi about the following English medical report:\n\n"
    summary_prompt = "नीचे एक अंग्रे़ी मेडिकल रिपोर्ट है। कृपया इसका संक्षिप्त सारांश केवल हिंदी में दें (अंग्रेज़ी का एक भी शब्द न हो):\n\n{report_text}"
    user_prompt = "{user_input} (उत्तर केवल हिंदी में दें, अंग्रेज़ी का एक भी शब्द न हो)"
else:
    title = "Medical Report English Chatbot 🤖"
    upload_label = "Upload your medical report (PDF or TXT)"
    summary_button = "Get summary in English"
    summary_spinner = "Generating summary..."
    summary_error = "OpenAI API did not return a summary."
    summary_success = "Report uploaded successfully!"
    summary_label = "**Report Summary:**"
    chat_divider = "---"
    chat_label = "### Ask any question about the report in English:"
    chat_input = "Type your question..."
    chat_button = "Send"
    chat_spinner = "Generating answer..."
    chat_error = "OpenAI API did not return an answer."
    agent_label = "**Agent:**"
    upload_info = "Please upload your medical report first."
    extract_error = "No text could be extracted from the report. Please upload a valid file."
    system_prompt = "You are a helpful medical assistant who always answers only in English. The user will ask questions in English about the following English medical report:\n\n"
    summary_prompt = "Below is an English medical report. Please provide a concise summary in English:\n\n{report_text}"
    user_prompt = "{user_input} (Answer only in English)"

st.title(title)

# Upload medical report
uploaded_file = st.file_uploader(upload_label, type=["pdf", "txt"])

report_text = ""
if uploaded_file:
    if uploaded_file.type == "application/pdf":
        with pdfplumber.open(uploaded_file) as pdf:
            report_text = ""
            for page in pdf.pages:
                report_text += page.extract_text() or ""
    else:
        report_text = uploaded_file.read().decode("utf-8")

    if not report_text.strip():
        st.error(extract_error)
        st.stop()

    st.success(summary_success)

    # Reset answer and show_answer if report changes
    if st.session_state.last_report_text != report_text:
        st.session_state.answer = ""
        st.session_state.show_answer = False
        st.session_state.last_report_text = report_text

    # Summarize
    if st.button(summary_button):
        with st.spinner(summary_spinner):
            prompt = summary_prompt.format(report_text=report_text[:4000])
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=300
            )
            content = response.choices[0].message.content
            if content is None:
                st.error(summary_error)
            else:
                summary = content.strip()
                st.markdown(f"{summary_label}\n\n{summary}")

    # Q&A (stateless, no chat history)
    st.markdown(chat_divider)
    st.markdown(chat_label)

    user_input = st.text_input(chat_input, key="user_input")
    if st.button(chat_button, key="ask_button") and user_input:
        with st.spinner(chat_spinner):
            prompt = user_prompt.format(user_input=user_input)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt + report_text[:4000]},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=200
            )
            content = response.choices[0].message.content
            if content is None:
                st.error(chat_error)
                st.session_state.answer = ""
                st.session_state.show_answer = False
            else:
                answer = content.strip()
                st.session_state.answer = answer
                st.session_state.show_answer = True
        st.rerun()

    # Show only the latest answer if show_answer is True
    if st.session_state.get("show_answer") and st.session_state.get("answer"):
        st.markdown(f"{agent_label} {st.session_state['answer']}")
else:
    st.info(upload_info)
    st.session_state.answer = ""
    st.session_state.show_answer = False