import os
# replace this with your OpenAI key
os.environ["OPENAI_API_KEY"] = "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"

from embedchain import App
app = App()
app.add("https://www.forbes.com/profile/elon-musk")
app.add("https://en.wikipedia.org/wiki/Elon_Musk")
app.query("What is the net worth of Elon Musk today?")
# Answer: The net worth of Elon Musk today is $258.7 billion.




