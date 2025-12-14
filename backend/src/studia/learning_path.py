import json
import os
from typing import List, Literal, Optional, Any
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- MODÈLES ATOMIQUES ---
class FlashcardItem(BaseModel):
    front: str = Field(description="Recto")
    back: str = Field(description="Verso")


class QuizItem(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str


class StructureItem(BaseModel):
    level: int = Field(description="Niveau hiérarchique (1=I, 2=A, 3=1).")
    title: str = Field(description="Le titre de la partie.")
    missing_word: str = Field(description="Mot clé à deviner.")


class OpenQuestion(BaseModel):
    instruction: str = Field(description="Question de synthèse ou exercice.")
    expected_answer_points: List[str] = Field(description="Points clés attendus.")


# --- MODÈLES ÉTAPES ---
class StepTheory(BaseModel): title: str; content_markdown: str


class StepVocabulary(BaseModel): title: str; flashcards: List[FlashcardItem]


class StepDeepQuiz(BaseModel): title: str; questions: List[QuizItem]


class StepStructure(BaseModel): title: str; items: List[StructureItem]


class StepPractice(BaseModel): title: str; exercise: OpenQuestion


class StepMethodology(BaseModel): title: str; tips_markdown: str


# --- BLUEPRINTS ---
class MathPath(BaseModel):
    step_1_theorems: StepTheory
    step_2_formulas: StepVocabulary
    step_3_logic_quiz: StepDeepQuiz
    step_4_problem: StepPractice


class HistoryPath(BaseModel):
    step_1_structure: StepStructure
    step_2_chronology: StepVocabulary
    step_3_concepts: StepDeepQuiz
    step_4_synthesis: StepPractice


class PhilosophyPath(BaseModel):
    step_1_structure: StepStructure
    step_2_authors: StepTheory
    step_3_method: StepMethodology
    step_4_essay: StepPractice


class SVTPath(BaseModel):
    step_1_keywords: StepVocabulary
    step_2_mechanism: StepTheory
    step_3_validation: StepDeepQuiz
    step_4_analysis: StepPractice


class LanguagePath(BaseModel):
    step_1_grammar: StepTheory
    step_2_idioms: StepVocabulary
    step_3_quiz: StepDeepQuiz
    step_4_writing: StepPractice


class GeneralPath(BaseModel):
    step_1_structure: StepStructure
    step_2_learn: StepTheory
    step_3_check: StepDeepQuiz
    step_4_apply: StepPractice


# --- GÉNÉRATEUR ---
def generate_mastery_path(course_text: str, subject: str = "Général") -> dict:
    print(f"🧬 Génération Parcours 20/20 pour : {subject}")
    safe_text = course_text[:25000]

    if subject in ["Mathématiques", "NSI"]:
        schema = MathPath; prompt = "Prof de Maths."
    elif subject in ["Histoire-Géo", "HGGSP"]:
        schema = HistoryPath; prompt = "Prof d'Histoire. Plan crucial."
    elif subject in ["Philosophie", "HLP", "Français"]:
        schema = PhilosophyPath; prompt = "Prof de Lettres/Philo."
    elif subject in ["SVT", "Physique-Chimie"]:
        schema = SVTPath; prompt = "Prof de Sciences."
    elif subject in ["Anglais", "Espagnol", "Allemand"]:
        schema = LanguagePath; prompt = "Prof de Langues."
    else:
        schema = GeneralPath; prompt = "Pédagogue expert."

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": f"COURS:\n{safe_text}"}],
            response_format=schema,
        )
        raw_data = completion.choices[0].message.parsed.model_dump()

        steps = []
        for key, value in raw_data.items():
            step_type = "unknown"
            if "items" in value:
                step_type = "structure"
            elif "content_markdown" in value:
                step_type = "learn"
            elif "flashcards" in value:
                step_type = "flashcards"
                if not value["flashcards"]: value["flashcards"] = [{"front": "Vide", "back": "..."}]
            elif "questions" in value:
                step_type = "quiz"
            elif "exercise" in value:
                step_type = "practice"
            elif "tips_markdown" in value:
                step_type = "method"

            steps.append({"type": step_type, "title": value.get("title", "Étape"), "data": value})
        return {"steps": steps}
    except Exception as e:
        print(f"❌ Erreur IA: {e}")
        return {"steps": []}


# --- FONCTIONS ADAPTATIVES ---
class QuizQuestionAdaptive(BaseModel): question: str; options: List[
    str]; correct_index: int; explanation: str; concept: str


class DiagnosticResult(BaseModel): questions: List[QuizQuestionAdaptive]


class RemediationContent(BaseModel): summary: str; flashcards: List[dict]


class PracticeExercise(BaseModel): instruction: str; context: str; difficulty: Literal['easy', 'hard']


class EvaluationResult(BaseModel): is_correct: bool; score: int; feedback: str; correction: str


class MicroTask(BaseModel): id: int; task: str; xp_reward: int


class DailyPlan(BaseModel): daily_message: str; quote: str; micro_tasks: List[MicroTask]


def generate_diagnostic_quiz(t):
    res = client.beta.chat.completions.parse(model="gpt-4o-mini",
                                             messages=[{"role": "user", "content": f"Diag:\n{t[:15000]}"}],
                                             response_format=DiagnosticResult)
    return res.choices[0].message.parsed.model_dump()


def generate_remediation_content(t, w, d):
    class R(BaseModel):
        text: str; flashcards: List[dict]

    try:
        res = client.beta.chat.completions.parse(model="gpt-4o-mini",
                                                 messages=[{"role": "user", "content": f"Remediation {w}"}],
                                                 response_format=R)
        d = res.choices[0].message.parsed.model_dump()
        return {"summary": d['text'], "flashcards": d['flashcards']}
    except:
        return {"summary": "Err", "flashcards": []}


def generate_validation_quiz(t, c, d):
    res = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": "Valid Quiz"}],
                                             response_format=DiagnosticResult)
    return res.choices[0].message.parsed.model_dump()


def generate_practice_exercise(t, d):
    res = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Exo {d}"}],
                                             response_format=PracticeExercise)
    return res.choices[0].message.parsed.model_dump()


def evaluate_student_answer(i, s, c):
    res = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Eval:{s}"}],
                                             response_format=EvaluationResult)
    return res.choices[0].message.parsed.model_dump()


def generate_daily_plan(g, d, c):
    res = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Plan {g}"}],
                                             response_format=DailyPlan)
    return res.choices[0].message.parsed.model_dump()


# ✅ CORRECTION TUTEUR (Polyvalent)
def chat_with_tutor(history: list, course_context: str, current_message: str) -> str:
    # Mode Expert (Si cours)
    if course_context and len(course_context) > 50:
        safe_context = course_context[:15000]
        sys_prompt = f"""Tu es un tuteur expert sur ce cours précis.
        COURS:
        {safe_context}
        Réponds en utilisant ce contexte. Sois pédagogue."""

    # Mode Généraliste (Si pas de cours)
    else:
        sys_prompt = """Tu es Studia, un mentor pédagogique d'excellence.
        Ton but est d'aider l'élève dans n'importe quelle matière ou méthodologie.
        Sois bienveillant, structuré et encourageant. Si tu ne sais pas, dis-le."""

    messages = [{"role": "system", "content": sys_prompt}]
    for msg in history[-6:]:
        if msg.get("role") != "system": messages.append(msg)
    messages.append({"role": "user", "content": current_message})

    try:
        res = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
        return res.choices[0].message.content
    except Exception as e:
        print(f"❌ Chat Error: {e}")
        return "Désolé, petit souci technique. Peux-tu répéter ?"