"""
Studia API - FastAPI Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List, Optional, Any
from datetime import datetime
import uuid
import traceback

# Imports logique
from .quiz_generator import quiz_generator_from_image, quiz_generator_from_text, extract_text
from .flashcard_generator import generate_flashcards
from .learning_path import (
    generate_mastery_path,
    evaluate_student_answer,
    generate_daily_plan,
    chat_with_tutor
)

app = FastAPI(
    title="Studia API",
    description="AI-powered learning platform",
    version="1.0.0"
)

# ============================================
# CORS
# ============================================
origins = [
    "http://localhost:3000",
    "https://studia-app.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODELS
# ============================================

# --- Quiz & Flashcards ---
class QuizGenerateRequest(BaseModel):
    image: str
    num_questions: int = 5
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class QuizGenerateFromTextRequest(BaseModel):
    course_text: str
    num_questions: int = 5
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class FlashcardGenerateRequest(BaseModel):
    course_text: str
    num_cards: int = 10
    difficulty: Literal["easy", "medium", "hard"] = "medium"

class ExtractTextRequest(BaseModel):
    images: List[str]

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str

class Flashcard(BaseModel):
    front: str
    back: str
    category: str
    difficulty: str

class ExtractedPage(BaseModel):
    pageNumber: int
    text: str
    wordCount: int

class QuizResponse(BaseModel):
    id: str
    source: str
    difficulty: str
    questions: List[QuizQuestion]
    createdAt: str
    extractedText: str

class FlashcardResponse(BaseModel):
    id: str
    flashcards: List[Flashcard]
    createdAt: str

class ExtractTextResponse(BaseModel):
    totalImages: int
    pagesExtracted: int
    extractedText: str
    pages: List[ExtractedPage]

# --- 👇 NOUVEAUX MODELS CORRIGÉS ---

class MasteryRequest(BaseModel):
    course_text: str

# ✅ CORRECTION ICI : on attend "steps", pas "modules"
class MasteryResponse(BaseModel):
    steps: List[dict]

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

# ============================================
# HELPERS
# ============================================

def extract_base64_from_data_uri(data_uri: str) -> str:
    if "base64," in data_uri:
        return data_uri.split("base64,")[1]
    return data_uri

# ============================================
# ENDPOINTS
# ============================================

@app.get("/")
def root():
    return {"status": "running", "message": "Studia API is online 🚀"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(request: ExtractTextRequest):
    try:
        combined_text = ""
        pages = []
        for i, img in enumerate(request.images):
            base64_img = extract_base64_from_data_uri(img)
            text = extract_text(base64_img)
            combined_text += text + "\n"
            pages.append(ExtractedPage(pageNumber=i+1, text=text, wordCount=len(text.split())))

        return ExtractTextResponse(
            totalImages=len(request.images),
            pagesExtracted=len(pages),
            extractedText=combined_text,
            pages=pages
        )
    except Exception as e:
        print(f"Error extracting text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quiz/generate-from-text", response_model=QuizResponse)
async def generate_quiz_from_text_endpoint(request: QuizGenerateFromTextRequest):
    try:
        quiz_data = quiz_generator_from_text(
            course_text=request.course_text,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            enable_refinement=False
        )
        questions = []
        for i, q in enumerate(quiz_data["questions"]):
            questions.append(QuizQuestion(
                id=i+1,
                question=q["question"],
                options=q["options"],
                correctAnswer=q["correctAnswer"],
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
        print(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/flashcards/generate", response_model=FlashcardResponse)
async def generate_flashcards_endpoint(request: FlashcardGenerateRequest):
    try:
        data = generate_flashcards(request.course_text, request.num_cards, request.difficulty)
        cards = []
        for c in data["flashcards"]:
            cards.append(Flashcard(front=c["front"], back=c["back"], category=c.get("category", "General"), difficulty=c.get("difficulty", "medium")))

        return FlashcardResponse(
            id=str(uuid.uuid4()),
            flashcards=cards,
            createdAt=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# 👇 NOUVEAUX ENDPOINTS CORRIGÉS
# ============================================

@app.post("/api/path/generate", response_model=MasteryResponse)
async def generate_path_endpoint(request: MasteryRequest):
    """Génère le parcours guidé"""
    try:
        print("⚡️ Generating path...")
        path_data = generate_mastery_path(request.course_text)

        # ✅ SECURITÉ : On vérifie si 'steps' est dans la réponse, sinon on renvoie vide
        if "steps" not in path_data:
            # Fallback si l'IA a halluciné "modules" au lieu de "steps"
            if "modules" in path_data:
                print("⚠️ Warning: IA returned 'modules', converting to 'steps'")
                return MasteryResponse(steps=path_data["modules"])

            print("❌ Error: Invalid IA response format")
            return MasteryResponse(steps=[])

        return MasteryResponse(steps=path_data["steps"])

    except Exception as e:
        print(f"❌ Error generating path: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/path/evaluate", response_model=EvaluateResponse)
async def evaluate_answer_endpoint(request: EvaluateRequest):
    """Corrige une réponse du parcours"""
    try:
        result = evaluate_student_answer(request.instruction, request.student_answer, request.course_context)
        return EvaluateResponse(**result)
    except Exception as e:
        print(f"❌ Error evaluating: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/motivation/generate", response_model=MotivationResponse)
async def generate_motivation_endpoint(request: MotivationRequest):
    """Génère les tâches du jour"""
    try:
        plan_data = generate_daily_plan(request.goal, request.deadline, request.current_xp)
        return MotivationResponse(**plan_data)
    except Exception as e:
        print(f"❌ Error motivation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/tutor", response_model=ChatResponse)
async def chat_tutor_endpoint(request: ChatRequest):
    """Chat avec le Professeur IA"""
    try:
        reply = chat_with_tutor(request.history, request.course_context)
        return ChatResponse(reply=reply)
    except Exception as e:
        print(f"❌ Error chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)