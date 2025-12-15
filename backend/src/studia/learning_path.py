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


class OpenQuestion(BaseModel):
    instruction: str = Field(description="Question de synthèse ou exercice.")
    expected_answer_points: List[str] = Field(description="Points clés attendus.")


# --- 2. MODÈLES D'ÉTAPES SPÉCIFIQUES ---

class StepTheory(BaseModel):
    title: str
    content_markdown: str = Field(description="Le cours structuré selon la méthode 20/20.")


class StepVocabulary(BaseModel):
    title: str = Field(description="Ex: 'Mots-clés obligatoires' ou 'Idioms'.")
    flashcards: List[FlashcardItem]


class StepMethodology(BaseModel):
    title: str = Field(description="Ex: 'Structure de la dissertation'.")
    tips_markdown: str = Field(description="Conseils méthodologiques précis.")


class StepDeepQuiz(BaseModel):
    title: str
    questions: List[QuizItem]


class StepPractice(BaseModel):
    title: str
    exercise: OpenQuestion = Field(description="Exercice d'application final.")


# --- 3. BLUEPRINTS PAR MATIÈRE ---

class MathPath(BaseModel):
    step_1_theorems: StepTheory = Field(description="Définitions et théorèmes mot pour mot.")
    step_2_formulas: StepVocabulary = Field(description="Flashcards des formules.")
    step_3_logic_quiz: StepDeepQuiz = Field(description="Quiz sur les hypothèses et pièges.")
    step_4_problem: StepPractice


class HistoryPath(BaseModel):
    step_1_context: StepTheory = Field(description="Cours Cause -> Fait -> Conséquence.")
    step_2_chronology: StepVocabulary = Field(description="Flashcards des dates clés.")
    step_3_concepts: StepDeepQuiz
    step_4_synthesis: StepPractice


class PhilosophyPath(BaseModel):
    step_1_authors: StepTheory = Field(description="Fiches auteurs et concepts.")
    step_2_concepts: StepVocabulary = Field(description="Définitions précises.")
    step_3_method: StepMethodology
    step_4_essay: StepPractice


class SVTPath(BaseModel):
    step_1_mechanism: StepTheory
    step_2_keywords: StepVocabulary = Field(description="Mots-clés obligatoires.")
    step_3_validation: StepDeepQuiz
    step_4_analysis: StepPractice


class LanguagePath(BaseModel):
    step_1_grammar: StepTheory
    step_2_idioms: StepVocabulary = Field(description="Expressions idiomatiques.")
    step_3_quiz: StepDeepQuiz
    step_4_writing: StepPractice


class GeneralPath(BaseModel):
    step_1_learn: StepTheory
    step_2_memorize: StepVocabulary
    step_3_check: StepDeepQuiz
    step_4_apply: StepPractice


# --- FONCTIONS DE RÉPARATION (SELF-HEALING) ---

def repair_flashcards(text: str) -> List[dict]:
    print("🔧 Réparation Flashcards...")
    try:
        class FlashcardList(BaseModel):
            cards: List[FlashcardItem]

        res = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "Génère 5 flashcards pertinentes."},
                      {"role": "user", "content": text[:10000]}],
            response_format=FlashcardList
        )
        # Conversion en dict
        return [c.model_dump() for c in res.choices[0].message.parsed.cards]
    except Exception as e:
        print(f"⚠️ Echec réparation FC: {e}")
        return [{"front": "Erreur", "back": "Impossible de générer."}]


def repair_quiz(text: str) -> List[dict]:
    print("🔧 Réparation Quiz...")
    try:
        class QuizList(BaseModel):
            questions: List[QuizItem]

        res = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "Génère 5 questions QCM."},
                      {"role": "user", "content": text[:10000]}],
            response_format=QuizList
        )
        return [q.model_dump() for q in res.choices[0].message.parsed.questions]
    except:
        return []


# --- GÉNÉRATEUR PRINCIPAL ---

def generate_mastery_path(course_text: str, subject: str = "Général") -> dict:
    print(f"🧬 Génération Parcours 20/20 pour : {subject}")

    safe_text = course_text[:20000]

    if subject in ["Mathématiques", "NSI"]:
        schema = MathPath
        prompt = "Tu es un prof de Maths d'élite. Rigueur absolue."
    elif subject in ["Histoire-Géo", "HGGSP"]:
        schema = HistoryPath
        prompt = "Tu es un prof d'Histoire. Chronologie et logique."
    elif subject in ["Philosophie", "HLP", "Français"]:
        schema = PhilosophyPath
        prompt = "Tu es un prof de Philo. Concepts et Auteurs."
    elif subject in ["SVT", "Physique-Chimie"]:
        schema = SVTPath
        prompt = "Tu es un prof de Sciences. Mots-clés et démarche."
    elif subject in ["Anglais", "Espagnol", "Allemand"]:
        schema = LanguagePath
        prompt = "Tu es un prof de Langues. Vocabulaire riche."
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

        # --- LOGIQUE D'AUTO-RÉPARATION ---
        for key, value in raw_data.items():
            # Si Flashcards vides -> Réparer
            if "flashcards" in value and (not value["flashcards"] or len(value["flashcards"]) == 0):
                value["flashcards"] = repair_flashcards(safe_text)

            # Si Quiz vide -> Réparer
            if "questions" in value and (not value["questions"] or len(value["questions"]) == 0):
                value["questions"] = repair_quiz(safe_text)

        # Transformation pour le frontend
        steps = []
        for key, value in raw_data.items():
            step_type = "unknown"
            if "content_markdown" in value:
                step_type = "learn"
            elif "flashcards" in value:
                step_type = "flashcards"
            elif "questions" in value:
                step_type = "quiz"
            elif "exercise" in value:
                step_type = "practice"
            elif "tips_markdown" in value:
                step_type = "method"

            steps.append({
                "type": step_type,
                "title": value.get("title", "Étape"),
                "data": value
            })

        return {"steps": steps}

    except Exception as e:
        print(f"❌ Erreur IA: {e}")
        return {"steps": []}


# --- FONCTIONS SECONDAIRES (Requis pour main.py) ---

class QuizQuestionAdaptive(BaseModel):
    question: str;
    options: List[str];
    correct_index: int;
    explanation: str;
    concept: str


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
    res = client.beta.chat.completions.parse(model="gpt-4o-mini",
                                             messages=[{"role": "user", "content": f"Plan pour {goal}"}],
                                             response_format=DailyPlan)
    return res.choices[0].message.parsed.model_dump()


def chat_with_tutor(history: list, course_context: str, current_message: str) -> str:
    if course_context and len(course_context) > 50:
        sys_prompt = f"Tu es un tuteur expert.\nCOURS:{course_context[:15000]}"
    else:
        sys_prompt = "Tu es Studia, un mentor pédagogique."

    messages = [{"role": "system", "content": sys_prompt}]
    for msg in history[-6:]:
        if msg.get("role") != "system": messages.append(msg)
    messages.append({"role": "user", "content": current_message})

    try:
        res = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
        return res.choices[0].message.content
    except Exception as e:
        print(f"❌ Chat Error: {e}")
        return "Désolé, petit souci technique."