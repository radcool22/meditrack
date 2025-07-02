import streamlit as st
import pdfplumber
from openai import OpenAI
import os

# Set your OpenAI API key here or as an environment variable
# OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "YOUR_OPENAI_KEY")
OPENAI_API_KEY = ""
client = OpenAI(api_key=OPENAI_API_KEY)

st.title("मेडिकल रिपोर्ट हिंदी चैटबोट 🤖")

# Upload medical report
uploaded_file = st.file_uploader("अपनी मेडिकल रिपोर्ट (PDF या TXT) अपलोड करें", type=["pdf", "txt"])

if uploaded_file:
    if uploaded_file.type == "application/pdf":
        with pdfplumber.open(uploaded_file) as pdf:
            report_text = ""
            for page in pdf.pages:
                report_text += page.extract_text() or ""
    else:
        report_text = uploaded_file.read().decode("utf-8")

    if not report_text.strip():
        st.error("रिपोर्ट से कोई टेक्स्ट नहीं निकला। कृपया सही फाइल अपलोड करें।")
        st.stop()

    st.success("रिपोर्ट सफलतापूर्वक अपलोड हो गई!")

    # Summarize in Hindi
    if st.button("रिपोर्ट का हिंदी में सारांश प्राप्त करें"):
        with st.spinner("सारांश तैयार किया जा रहा है..."):
            prompt = (
                "नीचे एक अंग्रे़ी मेडिकल रिपोर्ट है। कृपया इसका संक्षिप्त सारांश हिंदी में दें:\n\n"
                f"{report_text[:4000]}"
            )
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a medical assistant who summarizes and answers in Hindi."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=300
            )
            content = response.choices[0].message.content
            if content is None:
                st.error("OpenAI API ने कोई सारांश नहीं लौटाया।")
            else:
                summary = content.strip()
                st.markdown(f"**रिपोर्ट का सारांश:**\n\n{summary}")

    # Chat in Hindi
    st.markdown("---")
    st.markdown("### रिपोर्ट से संबंधित कोई भी सवाल हिंदी में पूछें:")

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = [
            {"role": "system", "content": "You are a helpful medical assistant who answers in Hindi. The user will ask questions in Hindi about the following English medical report:\n\n" + report_text[:4000]}
        ]

    user_input = st.text_input("अपना सवाल लिखें...", key="user_input")
    if st.button("भेजें") and user_input:
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        with st.spinner("उत्तर तैयार किया जा रहा है..."):
            # Ensure chat_history is a list of dicts with only 'role' and 'content' keys, both as strings
            messages = [
                {"role": str(msg["role"]), "content": str(msg["content"])}
                for msg in st.session_state.chat_history
                if (
                    isinstance(msg, dict)
                    and set(msg.keys()) == {"role", "content"}
                    and isinstance(msg["role"], str)
                    and isinstance(msg["content"], str)
                )
            ]
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,  # type: ignore
                temperature=0.7,
                max_tokens=200
            )
            content = response.choices[0].message.content
            if content is None:
                st.error("OpenAI API ने कोई उत्तर नहीं लौटाया।")
            else:
                answer = content.strip()
                st.session_state.chat_history.append({"role": "assistant", "content": answer})
                st.markdown(f"**एजेंट:** {answer}")

    # Show chat history
    for msg in st.session_state.chat_history[1:]:
        if msg["role"] == "user":
            st.markdown(f"**आप:** {msg['content']}")
        else:
            st.markdown(f"**एजेंट:** {msg['content']}")

else:
    st.info("कृपया पहले अपनी मेडिकल रिपोर्ट अपलोड करें।")