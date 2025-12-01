"""
Studia API - MAIN APPLICATION (VERSION ROBUSTE & COMPLETE)
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
    generate_mastery_path,
    evaluate_student_answer,
    generate_daily_plan,
    chat_with_tutor,
    generate_diagnostic_quiz,
    generate_remediation_content,
    generate_validation_quiz
)

app = FastAPI(title="Studia API", version="2.2.0")

# --- CONFIGURATION EXTERNE ---
# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("⚠️ Warning: Supabase keys not found in environment variables.")

# Webhooks
LEMON_WEBHOOK_SECRET = os.getenv("LEMON_WEBHOOK_SECRET")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# --- CORS ---
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# MODÈLES DE DONNÉES (Pydantic)
# ==========================================

# 1. Extraction
class ExtractTextRequest(BaseModel):
    images: List[str]

class ExtractedPage(BaseModel):
    pageNumber: int
    text: str
    wordCount: int

class ExtractTextResponse(BaseModel):
    totalImages: int
    pagesExtracted: int
    extractedText: str
    pages: List[ExtractedPage]

# 2. Quiz Classique
class QuizGenerateRequest(BaseModel):
    image: str
    num_questions: int = 5
    difficulty: str = "medium"

class QuizGenerateFromTextRequest(BaseModel):
    course_text: str
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

# 3. Flashcards
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

# 4. Mode Parcours (Classique)
class MasteryRequest(BaseModel):
    course_text: str

class PathFlashcard(BaseModel):
    front: str
    back: str

class QuizItem(BaseModel):
    question: str
    options: List[str]
    correct_index: int

class PracticeTask(BaseModel):
    instruction: str
    xp: int

class MasteryResponse(BaseModel):
    learning_content: Optional[str] = "Contenu en cours de génération..."
    flashcards: Optional[List[PathFlashcard]] = []
    quiz: Optional[List[QuizItem]] = []
    practice_task: Optional[PracticeTask] = None

# 5. Mode Parcours ADAPTATIF (Nouveau)
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

# 6. Autres
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
# HELPERS
# ==========================================
def extract_base64_from_data_uri(data_uri: str) -> str:
    if "base64," in data_uri:
        return data_uri.split("base64,")[1]
    return data_uri

# ==========================================
# ENDPOINTS
# ==========================================

@app.get("/")
def root():
    return {"status": "online", "version": "2.2.0"}

# --- 1. EXTRACTION ---
@app.post("/api/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(request: ExtractTextRequest):
    try:
        print(f"📸 Extracting from {len(request.images)} images")
        combined_text = ""
        pages = []
        for i, img in enumerate(request.images):
            base64_img = extract_base64_from_data_uri(img)
            text = extract_text(base64_img)
            if not text: text = "[Texte illisible]"
            combined_text += text + "\n"
            pages.append(ExtractedPage(pageNumber=i+1, text=text, wordCount=len(text.split())))

        return ExtractTextResponse(
            totalImages=len(request.images),
            pagesExtracted=len(pages),
            extractedText=combined_text,
            pages=pages
        )
    except Exception as e:
        print(f"❌ Error Extract: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

# --- 2. QUIZ ---
@app.post("/api/quiz/generate-from-text", response_model=QuizResponse)
async def generate_quiz_from_text_endpoint(request: QuizGenerateFromTextRequest):
    try:
        print("📝 Generating Quiz...")
        quiz_data = quiz_generator_from_text(
            course_text=request.course_text,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            enable_refinement=True
        )

        questions = []
        for i, q in enumerate(quiz_data.get("questions", [])):
            questions.append(QuizQuestion(
                id=i+1,
                question=q.get("question", "Erreur question"),
                options=q.get("options", ["A", "B"]),
                correctAnswer=q.get("correctAnswer", 0),
                explanation=q.get("explanation", "")
            ))

        return QuizResponse(
            id=str(uuid.uuid4()),
            source="text",
            difficulty=request.difficulty,
            questions=questions,
            createdAt=datetime.now().isoformat(),
            extractedText=request.course_text
        )
    except Exception as e:
        print(f"❌ Error Quiz: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. FLASHCARDS ---
@app.post("/api/flashcards/generate", response_model=FlashcardResponse)
async def generate_flashcards_endpoint(request: FlashcardGenerateRequest):
    try:
        print("🎴 Generating Flashcards...")
        data = generate_flashcards(request.course_text, request.num_cards, request.difficulty)
        cards = []
        for c in data.get("flashcards", []):
            cards.append(Flashcard(
                front=c.get("front", ""),
                back=c.get("back", ""),
                category=c.get("category", "Général"),
                difficulty=c.get("difficulty", "medium")
            ))

        return FlashcardResponse(
            id=str(uuid.uuid4()),
            flashcards=cards,
            createdAt=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"❌ Error Flashcards: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. PARCOURS (ADAPTATIF) ---

@app.post("/api/path/diagnostic", response_model=AdaptiveQuizResponse)
async def diagnostic_endpoint(request: DiagnosticRequest):
    try:
        return generate_diagnostic_quiz(request.course_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/remediation", response_model=LearningContentResponse)
async def remediation_endpoint(request: RemediationRequest):
    try:
        return generate_remediation_content(request.course_text, request.weak_concepts, request.difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/validation", response_model=AdaptiveQuizResponse)
async def validation_endpoint(request: ValidationRequest):
    try:
        return generate_validation_quiz(request.course_text, request.concepts, request.difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. AUTRES (Chat, Motivation) ---

@app.post("/api/path/evaluate", response_model=EvaluateResponse)
async def evaluate_answer_endpoint(request: EvaluateRequest):
    try:
        return evaluate_student_answer(request.instruction, request.student_answer, request.course_context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/motivation/generate", response_model=MotivationResponse)
async def generate_motivation_endpoint(request: MotivationRequest):
    try:
        return generate_daily_plan(request.goal, request.deadline, request.current_xp)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/tutor", response_model=ChatResponse)
async def chat_tutor_endpoint(request: ChatRequest):
    try:
        reply = chat_with_tutor(request.history, request.course_context)
        return ChatResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 6. WEBHOOKS PAIEMENT ---

@app.post("/api/webhook/lemon")
async def lemon_webhook(request: Request):
    if not LEMON_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    raw_body = await request.body()
    signature = request.headers.get("X-Signature")

    expected_signature = hmac.new(
        LEMON_WEBHOOK_SECRET.encode(),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    if not signature or not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    data = await request.json()
    event_name = data.get("meta", {}).get("event_name")

    if event_name in ["order_created", "subscription_created"]:
        custom_data = data.get("meta", {}).get("custom_data", {})
        user_id = custom_data.get("user_id")

        if user_id and supabase:
            print(f"🍋 Paiement reçu pour user : {user_id}")
            try:
                supabase.table('users').update({
                    'is_premium': True,
                    'plan_type': 'premium',
                    'energy': 999
                }).eq('id', user_id).execute()
                print("✅ Premium activé")
            except Exception as e:
                print(f"❌ Erreur Supabase: {e}")

    return {"received": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)