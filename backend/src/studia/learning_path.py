import json
import os
from typing import List, Literal
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- MODÈLES DE DONNÉES (STRUCTURED OUTPUTS) ---

class Concept(BaseModel):
    name: str = Field(description="Nom du concept clé évalué.")


class QuizQuestionAdaptive(BaseModel):
    question: str = Field(description="La question posée.")
    options: List[str] = Field(description="4 choix de réponse.", min_length=4, max_length=4)
    correct_index: int = Field(description="Index de la bonne réponse (0-3).")
    explanation: str = Field(description="Explication pédagogique.")
    concept: str = Field(description="Le concept clé testé par cette question (ex: 'Loi de l'offre', 'Cellule').")


class DiagnosticResult(BaseModel):
    questions: List[QuizQuestionAdaptive]


class RemediationContent(BaseModel):
    summary: str = Field(description="Un cours court et ciblé sur les points faibles (Markdown).")
    flashcards: List[dict] = Field(description="Liste de flashcards {front, back} pour mémoriser ces points.")


class PracticeExercise(BaseModel):
    instruction: str = Field(description="L'énoncé de l'exercice (cas pratique, problème, rédaction).")
    context: str = Field(description="Contexte ou données nécessaires pour répondre.")
    difficulty: Literal['easy', 'hard']


class EvaluationResult(BaseModel):
    is_correct: bool = Field(description="Si la réponse est globalement satisfaisante.")
    score: int = Field(description="Note sur 100.")
    feedback: str = Field(description="Feedback détaillé et constructif.")
    correction: str = Field(description="La réponse idéale attendue.")


# --- FONCTIONS ---

def generate_diagnostic_quiz(course_text: str) -> dict:
    """ÉTAPE 1 : Génère un quiz large pour tester tous les aspects du cours."""
    print("🧬 Génération Diagnostic...")

    prompt = "Tu es un évaluateur. Crée un quiz diagnostique de 10 questions couvrant TOUT le cours pour identifier les lacunes."

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
    """ÉTAPE 2 : Génère du contenu spécifique sur les points faibles."""
    print(f"💊 Génération Remédiation pour : {weak_concepts}")

    prompt = f"""L'élève a échoué sur ces concepts : {', '.join(weak_concepts)}.
    Crée un module de rattrapage :
    1. Un résumé clair expliquant CES concepts spécifiques.
    2. Des flashcards pour mémoriser CES concepts.
    Niveau de profondeur : {difficulty}/3.
    """

    # On utilise un schéma ad-hoc pour structurer la réponse
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
    return completion.choices[0].message.parsed.model_dump()


def generate_validation_quiz(course_text: str, concepts: List[str], difficulty: int) -> dict:
    """ÉTAPE 3 : Quiz ciblé et plus dur sur les concepts revus."""
    print("🎯 Génération Quiz Validation...")

    level_desc = "facile" if difficulty == 1 else "intermédiaire" if difficulty == 2 else "très difficile/piégeux"

    prompt = f"""Crée un quiz de 5 questions TRÈS CIBLÉES sur ces concepts : {', '.join(concepts)}.
    Niveau : {level_desc}.
    Le but est de vérifier la maîtrise totale."""

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": course_text[:20000]}
        ],
        response_format=DiagnosticResult,  # On réutilise la structure de quiz
    )
    return completion.choices[0].message.parsed.model_dump()


def generate_practice_exercise(course_text: str, difficulty: str) -> dict:
    """ÉTAPE 4 & 6 : Génère un exercice pratique (Facile ou Difficile)."""
    print(f"🏋️ Génération Exercice ({difficulty})...")

    prompt = f"""Crée un exercice pratique de type 'Cas concret' ou 'Problème à résoudre' basé sur ce cours.
    Difficulté : {difficulty}.
    L'exercice doit demander de la réflexion et de la rédaction, pas juste un QCM."""

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
    """ÉTAPE 5 : Correction et Feedback."""
    print("📝 Correction Exercice...")

    prompt = """Tu es un prof correcteur. Évalue la réponse de l'étudiant par rapport à l'énoncé et au cours.
    Sois bienveillant mais rigoureux. Donne la correction parfaite à la fin."""

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user",
             "content": f"COURS: {course_context[:10000]}\n\nCONSIGNE: {instruction}\n\nRÉPONSE ÉLÈVE: {student_answer}"}
        ],
        response_format=EvaluationResult,
    )
    return completion.choices[0].message.parsed.model_dump()


# Fonction Chat standard pour le contexte "Tuteur" pendant l'exercice
def chat_with_tutor(history: list, course_context: str, current_message: str) -> str:
    messages = [{"role": "system",
                 "content": f"Tu es un tuteur pédagogique. Aide l'élève sur ce cours : {course_context[:5000]}. Sois concis."}]
    for msg in history[-6:]: messages.append(msg)
    messages.append({"role": "user", "content": current_message})

    res = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
    return res.choices[0].message.content