"""
Studia API - Main Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List, Optional, Any
import traceback

# Imports de ta logique
from .quiz_generator import quiz_generator_from_image, quiz_generator_from_text, extract_text
from .flashcard_generator import generate_flashcards
from .learning_path import (
    generate_mastery_path,
    evaluate_student_answer,
    generate_daily_plan,
    chat_with_tutor
)

app = FastAPI()

# CORS
origins = ["http://localhost:3000", "https://studia-app.vercel.app", "*"]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# --- MODELS ---
# (Garde tes anciens models Quiz/Flashcards/ExtractText ici...)

# NOUVEAUX MODELS PARCOURS
class MasteryRequest(BaseModel):
    course_text: str

class QuizItem(BaseModel):
    question: str
    options: List[str]
    correct_index: int

class PracticeTask(BaseModel):
    instruction: str
    xp: int

class MasteryResponse(BaseModel):
    learning_content: str
    quiz: List[QuizItem]
    practice_task: PracticeTask

class EvaluateRequest(BaseModel):
    instruction: str
    student_answer: str
    course_context: str

class EvaluateResponse(BaseModel):
    is_correct: bool
    feedback: str
    score: int

class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    course_context: str

class ChatResponse(BaseModel):
    reply: str

# (Garde le modèle MotivationRequest/Response ici...)
class MotivationRequest(BaseModel):
    goal: str
    deadline: str
    current_xp: int = 0

class MotivationResponse(BaseModel):
    daily_message: str
    quote: str
    micro_tasks: List[dict]

# --- ENDPOINTS ---
# (Garde tes endpoints /extract-text, /quiz, /flashcards ici...)

@app.post("/api/path/generate", response_model=MasteryResponse)
async def generate_path_endpoint(request: MasteryRequest):
    try:
        print("⚡️ Generating 3-step path...")
        data = generate_mastery_path(request.course_text)

        # Validation basique
        if "learning_content" not in data or "quiz" not in data:
             raise ValueError("Invalid AI response format")

        return MasteryResponse(**data)
    except Exception as e:
        print(f"❌ Error path: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/evaluate", response_model=EvaluateResponse)
async def evaluate_endpoint(request: EvaluateRequest):
    try:
        return evaluate_student_answer(request.instruction, request.student_answer, request.course_context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/tutor", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # Log pour debug
        print(f"💬 Chat msg: {request.message}")
        reply = chat_with_tutor(request.history, request.course_context)
        return ChatResponse(reply=reply)
    except Exception as e:
        print(f"❌ Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/motivation/generate", response_model=MotivationResponse)
async def motivation_endpoint(request: MotivationRequest):
    try:
        return generate_daily_plan(request.goal, request.deadline, request.current_xp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))