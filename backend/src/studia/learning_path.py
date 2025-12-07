import json
import os
from typing import List, Literal
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- MODÈLES DE DONNÉES (STRUCTURED OUTPUTS) ---

class QuizQuestionAdaptive(BaseModel):
    question: str = Field(description="La question posée.")
    options: List[str] = Field(description="4 choix de réponse.", min_length=4, max_length=4)
    correct_index: int = Field(description="Index de la bonne réponse (0-3).")
    explanation: str = Field(description="Explication pédagogique.")
    concept: str = Field(description="Le concept clé testé par cette question.")


class DiagnosticResult(BaseModel):
    questions: List[QuizQuestionAdaptive]


class RemediationContent(BaseModel):
    summary: str = Field(description="Un cours court et ciblé sur les points faibles (Markdown).")
    flashcards: List[dict] = Field(description="Liste de flashcards {front, back}.")


class PracticeExercise(BaseModel):
    instruction: str = Field(description="L'énoncé de l'exercice.")
    context: str = Field(description="Contexte ou données nécessaires.")
    difficulty: Literal['easy', 'hard']


class EvaluationResult(BaseModel):
    is_correct: bool = Field(description="Si la réponse est satisfaisante.")
    score: int = Field(description="Note sur 100.")
    feedback: str = Field(description="Feedback détaillé.")
    correction: str = Field(description="La réponse idéale.")


# Modèles pour la motivation (Ce qui manquait)
class MicroTask(BaseModel):
    id: int
    task: str = Field(description="Tâche courte et concrète.")
    xp_reward: int


class DailyPlan(BaseModel):
    daily_message: str = Field(description="Message court et motivant.")
    quote: str = Field(description="Citation inspirante.")
    micro_tasks: List[MicroTask]


# --- FONCTIONS ---

def generate_diagnostic_quiz(course_text: str) -> dict:
    """ÉTAPE 1 : Génère un quiz diagnostique."""
    print("🧬 Génération Diagnostic...")
    prompt = "Tu es un évaluateur. Crée un quiz diagnostique de 10 questions couvrant le cours."

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": course_text[:20000]}
        ],
        response_format=DiagnosticResult,
    )
    return completion.choices[0].message.parsed.model_dump()


def generate_remediation_content(course_text: str, weak_concepts: List[str], difficulty: int = 1) -> dict:
    """ÉTAPE 2 : Contenu de rattrapage."""
    print(f"💊 Génération Remédiation pour : {weak_concepts}")
    prompt = f"L'élève a échoué sur : {', '.join(weak_concepts)}. Crée un cours de rattrapage et des flashcards."

    class RemediationSchema(BaseModel):
        text: str = Field(description="Le cours de rattrapage en Markdown.")
        flashcards: List[dict] = Field(description="Liste de {front: str, back: str}")

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": course_text[:20000]}
        ],
        response_format=RemédiationSchema,
    )
    # Mapping pour correspondre au format attendu par le front (summary vs text)
    data = completion.choices[0].message.parsed.model_dump()
    return {"summary": data["text"], "flashcards": data["flashcards"]}


def generate_validation_quiz(course_text: str, concepts: List[str], difficulty: int) -> dict:
    """ÉTAPE 3 : Quiz de validation."""
    print("🎯 Génération Quiz Validation...")
    prompt = f"Crée un quiz de 5 questions CIBLÉES sur : {', '.join(concepts)}. Difficulté: {difficulty}/3."

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": course_text[:20000]}
        ],
        response_format=DiagnosticResult,
    )
    return completion.choices[0].message.parsed.model_dump()


def generate_practice_exercise(course_text: str, difficulty: str) -> dict:
    """ÉTAPE 4 : Exercice pratique."""
    print(f"🏋️ Génération Exercice ({difficulty})...")
    prompt = f"Crée un exercice pratique type 'Cas concret'. Difficulté : {difficulty}."

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": course_text[:20000]}
        ],
        response_format=PracticeExercise,
    )
    return completion.choices[0].message.parsed.model_dump()


def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    """ÉTAPE 5 : Correction."""
    print("📝 Correction Exercice...")
    prompt = "Tu es un prof correcteur. Évalue la réponse."

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": f"CTX: {course_context[:5000]}\nQ: {instruction}\nR: {student_answer}"}
        ],
        response_format=EvaluationResult,
    )
    return completion.choices[0].message.parsed.model_dump()


def chat_with_tutor(history: list, course_context: str, current_message: str) -> str:
    """Chatbot Tuteur."""
    messages = [{"role": "system", "content": f"Tu es un tuteur. Aide sur ce cours : {course_context[:5000]}."}]
    for msg in history[-6:]: messages.append(msg)
    messages.append({"role": "user", "content": current_message})

    res = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
    return res.choices[0].message.content


# ✅ LA FONCTION MANQUANTE QUI FAISAIT PLANTER LE BUILD
def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    """Génère un plan de motivation quotidien."""
    print("🚀 Génération Plan Motivation...")
    prompt = f"""Tu es un coach productivité. Objectif élève: "{goal}" pour le {deadline}.
    Crée un plan d'action pour AUJOURD'HUI avec 3-5 micro-tâches."""

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": prompt}],
        response_format=DailyPlan,
    )
    return completion.choices[0].message.parsed.model_dump()


# Stub pour l'ancienne fonction si jamais appelée ailleurs (sécurité)
def generate_mastery_path(t): return {"modules": []}