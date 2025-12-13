import json
import os
from typing import List, Literal, Optional, Any
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- 1. MODÈLES ATOMIQUES ---

class FlashcardItem(BaseModel):
    front: str = Field(description="Recto")
    back: str = Field(description="Verso")


class QuizItem(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str


# ✅ Question Ouverte Finale
class OpenQuestion(BaseModel):
    instruction: str = Field(description="La question de synthèse ou l'exercice à résoudre.")
    expected_answer_points: List[str] = Field(description="Les points clés attendus dans la réponse.")


# --- 2. MODÈLES D'ÉTAPES ---

class StepTheory(BaseModel):
    title: str
    content_markdown: str = Field(description="Le cours structuré.")


class StepVocabulary(BaseModel):
    title: str = Field(description="Mémorisation (Flashcards).")
    flashcards: List[FlashcardItem]


class StepDeepQuiz(BaseModel):
    title: str
    questions: List[QuizItem]


class StepPractice(BaseModel):
    title: str
    exercise: OpenQuestion = Field(description="Exercice d'application final.")


# --- 3. BLUEPRINTS PAR MATIÈRE (REVUS & SIMPLIFIÉS) ---

# Maths/Physique : Cours -> Formules -> Quiz Logique -> Problème
class MathPath(BaseModel):
    step_1_theorems: StepTheory = Field(description="Définitions et théorèmes.")
    step_2_formulas: StepVocabulary = Field(description="Flashcards formules.")
    step_3_logic_quiz: StepDeepQuiz = Field(description="Quiz QCM de vérification.")
    step_4_problem: StepPractice = Field(description="Un exercice type BAC à résoudre.")


# Histoire/Philo/Lettres : Cours -> Dates/Concepts -> Quiz -> Synthèse
class HumanitiesPath(BaseModel):
    step_1_context: StepTheory = Field(description="Cours structuré (Contexte, Enjeux).")
    step_2_memory: StepVocabulary = Field(description="Dates, Définitions, Citations.")
    step_3_check: StepDeepQuiz = Field(description="Quiz de vérification.")
    step_4_synthesis: StepPractice = Field(description="Question ouverte de synthèse.")


# Langues : Grammaire -> Vocabulaire -> Quiz -> Rédaction
class LanguagePath(BaseModel):
    step_1_grammar: StepTheory
    step_2_vocabulary: StepVocabulary
    step_3_quiz: StepDeepQuiz
    step_4_writing: StepPractice = Field(description="Sujet d'expression écrite.")


class GeneralPath(BaseModel):
    step_1_learn: StepTheory
    step_2_memorize: StepVocabulary
    step_3_check: StepDeepQuiz
    step_4_apply: StepPractice


# --- GÉNÉRATEUR PRINCIPAL ---

def generate_mastery_path(course_text: str, subject: str = "Général") -> dict:
    print(f"🧬 Génération Parcours 20/20 (v2) pour : {subject}")

    safe_text = course_text[:25000]

    if subject in ["Mathématiques", "NSI", "Physique-Chimie", "SVT"]:
        schema = MathPath
        prompt = "Tu es un prof de Sciences. Crée un parcours rigoureux avec un vrai problème à la fin."
    elif subject in ["Histoire-Géo", "HGGSP", "Philosophie", "HLP", "Français", "Littérature"]:
        schema = HumanitiesPath
        prompt = "Tu es un prof de Lettres/Sciences Humaines. Crée un parcours axé sur l'analyse et la synthèse finale."
    elif subject in ["Anglais", "Espagnol", "Allemand"]:
        schema = LanguagePath
        prompt = "Tu es un prof de Langues. Vocabulaire et Expression."
    else:
        schema = GeneralPath
        prompt = "Tu es un pédagogue expert."

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"COURS :\n{safe_text}"}
            ],
            response_format=schema,
        )

        raw_data = completion.choices[0].message.parsed.model_dump()

        # Transformation en liste d'étapes
        steps = []
        for key, value in raw_data.items():
            step_type = "unknown"

            # Détection intelligente
            if "content_markdown" in value:
                step_type = "learn"
            elif "flashcards" in value:
                step_type = "flashcards"
                if not value["flashcards"]: value["flashcards"] = [{"front": "Erreur", "back": "Vide"}]
            elif "questions" in value:
                step_type = "quiz"
            elif "exercise" in value:
                step_type = "practice"  # ✅ NOUVEAU TYPE

            # Fallback clés (au cas où)
            if step_type == "unknown":
                if "theorems" in key or "context" in key or "grammar" in key or "learn" in key:
                    step_type = "learn"
                elif "formulas" in key or "memory" in key or "vocabulary" in key:
                    step_type = "flashcards"
                elif "quiz" in key or "check" in key:
                    step_type = "quiz"
                elif "problem" in key or "synthesis" in key or "writing" in key or "apply" in key:
                    step_type = "practice"

            print(f"👉 Étape : {key} -> {step_type}")

            steps.append({
                "type": step_type,
                "title": value.get("title", "Étape"),
                "data": value
            })

        return {"steps": steps}

    except Exception as e:
        print(f"❌ Erreur IA: {e}")
        return {"steps": []}


# --- FONCTIONS SECONDAIRES (STUBS/OUTILS) ---

class EvaluationResult(BaseModel):
    is_correct: bool;
    score: int;
    feedback: str;
    correction: str


def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    prompt = "Tu es un correcteur. Note la réponse /100 et donne un feedback constructif + la correction."
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"CTX:{course_context[:10000]}\nQ:{instruction}\nR:{student_answer}"}],
        response_format=EvaluationResult
    )
    return completion.choices[0].message.parsed.model_dump()


def chat_with_tutor(history: list, course_context: str, current_message: str) -> str:
    messages = [{"role": "system", "content": f"Tu es un tuteur expert. Contexte : {course_context[:10000]}."}]
    for msg in history[-4:]: messages.append(msg)
    messages.append({"role": "user", "content": current_message})
    res = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
    return res.choices[0].message.content


# Stubs pour compatibilité API
def generate_diagnostic_quiz(t): return {}


def generate_remediation_content(t, w, d): return {}


def generate_validation_quiz(t, c, d): return {}


def generate_practice_exercise(t, d): return {}


def generate_daily_plan(g, d, c): return {}