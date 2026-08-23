import os
from dotenv import load_dotenv

load_dotenv()

COGNODB_URI = os.getenv("COGNODB_URL")
COGNODB_USERNAME = os.getenv("COGNODB_Username")
COGNODB_PASSWORD = os.getenv("COGNODB_Password")