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

# --- IMPORTS LOCAUX ---
# ✅ IMPORT CENTRALISÉ
from .database import supabase

from .quiz_generator import quiz_generator_from_image, quiz_generator_from_text, extract_text
from .flashcard_generator import generate_flashcards
from .learning_path import (
    generate_diagnostic_quiz,
    generate_remediation_content,
    generate_validation_quiz,
    generate_practice_exercise,
    evaluate_student_answer,
    chat_with_tutor,
    generate_daily_plan,
    generate_mastery_path
)
from .admin import router as admin_router

app = FastAPI(title="Studia API", version="2.6.1")

LEMON_WEBHOOK_SECRET = os.getenv("LEMON_WEBHOOK_SECRET")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELS ---
class ExtractTextRequest(BaseModel): images: List[str]
class ExtractTextResponse(BaseModel): totalImages: int; pagesExtracted: int; extractedText: str; pages: List[Any]
class QuizGenerateFromTextRequest(BaseModel): course_text: str; num_questions: int = 5; difficulty: str = "medium"
class QuizGenerateRequest(BaseModel): image: str; num_questions: int = 5; difficulty: str = "medium"
class QuizQuestion(BaseModel): id: int; question: str; options: List[str]; correctAnswer: int; explanation: Optional[str] = ""
class QuizResponse(BaseModel): id: str; questions: List[QuizQuestion]; createdAt: str; extractedText: Optional[str] = ""
class FlashcardGenerateRequest(BaseModel): course_text: str; num_cards: int = 10; difficulty: str = "medium"
class Flashcard(BaseModel): front: str; back: str; category: Optional[str] = "Général"; difficulty: Optional[str] = "medium"
class FlashcardResponse(BaseModel): id: str; flashcards: List[Flashcard]; createdAt: str

class CourseRequest(BaseModel): course_text: str
class RemediationRequest(BaseModel): course_text: str; weak_concepts: List[str]; difficulty: int
class ValidationRequest(BaseModel): course_text: str; concepts: List[str]; difficulty: int
class PracticeRequest(BaseModel): course_text: str; difficulty: str
class EvalRequest(BaseModel): instruction: str; student_answer: str; course_context: str
class EvaluateResponse(BaseModel): is_correct: bool; feedback: str; score: int; correction: str
class MotivationRequest(BaseModel): goal: str; deadline: str; current_xp: int = 0
class MotivationResponse(BaseModel): daily_message: str; quote: str; micro_tasks: List[dict]
class ChatRequest(BaseModel): message: str; history: List[dict]; course_context: str
class ChatResponse(BaseModel): reply: str
class MasteryRequest(BaseModel): course_text: str

# --- ENDPOINTS ---

@app.get("/")
def root(): return {"status": "online", "version": "2.6.1"}

# 1. EXTRACTION
@app.post("/api/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(request: ExtractTextRequest):
    try:
        print(f"📸 Extracting from {len(request.images)} images")
        combined_text = ""
        pages = []
        for i, img in enumerate(request.images):
            base64_img = img.split("base64,")[1] if "base64," in img else img
            text = extract_text(base64_img)
            if not text: text = "[Texte illisible]"
            combined_text += text + "\n"
            pages.append({"pageNumber": i+1, "text": text, "wordCount": len(text.split())})
        return ExtractTextResponse(totalImages=len(request.images), pagesExtracted=len(pages), extractedText=combined_text, pages=pages)
    except Exception as e:
        print(f"❌ Error Extract: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

# 2. QUIZ
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

# 3. FLASHCARDS
@app.post("/api/flashcards/generate", response_model=FlashcardResponse)
async def generate_flashcards_endpoint(request: FlashcardGenerateRequest):
    try:
        data = generate_flashcards(request.course_text, request.num_cards, request.difficulty)
        cards = [Flashcard(front=c.get("front"), back=c.get("back"), category=c.get("category", "Général")) for c in data.get("flashcards", [])]
        return FlashcardResponse(id=str(uuid.uuid4()), flashcards=cards, createdAt=datetime.now().isoformat())
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

# 4. PARCOURS ADAPTATIF
@app.post("/api/path/diagnostic")
async def diagnostic_endpoint(req: CourseRequest):
    try: return generate_diagnostic_quiz(req.course_text)
    except Exception as e: print(f"❌ {e}"); raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/remediation")
async def remediation_endpoint(req: RemediationRequest):
    try: return generate_remediation_content(req.course_text, req.weak_concepts, req.difficulty)
    except Exception as e: print(f"❌ {e}"); raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/validation")
async def validation_endpoint(req: ValidationRequest):
    try: return generate_validation_quiz(req.course_text, req.concepts, req.difficulty)
    except Exception as e: print(f"❌ {e}"); raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/practice")
async def practice_endpoint(req: PracticeRequest):
    try: return generate_practice_exercise(req.course_text, req.difficulty)
    except Exception as e: print(f"❌ {e}"); raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/evaluate", response_model=EvaluateResponse)
async def evaluate_answer_endpoint(req: EvalRequest):
    try: return evaluate_student_answer(req.instruction, req.student_answer, req.course_context)
    except Exception as e: print(f"❌ {e}"); raise HTTPException(status_code=500, detail=str(e))

# 5. AUTRES
@app.post("/api/motivation/generate", response_model=MotivationResponse)
async def motivation_endpoint(request: MotivationRequest):
    try: return generate_daily_plan(request.goal, request.deadline, request.current_xp)
    except Exception as e: print(f"❌ {e}"); raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/tutor", response_model=ChatResponse)
async def chat_tutor_endpoint(request: ChatRequest):
    try:
        reply = chat_with_tutor(request.history, request.course_context, request.message)
        return ChatResponse(reply=reply)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/generate")
async def path_generate_legacy(request: MasteryRequest):
    return generate_mastery_path(request.course_text)

# 6. ANALYTICS & ADMIN
app.include_router(admin_router, prefix="/api/analytics", tags=["Admin"])

# 7. WEBHOOKS
@app.post("/api/webhook/lemon")
async def lemon_webhook(request: Request):
    if not LEMON_WEBHOOK_SECRET: return {"error": "No secret"}
    body = await request.body()
    signature = request.headers.get("X-Signature")
    expected = hmac.new(LEMON_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected): raise HTTPException(401, "Invalid signature")
    data = await request.json()
    if data.get("meta", {}).get("event_name") in ["order_created", "subscription_created"]:
        user_id = data.get("meta", {}).get("custom_data", {}).get("user_id")
        if user_id and supabase:
            supabase.table('users').update({'is_premium': True, 'energy': 999}).eq('id', user_id).execute()
    return {"received": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)