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

from .quiz_generator import quiz_generator_from_image

app = FastAPI(
    title="Studia API",
    description="AI-powered learning platform - Generate quizzes from course images",
    version="1.0.0"
)

# ============================================
# CORS Configuration
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://studia-seven.vercel.app",  # ← TON URL EXACTE
        "https://*.vercel.app",              # ← Wildcard pour les previews
        "*"    # Pour tous les déploiements Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# REQUEST/RESPONSE MODELS
# ============================================

class QuizGenerateRequest(BaseModel):
    image: str  # Base64 with or without data URI prefix
    num_questions: int = 5
    difficulty: Literal["easy", "medium", "hard"] = "medium"


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str


class QuizResponse(BaseModel):
    id: str
    source: str
    difficulty: str
    questions: List[QuizQuestion]
    createdAt: str


# ============================================
# HELPER FUNCTIONS
# ============================================

def extract_base64_from_data_uri(data_uri: str) -> str:
    """Extract base64 from data URI"""
    if "base64," in data_uri:
        return data_uri.split("base64,")[1]
    return data_uri


# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
def root():
    """API Root"""
    return {
        "message": "Studia API - Generate quizzes from course images 📸",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
def health():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/api/quiz/generate-from-image", response_model=QuizResponse)
async def generate_quiz_from_image_endpoint(request: QuizGenerateRequest):
    """Generate quiz from course image"""
    try:
        print("=" * 60)
        print(f"📸 NEW QUIZ REQUEST")
        print(f"   Questions: {request.num_questions}")
        print(f"   Difficulty: {request.difficulty}")

        # Extract base64
        image_base64 = extract_base64_from_data_uri(request.image)

        # Validate image size
        image_size_mb = (len(image_base64) * 3 / 4) / (1024 * 1024)
        print(f"   Image size: {image_size_mb:.2f}MB")

        if image_size_mb > 10:
            raise HTTPException(
                status_code=400,
                detail="Image trop grande. Taille maximale : 10MB"
            )

        # Generate quiz
        quiz_data = quiz_generator_from_image(
            image_base64=image_base64,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )

        # Format response
        quiz_id = str(uuid.uuid4())
        questions = []

        for i, q in enumerate(quiz_data["questions"]):
            questions.append(QuizQuestion(
                id=i + 1,
                question=q["question"],
                options=q["options"][:4],  # Ensure exactly 4
                correctAnswer=q["correctAnswer"],
                explanation=q.get("explanation", "")
            ))

        response = QuizResponse(
            id=quiz_id,
            source="image",
            difficulty=request.difficulty,
            questions=questions,
            createdAt=datetime.now().isoformat()
        )

        print(f"✅ SUCCESS: {len(questions)} questions generated")
        print("=" * 60)

        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération du quiz: {str(e)}"
        )


@app.on_event("startup")
async def startup_event():
    """Startup message"""
    print("\n" + "=" * 60)
    print("🚀 STUDIA API STARTED")
    print("=" * 60)
    print("📍 Endpoints disponibles:")
    print("   - GET  /")
    print("   - GET  /api/health")
    print("   - POST /api/quiz/generate-from-image")
    print("=" * 60 + "\n")