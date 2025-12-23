"""
Studia API - MAIN APPLICATION
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List, Optional, Any, Dict
from datetime import datetime
import uuid
import os
import hashlib
import hmac
from .database import supabase
from .quiz_generator import quiz_generator_from_image, quiz_generator_from_text, extract_text
from .flashcard_generator import generate_flashcards
from .learning_path import *
from .admin import router as admin_router
from .notifications import router as notif_router

app = FastAPI(title="Studia API", version="2.9.0")

LEMON_WEBHOOK_SECRET = os.getenv("LEMON_WEBHOOK_SECRET")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "x-admin-password", "content-type", "authorization"],
)

# --- formulaire d echange
class ExtractTextRequest(BaseModel):
        images: List[str]

class ExtractTextResponse(BaseModel):
        totalImages: int;
        pagesExtracted: int;
        extractedText: str;
        pages: List[Any]

class QuizGenerateFromTextRequest(BaseModel):
        course_text: str;
        num_questions: (int) = 5;
        difficulty: str = "medium"

class QuizGenerateRequest(BaseModel):
        image: str;
        num_questions: int = 5;
        difficulty: str = "medium"

class QuizQuestion(BaseModel):
        id: int;
        question: str;
        options: List[str];
        correctAnswer: int;
        explanation: Optional[str] = ""

class QuizResponse(BaseModel):
        id: str;
        questions: List[QuizQuestion];
        createdAt: str;
        extractedText: Optional[str] = ""

class FlashcardGenerateRequest(BaseModel):
        course_text: str;
        num_cards: int = 10;
        difficulty: str = "medium"

class Flashcard(BaseModel):
        front: str;
        back: str;
        category: Optional[str] = "Général";
        difficulty: Optional[str] = "medium"

class FlashcardResponse(BaseModel):
        id: str;
        flashcards: List[Flashcard];
        createdAt: str

class CourseRequest(BaseModel):
        course_text: str

class RemediationRequest(BaseModel):
        course_text: str;
        weak_concepts: List[str];
        difficulty: int

class ValidationRequest(BaseModel):
        course_text: str;
        concepts: List[str];
        difficulty: int

class PracticeRequest(BaseModel):
        course_text: str;
        difficulty: str

class EvalRequest(BaseModel):
        instruction: str;
        student_answer: str;
        course_context: str

class EvaluateResponse(BaseModel):
        is_correct: bool;
        feedback: str;
        score: int;
        correction: str

class MotivationRequest(BaseModel):
        goal: str;
        deadline: str;
        current_xp: int = 0

class MotivationResponse(BaseModel):
        daily_message: str;
        quote: str;
        micro_tasks: List[dict]

class ChatRequest(BaseModel):
        message: str;
        history: List[dict];
        course_context: str

class ChatResponse(BaseModel):
        reply: str

class MasteryRequest(BaseModel):
        course_text: str;
        subject: str = "Général"

class StepRequest(BaseModel):
        step_type: str;
        course_text: str;
        subject: str

class SummaryRequest(BaseModel):
        course_text: str;
        subject: str

class StartRequest(BaseModel):
    course_text: str
    subject: str

class AnalyzeRequest(BaseModel):
    student_answer: str
    question: str
    expected_points: List[str]

class PracticeRequest(BaseModel):
    course_text: str
    weak_concepts: List[str]

class ExamRequest(BaseModel):
    course_text: str



# --- ENDPOINTS ---

@app.get("/")
def root(): return {"status": "online", "version": "2.9.0"}

@app.post("/api/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(request: ExtractTextRequest):
    try:
        combined_text = ""
        pages = []
        for i, img in enumerate(request.images):
            base64_img = img.split("base64,")[1] if "base64," in img else img
            text = extract_text(base64_img)
            combined_text += text + "\n"
            pages.append({"pageNumber": i+1, "text": text, "wordCount": len(text.split())})
        return ExtractTextResponse(totalImages=len(request.images), pagesExtracted=len(pages), extractedText=combined_text, pages=pages)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quiz/generate-from-text", response_model=QuizResponse)
async def generate_quiz_text(request: QuizGenerateFromTextRequest):
    try:
        quiz_data = quiz_generator_from_text(request.course_text, request.num_questions, request.difficulty, True)
        questions = [QuizQuestion(id=i+1, question=q.get("question"), options=q.get("options"), correctAnswer=q.get("correctAnswer", q.get("correct_index", 0)), explanation=q.get("explanation", "")) for i, q in enumerate(quiz_data.get("questions", []))]
        return QuizResponse(id=str(uuid.uuid4()), questions=questions, createdAt=datetime.now().isoformat(), extractedText=request.course_text)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quiz/generate-from-image", response_model=QuizResponse)
async def generate_quiz_image(request: QuizGenerateRequest):
    try:
        base64 = request.image.split("base64,")[1] if "base64," in request.image else request.image
        quiz_data = quiz_generator_from_image(base64, request.num_questions, request.difficulty, True)
        questions = [QuizQuestion(id=i+1, question=q.get("question"), options=q.get("options"), correctAnswer=q.get("correctAnswer", q.get("correct_index", 0)), explanation=q.get("explanation", "")) for i, q in enumerate(quiz_data.get("questions", []))]
        return QuizResponse(id=str(uuid.uuid4()), questions=questions, createdAt=datetime.now().isoformat(), extractedText=quiz_data.get("extractedText", ""))
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/flashcards/generate", response_model=FlashcardResponse)
async def generate_flashcards_endpoint(request: FlashcardGenerateRequest):
    try:
        data = generate_flashcards(request.course_text, request.num_cards, request.difficulty)
        cards = [Flashcard(front=c.get("front"), back=c.get("back"), category=c.get("category", "Général")) for c in data.get("flashcards", [])]
        return FlashcardResponse(id=str(uuid.uuid4()), flashcards=cards, createdAt=datetime.now().isoformat())
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/diagnostic")
async def diagnostic_endpoint(req: CourseRequest): return generate_diagnostic_quiz(req.course_text)

@app.post("/api/path/remediation")
async def remediation_endpoint(req: RemediationRequest): return generate_remediation_content(req.course_text, req.weak_concepts, req.difficulty)

@app.post("/api/path/validation")
async def validation_endpoint(req: ValidationRequest): return generate_validation_quiz(req.course_text, req.concepts, req.difficulty)

@app.post("/api/path/practice")
async def practice_endpoint(req: PracticeRequest): return generate_practice_exercise(req.course_text, req.difficulty)

@app.post("/api/path/evaluate", response_model=EvaluateResponse)
async def evaluate_answer_endpoint(req: EvalRequest): return evaluate_student_answer(req.instruction, req.student_answer, req.course_context)

@app.post("/api/motivation/generate", response_model=MotivationResponse)
async def motivation_endpoint(request: MotivationRequest): return generate_daily_plan(request.goal, request.deadline, request.current_xp)

@app.post("/api/chat/tutor", response_model=ChatResponse)
async def chat_tutor_endpoint(request: ChatRequest): return ChatResponse(reply=chat_with_tutor(request.history, request.course_context, request.message))

@app.post("/api/path/generate")
async def path_generate_endpoint(request: MasteryRequest): return generate_mastery_path(request.course_text, request.subject)

@app.post("/api/path/step")
async def step_content_endpoint(req: StepRequest): return generate_step_content(req.step_type, req.course_text, req.subject)


# ✅ NOUVEAU ENDPOINT FICHE
@app.post("/api/path/summary")
async def summary_endpoint(req: SummaryRequest): return generate_summary_sheet(req.course_text, req.subject)

app.include_router(admin_router, prefix="/api/analytics", tags=["Admin"])
app.include_router(notif_router, prefix="/api/notifications", tags=["Notifications"])

@app.post("/api/webhook/lemon")
async def lemon_webhook(request: Request):
    if not LEMON_WEBHOOK_SECRET: return {"error": "No secret"}
    data = await request.json()
    if data.get("meta", {}).get("event_name") in ["order_created", "subscription_created"]:
        user_id = data.get("meta", {}).get("custom_data", {}).get("user_id")
        if user_id and supabase: supabase.table('users').update({'is_premium': True, 'energy': 999}).eq('id', user_id).execute()
    return {"received": True}

@app.post("/api/adaptive/start")
def api_start_adaptive(request: StartRequest):
    # Appelle ta fonction orchestrateur
    result = start_adaptive_learning(request.course_text, request.subject)
    return result

@app.post("/api/adaptive/analyze")
def api_analyze_answer(request: AnalyzeRequest):
    return analyze_student_answer(
        request.student_answer,
        request.question,
        request.expected_points
    )

@app.post("/api/adaptive/practice")
def api_generate_practice(request: PracticeRequest):
    return generate_progressive_practice(
        request.course_text,
        request.weak_concepts
    )

@app.post("/api/adaptive/exam")
def api_generate_exam(request: ExamRequest):
    return generate_exam_simulation(request.course_text)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)