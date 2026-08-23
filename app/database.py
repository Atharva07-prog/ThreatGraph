from neo4j import GraphDatabase
from app.config import (COGNODB_URI, COGNODB_USERNAME, COGNODB_PASSWORD)


driver = GraphDatabase.driver(
    COGNODB_URI,
    auth=(COGNODB_USERNAME, COGNODB_PASSWORD)
)


def verify_connection():
    try:
        driver.verify_connectivity()
        return True
    except Exception as error:
        print(f"Database connection error: {error}")
        return False


def get_driver():
    return driver