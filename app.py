import os
from embedchain import App

os.environ["REPLICATE_AP_TOKEN"] = "r8_IWpChdyOSMpLXUehqeeXLKQSp0fiZUI3s7Eco"

app = App.from_config(config_path="config.yaml")

app.add("https://www.forbes.com/profile/elon-musk")
app.add("https://en.wikipedia.org/wiki/Elon_Musk")
app.query("What is the net worth of Elon Musk today?")
# Answer: The net worth of Elon Musk today is $258.7 billion.




