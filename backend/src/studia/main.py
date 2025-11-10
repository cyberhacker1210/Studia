from . import quiz_generator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/generate_quiz")
def generate_quiz_endpoint():
    quiz_json = quiz_generator.create_quiz()
    return {"quiz": quiz_json}