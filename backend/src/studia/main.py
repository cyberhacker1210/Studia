"""
Studia API - MAIN APPLICATION (CORRECTED & COMPLETE)
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List, Optional, Any, Dict
from datetime import datetime
import uuid
import traceback
import json
import os
import hashlib
import hmac
from supabase import create_client, Client

# --- IMPORTS LOCAUX ---
from .quiz_generator import quiz_generator_from_image, quiz_generator_from_text, extract_text
from .flashcard_generator import generate_flashcards
from .learning_path import (
    generate_mastery_path, # Fonction essentielle pour la Map
    evaluate_student_answer,
    generate_daily_plan,
    chat_with_tutor,
    generate_diagnostic_quiz,
    generate_remediation_content,
    generate_validation_quiz
)

app = FastAPI(title="Studia API", version="2.3.0")

# --- CONFIGURATION EXTERNE ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ Warning: Supabase keys not found.")

LEMON_WEBHOOK_SECRET = os.getenv("LEMON_WEBHOOK_SECRET")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# MODÈLES DE DONNÉES
# ==========================================

class ExtractTextRequest(BaseModel):
    images: List[str]

class ExtractTextResponse(BaseModel):
    totalImages: int
    pagesExtracted: int
    extractedText: str
    pages: List[Any]

class QuizGenerateFromTextRequest(BaseModel):
    course_text: str
    num_questions: int = 5
    difficulty: str = "medium"

class QuizGenerateRequest(BaseModel):
    image: str
    num_questions: int = 5
    difficulty: str = "medium"

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: int
    explanation: Optional[str] = ""

class QuizResponse(BaseModel):
    id: str
    questions: List[QuizQuestion]
    createdAt: str
    extractedText: Optional[str] = ""

class FlashcardGenerateRequest(BaseModel):
    course_text: str
    num_cards: int = 10
    difficulty: str = "medium"

class Flashcard(BaseModel):
    front: str
    back: str
    category: Optional[str] = "Général"
    difficulty: Optional[str] = "medium"

class FlashcardResponse(BaseModel):
    id: str
    flashcards: List[Flashcard]
    createdAt: str

# Modèle pour la CARTE du parcours (Map)
class MasteryRequest(BaseModel):
    course_text: str

# Modèles pour les étapes ADAPTATIVES
class DiagnosticRequest(BaseModel):
    course_text: str

class RemediationRequest(BaseModel):
    course_text: str
    weak_concepts: List[str]
    difficulty: int

class ValidationRequest(BaseModel):
    course_text: str
    concepts: List[str]
    difficulty: int

class LearningContentResponse(BaseModel):
    text: str
    flashcards: List[Dict[str, str]]

class QuizQuestionAdaptive(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str
    concept: str

class AdaptiveQuizResponse(BaseModel):
    questions: List[QuizQuestionAdaptive]

class EvaluateRequest(BaseModel):
    instruction: str
    student_answer: str
    course_context: str

class EvaluateResponse(BaseModel):
    is_correct: bool
    feedback: str
    score: int

class MotivationRequest(BaseModel):
    goal: str
    deadline: str
    current_xp: int = 0

class MotivationResponse(BaseModel):
    daily_message: str
    quote: str
    micro_tasks: List[dict]

class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    course_context: str

class ChatResponse(BaseModel):
    reply: str

# ==========================================
# ENDPOINTS
# ==========================================

@app.get("/")
def root():
    return {"status": "online", "version": "2.3.0"}

# --- 1. EXTRACTION ---
@app.post("/api/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(request: ExtractTextRequest):
    try:
        print(f"📸 Extracting from {len(request.images)} images")
        combined_text = ""
        pages = []

        def get_base64(uri): return uri.split("base64,")[1] if "base64," in uri else uri

        for i, img in enumerate(request.images):
            base64_img = get_base64(img)
            text = extract_text(base64_img)
            if not text: text = "[Texte illisible]"
            combined_text += text + "\n"
            pages.append({"pageNumber": i+1, "text": text, "wordCount": len(text.split())})

        return ExtractTextResponse(
            totalImages=len(request.images),
            pagesExtracted=len(pages),
            extractedText=combined_text,
            pages=pages
        )
    except Exception as e:
        print(f"❌ Error Extract: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

# --- 2. QUIZ ---
@app.post("/api/quiz/generate-from-text", response_model=QuizResponse)
async def generate_quiz_text(request: QuizGenerateFromTextRequest):
    try:
        quiz_data = quiz_generator_from_text(request.course_text, request.num_questions, request.difficulty, True)
        questions = [
            QuizQuestion(
                id=i+1, question=q.get("question"), options=q.get("options"),
                correctAnswer=q.get("correctAnswer"), explanation=q.get("explanation", "")
            ) for i, q in enumerate(quiz_data.get("questions", []))
        ]
        return QuizResponse(id=str(uuid.uuid4()), questions=questions, createdAt=datetime.now().isoformat(), extractedText=request.course_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quiz/generate-from-image", response_model=QuizResponse)
async def generate_quiz_image(request: QuizGenerateRequest):
    try:
        base64 = request.image.split("base64,")[1] if "base64," in request.image else request.image
        quiz_data = quiz_generator_from_image(base64, request.num_questions, request.difficulty, True)
        questions = [
            QuizQuestion(
                id=i+1, question=q.get("question"), options=q.get("options"),
                correctAnswer=q.get("correctAnswer"), explanation=q.get("explanation", "")
            ) for i, q in enumerate(quiz_data.get("questions", []))
        ]
        return QuizResponse(id=str(uuid.uuid4()), questions=questions, createdAt=datetime.now().isoformat(), extractedText=quiz_data.get("extractedText", ""))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. FLASHCARDS ---
@app.post("/api/flashcards/generate", response_model=FlashcardResponse)
async def generate_flashcards_endpoint(request: FlashcardGenerateRequest):
    try:
        data = generate_flashcards(request.course_text, request.num_cards, request.difficulty)
        cards = [Flashcard(front=c.get("front"), back=c.get("back"), category=c.get("category", "Général")) for c in data.get("flashcards", [])]
        return FlashcardResponse(id=str(uuid.uuid4()), flashcards=cards, createdAt=datetime.now().isoformat())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. PARCOURS (STRUCTURE & MAP) ---

# 👇 C'EST CET ENDPOINT QUI MANQUAIT
@app.post("/api/path/generate")
async def generate_path_endpoint(request: MasteryRequest):
    """Génère la structure des 3 modules (Map)"""
    try:
        print("⚡️ Generating Path Structure...")
        return generate_mastery_path(request.course_text)
    except Exception as e:
        print(f"❌ Error Path: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. PARCOURS (DÉTAILS ADAPTATIFS) ---

@app.post("/api/path/diagnostic", response_model=AdaptiveQuizResponse)
async def diagnostic_endpoint(request: DiagnosticRequest):
    try: return generate_diagnostic_quiz(request.course_text)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/remediation", response_model=LearningContentResponse)
async def remediation_endpoint(request: RemediationRequest):
    try: return generate_remediation_content(request.course_text, request.weak_concepts, request.difficulty)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/validation", response_model=AdaptiveQuizResponse)
async def validation_endpoint(request: ValidationRequest):
    try: return generate_validation_quiz(request.course_text, request.concepts, request.difficulty)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

# --- 6. AUTRES ---

@app.post("/api/path/evaluate", response_model=EvaluateResponse)
async def evaluate_answer_endpoint(request: EvaluateRequest):
    try: return evaluate_student_answer(request.instruction, request.student_answer, request.course_context)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/motivation/generate", response_model=MotivationResponse)
async def motivation_endpoint(request: MotivationRequest):
    try: return generate_daily_plan(request.goal, request.deadline, request.current_xp)
    except Exception as e: raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/tutor", response_model=ChatResponse)
async def chat_tutor_endpoint(request: ChatRequest):
    try:
        reply = chat_with_tutor(request.history, request.course_context)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 7. WEBHOOKS ---

@app.post("/api/webhook/lemon")
async def lemon_webhook(request: Request):
    if not LEMON_WEBHOOK_SECRET: return {"error": "No secret"}

    body = await request.body()
    signature = request.headers.get("X-Signature")
    expected = hmac.new(LEMON_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(signature, expected):
        raise HTTPException(401, "Invalid signature")

    data = await request.json()
    event = data.get("meta", {}).get("event_name")

    if event in ["order_created", "subscription_created"]:
        user_id = data.get("meta", {}).get("custom_data", {}).get("user_id")
        if user_id and supabase:
            supabase.table('users').update({'is_premium': True, 'energy': 999}).eq('id', user_id).execute()
            print(f"✅ Premium activé pour {user_id}")

    return {"received": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)