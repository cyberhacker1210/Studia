"""
Studia API - FastAPI Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal, List
from datetime import datetime
import uuid
import traceback
import json
import re

from .quiz_generator import quiz_generator_from_image, generate_quiz_mcq, clean_json_text
from .flashcard_generator import generate_flashcards

app = FastAPI(
    title="Studia API",
    description="AI-powered learning platform",
    version="1.0.0"
)

# ============================================
# CORS
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# MODELS
# ============================================

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
    return {
        "message": "Studia API - AI-powered learning platform 📸",
        "version": "1.0.0",
        "status": "running",
        "endpoints": [
            "/api/health",
            "/api/quiz/generate-from-image",
            "/api/quiz/generate-from-text",
            "/api/flashcards/generate"
        ]
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/quiz/generate-from-image", response_model=QuizResponse)
async def generate_quiz_from_image_endpoint(request: QuizGenerateRequest):
    """Generate quiz from course image"""
    try:
        print("=" * 60)
        print(f"📸 NEW QUIZ REQUEST (FROM IMAGE)")
        print(f"   Questions: {request.num_questions}")
        print(f"   Difficulty: {request.difficulty}")

        image_base64 = extract_base64_from_data_uri(request.image)
        image_size_mb = (len(image_base64) * 3 / 4) / (1024 * 1024)
        print(f"   Image size: {image_size_mb:.2f}MB")

        if image_size_mb > 10:
            raise HTTPException(status_code=400, detail="Image trop grande (max 10MB)")

        quiz_data = quiz_generator_from_image(
            image_base64=image_base64,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )

        quiz_id = str(uuid.uuid4())
        questions = []

        for i, q in enumerate(quiz_data["questions"]):
            questions.append(QuizQuestion(
                id=i + 1,
                question=q["question"],
                options=q["options"][:4],
                correctAnswer=q["correctAnswer"],
                explanation=q.get("explanation", "")
            ))

        response = QuizResponse(
            id=quiz_id,
            source="image",
            difficulty=request.difficulty,
            questions=questions,
            createdAt=datetime.now().isoformat(),
            extractedText=quiz_data.get("extractedText", "")
        )

        print(f"✅ SUCCESS: {len(questions)} questions + {len(quiz_data.get('extractedText', ''))} chars extracted")
        print("=" * 60)
        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quiz/generate-from-text", response_model=QuizResponse)
async def generate_quiz_from_text_endpoint(request: QuizGenerateFromTextRequest):
    """Generate quiz from course text"""
    try:
        print("=" * 60)
        print(f"📝 NEW QUIZ REQUEST (FROM TEXT)")
        print(f"   Questions: {request.num_questions}")
        print(f"   Difficulty: {request.difficulty}")
        print(f"   Text length: {len(request.course_text)} chars")

        if not request.course_text or len(request.course_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Le texte du cours est trop court ou vide"
            )

        # Generate quiz from text
        quiz_json = generate_quiz_mcq(
            request.course_text,
            request.num_questions,
            request.difficulty
        )

        # Clean and parse JSON
        quiz_json_clean = clean_json_text(quiz_json)
        quiz_data = json.loads(quiz_json_clean)

        # Validate structure
        if "questions" not in quiz_data:
            raise ValueError("Invalid quiz format: missing 'questions' key")

        if len(quiz_data["questions"]) != request.num_questions:
            print(f"⚠️ Warning: Expected {request.num_questions} questions, got {len(quiz_data['questions'])}")

        # Validate each question
        for i, q in enumerate(quiz_data["questions"]):
            if "question" not in q:
                raise ValueError(f"Question {i + 1}: missing 'question' field")
            if "options" not in q or len(q["options"]) != 4:
                raise ValueError(f"Question {i + 1}: must have exactly 4 options")
            if "correctAnswer" not in q:
                raise ValueError(f"Question {i + 1}: missing 'correctAnswer' field")
            if not (0 <= q["correctAnswer"] <= 3):
                raise ValueError(f"Question {i + 1}: correctAnswer must be 0-3")
            if "explanation" not in q:
                q["explanation"] = ""

        # Format response
        quiz_id = str(uuid.uuid4())
        questions = []

        for i, q in enumerate(quiz_data["questions"]):
            questions.append(QuizQuestion(
                id=i + 1,
                question=q["question"],
                options=q["options"][:4],
                correctAnswer=q["correctAnswer"],
                explanation=q.get("explanation", "")
            ))

        response = QuizResponse(
            id=quiz_id,
            source="text",
            difficulty=request.difficulty,
            questions=questions,
            createdAt=datetime.now().isoformat(),
            extractedText=request.course_text
        )

        print(f"✅ SUCCESS: {len(questions)} questions generated from text")
        print("=" * 60)
        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/flashcards/generate", response_model=FlashcardResponse)
async def generate_flashcards_endpoint(request: FlashcardGenerateRequest):
    """Generate flashcards from course text"""
    try:
        print("=" * 60)
        print(f"🎴 NEW FLASHCARDS REQUEST")
        print(f"   Cards: {request.num_cards}")
        print(f"   Difficulty: {request.difficulty}")
        print(f"   Text length: {len(request.course_text)} chars")

        if not request.course_text or len(request.course_text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Le texte du cours est trop court ou vide"
            )

        flashcards_data = generate_flashcards(
            course_text=request.course_text,
            num_cards=request.num_cards,
            difficulty=request.difficulty
        )

        flashcard_id = str(uuid.uuid4())
        flashcards = []

        for card in flashcards_data["flashcards"]:
            flashcards.append(Flashcard(
                front=card["front"],
                back=card["back"],
                category=card.get("category", "Général"),
                difficulty=card.get("difficulty", request.difficulty)
            ))

        response = FlashcardResponse(
            id=flashcard_id,
            flashcards=flashcards,
            createdAt=datetime.now().isoformat()
        )

        print(f"✅ SUCCESS: {len(flashcards)} flashcards generated")
        print("=" * 60)
        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(status_code=500, detail=str(e))


@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 60)
    print("🚀 STUDIA API STARTED")
    print("=" * 60)
    print("📍 Endpoints disponibles:")
    print("   - GET  /")
    print("   - GET  /api/health")
    print("   - POST /api/quiz/generate-from-image")
    print("   - POST /api/quiz/generate-from-text")
    print("   - POST /api/flashcards/generate")
    print("=" * 60 + "\n")