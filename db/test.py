import os
from embedchain import App

os.environ["OPENAI_API_KEY"] = "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"

app = App()
app.add("https://www.forbes.com/profile/elon-musk")
app.add("https://en.wikipedia.org/wiki/Elon_Musk")
answer = app.query("What is the net worth of Elon Musk today?")
print(answer)
# Answer: The net worth of Elon Musk today is $258.7 billion.




