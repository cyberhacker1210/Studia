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

from .learning_path import generate_mastery_path, generate_daily_plan, chat_with_tutor
from .quiz_generator import quiz_generator_from_image, quiz_generator_from_text, extract_text
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

class MasteryRequest(BaseModel):
    course_text: str

class MotivationRequest(BaseModel):
    goal: str
    deadline: str
    current_xp: int = 0

class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    course_context: str

class MasteryResponse(BaseModel):
    modules: List[dict]

class MotivationResponse(BaseModel):
    daily_message: str
    quote: str
    micro_tasks: List[dict]

class ChatResponse(BaseModel):
    reply: str

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


# ============================================
# HELPERS
# ============================================

def extract_base64_from_data_uri(data_uri: str) -> str:
    """Extract base64 data from data URI"""
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
            "/api/extract-text",
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


@app.post("/api/extract-text", response_model=ExtractTextResponse)
async def extract_text_endpoint(request: ExtractTextRequest):
    """Extract text from multiple images (for course capture)"""
    try:
        print("=" * 60)
        print(f"📸 EXTRACT TEXT REQUEST")
        print(f"   Images: {len(request.images)}")

        if not request.images or len(request.images) == 0:
            raise HTTPException(
                status_code=400,
                detail="Aucune image fournie"
            )

        if len(request.images) > 10:
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 images autorisées"
            )

        pages = []
        all_text = []

        for i, image_data in enumerate(request.images):
            print(f"   📄 Processing page {i + 1}/{len(request.images)}...")

            # Extract base64
            image_base64 = extract_base64_from_data_uri(image_data)
            image_size_mb = (len(image_base64) * 3 / 4) / (1024 * 1024)

            if image_size_mb > 10:
                raise HTTPException(
                    status_code=400,
                    detail=f"Image {i + 1} trop grande (max 10MB)"
                )

            # Extract text using the existing function
            page_text = extract_text(image_base64)

            if not page_text or len(page_text.strip()) < 5:
                print(f"      ⚠️ Warning: Page {i + 1} has little or no text")
                page_text = f"[Page {i + 1} - Aucun texte détecté]"

            word_count = len(page_text.split())

            pages.append(ExtractedPage(
                pageNumber=i + 1,
                text=page_text,
                wordCount=word_count
            ))

            all_text.append(f"\n--- PAGE {i + 1} ---\n{page_text}\n")
            print(f"      ✅ Extracted {word_count} words")

        combined_text = "\n".join(all_text)

        response = ExtractTextResponse(
            totalImages=len(request.images),
            pagesExtracted=len(pages),
            extractedText=combined_text,
            pages=pages
        )

        print(f"✅ SUCCESS: {len(pages)} pages extracted")
        print(f"   Total text: {len(combined_text)} characters")
        print("=" * 60)

        return response

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        traceback.print_exc()
        print("=" * 60)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/quiz/generate-from-image", response_model=QuizResponse)
async def generate_quiz_from_image_endpoint(request: QuizGenerateRequest):
    """Generate quiz from course image with self-refining"""
    try:
        print("=" * 60)
        print(f"📸 NEW QUIZ REQUEST (FROM IMAGE)")
        print(f"   Questions: {request.num_questions}")
        print(f"   Difficulty: {request.difficulty}")

        # Extract base64
        image_base64 = extract_base64_from_data_uri(request.image)
        image_size_mb = (len(image_base64) * 3 / 4) / (1024 * 1024)
        print(f"   Image size: {image_size_mb:.2f}MB")

        if image_size_mb > 10:
            raise HTTPException(status_code=400, detail="Image trop grande (max 10MB)")

        # ✅ Generate quiz with self-refining
        quiz_data = quiz_generator_from_image(
            image_base64=image_base64,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            enable_refinement=True
        )

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
            source="image",
            difficulty=request.difficulty,
            questions=questions,
            createdAt=datetime.now().isoformat(),
            extractedText=quiz_data.get("extractedText", "")
        )

        print(f"✅ SUCCESS: {len(questions)} questions + {len(quiz_data.get('extractedText', ''))} chars extracted")
        if "metadata" in quiz_data:
            print(f"   📊 Metadata:")
            print(f"      Text confidence: {quiz_data['metadata'].get('extraction', {}).get('confidence_score', 'N/A')}%")
            print(f"      Quiz quality: {quiz_data['metadata'].get('quiz_quality', {}).get('final_score', 'N/A')}%")
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
    """Generate quiz from course text with self-refining"""
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

        # ✅ Generate quiz with self-refining
        quiz_data = quiz_generator_from_text(
            course_text=request.course_text,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            enable_refinement=True
        )

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
        if "metadata" in quiz_data:
            print(f"   📊 Quiz quality: {quiz_data['metadata'].get('quiz_quality', {}).get('final_score', 'N/A')}%")
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
    """Generate flashcards from course text with self-refining"""
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

        # ✅ Generate flashcards with self-refining
        flashcards_data = generate_flashcards(
            course_text=request.course_text,
            num_cards=request.num_cards,
            difficulty=request.difficulty,
            enable_refinement=True
        )

        # Format response
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
        if "metadata" in flashcards_data:
            print(f"   📊 Quality score: {flashcards_data['metadata'].get('quality', {}).get('final_score', 'N/A')}%")
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
    print("   - POST /api/extract-text")
    print("   - POST /api/quiz/generate-from-image")
    print("   - POST /api/quiz/generate-from-text")
    print("   - POST /api/flashcards/generate")
    print("=" * 60)
    print("🔄 Self-refining: ENABLED")
    print("   ✓ Text extraction validation")
    print("   ✓ Quiz quality validation")
    print("   ✓ Flashcard quality validation")
    print("=" * 60 + "\n")


# ============================================
# NOUVEAUX ENDPOINTS (FEATURES V2)
# ============================================

@app.post("/api/path/generate", response_model=MasteryResponse)
async def generate_path_endpoint(request: MasteryRequest):
    """Génère le parcours guidé (Mode Maîtrise)"""
    try:
        if not request.course_text or len(request.course_text) < 10:
            raise HTTPException(status_code=400, detail="Texte du cours manquant")

        path_data = generate_mastery_path(request.course_text)
        return MasteryResponse(modules=path_data["modules"])
    except Exception as e:
        print(f"❌ Error generating path: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/motivation/generate", response_model=MotivationResponse)
async def generate_motivation_endpoint(request: MotivationRequest):
    """Génère le plan de motivation quotidien"""
    try:
        plan_data = generate_daily_plan(request.goal, request.deadline, request.current_xp)
        return MotivationResponse(**plan_data)
    except Exception as e:
        print(f"❌ Error generating motivation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/tutor", response_model=ChatResponse)
async def chat_tutor_endpoint(request: ChatRequest):
    """Chat avec le Professeur IA"""
    try:
        reply = chat_with_tutor(request.history, request.course_context)
        return ChatResponse(reply=reply)
    except Exception as e:
        print(f"❌ Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)