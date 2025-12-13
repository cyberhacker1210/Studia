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


# --- 3. BLUEPRINTS PAR MATIÈRE ---

class MathPath(BaseModel):
    step_1_theorems: StepTheory = Field(description="Définitions et théorèmes mot pour mot.")
    step_2_formulas: StepVocabulary = Field(description="Flashcards des formules.")
    step_3_logic_quiz: StepDeepQuiz = Field(description="Quiz sur les hypothèses et pièges.")


class HistoryPath(BaseModel):
    step_1_chronology: StepVocabulary = Field(description="Flashcards des dates clés.")
    step_2_context: StepTheory = Field(description="Cours Cause -> Fait -> Conséquence.")
    step_3_concepts: StepDeepQuiz = Field(description="Quiz sur les notions clés.")


class PhilosophyPath(BaseModel):
    step_1_concepts: StepVocabulary = Field(description="Définitions précises (ex: Légal/Légitime).")
    step_2_authors: StepTheory = Field(description="Fiches auteurs et citations.")
    step_3_method: StepMethodology = Field(description="Structure de la dissertation.")


class SVTPath(BaseModel):
    step_1_keywords: StepVocabulary = Field(description="Mots-clés obligatoires du correcteur.")
    step_2_mechanism: StepTheory = Field(description="Explication des mécanismes (Observation->Déduction).")
    step_3_validation: StepDeepQuiz


class LanguagePath(BaseModel):
    step_1_grammar: StepTheory = Field(description="Règles grammaticales avancées.")
    step_2_idioms: StepVocabulary = Field(description="Expressions idiomatiques pour le 20/20.")
    step_3_vocab_quiz: StepDeepQuiz


class GeneralPath(BaseModel):
    step_1_learn: StepTheory
    step_2_memorize: StepVocabulary
    step_3_check: StepDeepQuiz


# --- GÉNÉRATEUR PRINCIPAL ---

def generate_mastery_path(course_text: str, subject: str = "Général") -> dict:
    print(f"🧬 Génération Parcours 20/20 pour : {subject}")

    safe_text = course_text[:25000]

    # Sélection de la stratégie
    if subject == "Mathématiques" or subject == "NSI":
        schema = MathPath
        prompt = "Tu es un prof de Maths d'élite. Rigueur absolue."
    elif subject == "Histoire-Géo" or subject == "HGGSP":
        schema = HistoryPath
        prompt = "Tu es un prof d'Histoire. Chronologie et logique causale."
    elif subject == "Philosophie" or subject == "HLP":
        schema = PhilosophyPath
        prompt = "Tu es un prof de Philo. Conceptualisation et Auteurs."
    elif subject == "SVT" or subject == "Physique-Chimie":
        schema = SVTPath
        prompt = "Tu es un prof de Sciences. Mots-clés et démarche scientifique."
    elif subject in ["Anglais", "Espagnol", "Allemand", "Français"]:
        schema = LanguagePath
        prompt = "Tu es un prof de Langues. Vocabulaire riche et Grammaire."
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

        # --- DÉTECTION INTELLIGENTE DES ÉTAPES ---
        steps = []
        for key, value in raw_data.items():
            step_type = "unknown"

            # 1. Détection par contenu (Plus fiable)
            if "content_markdown" in value:
                step_type = "learn"
            elif "flashcards" in value:
                step_type = "flashcards"
                if not value["flashcards"]:  # Sécurité
                    value["flashcards"] = [{"front": "Erreur", "back": "Aucune carte générée."}]
            elif "questions" in value:
                step_type = "quiz"
            elif "tips_markdown" in value:
                step_type = "method"

            # 2. Fallback par nom de clé (Au cas où)
            if step_type == "unknown":
                if "theorems" in key or "context" in key or "learn" in key or "mechanism" in key or "grammar" in key or "authors" in key:
                    step_type = "learn"
                elif "formulas" in key or "chronology" in key or "memorize" in key or "keywords" in key or "idioms" in key or "concepts" in key:
                    step_type = "flashcards"
                elif "quiz" in key or "check" in key or "logic" in key or "validation" in key:
                    step_type = "quiz"
                elif "method" in key:
                    step_type = "method"

            print(f"👉 Étape détectée : {key} -> {step_type}")

            steps.append({
                "type": step_type,
                "title": value.get("title", "Étape"),
                "data": value
            })

        return {"steps": steps}

    except Exception as e:
        print(f"❌ Erreur IA: {e}")
        return {"steps": []}


# --- FONCTIONS ADAPTATIVES (Inchangées mais nécessaires) ---

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


def generate_diagnostic_quiz(course_text: str) -> dict:
    completion = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[
        {"role": "user", "content": f"Diagnostic sur:\n{course_text[:15000]}"}], response_format=DiagnosticResult)
    return completion.choices[0].message.parsed.model_dump()


def generate_remediation_content(course_text: str, weak_concepts: List[str], difficulty: int = 1) -> dict:
    class RemSchema(BaseModel):
        text: str; flashcards: List[dict]

    try:
        completion = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[
            {"role": "user", "content": f"Remédiation {weak_concepts}"}], response_format=RemSchema)
        d = completion.choices[0].message.parsed.model_dump()
        return {"summary": d['text'], "flashcards": d['flashcards']}
    except:
        return {"summary": "Erreur", "flashcards": []}


def generate_validation_quiz(course_text: str, concepts: List[str], difficulty: int) -> dict:
    completion = client.beta.chat.completions.parse(model="gpt-4o-mini",
                                                    messages=[{"role": "user", "content": "Validation Quiz"}],
                                                    response_format=DiagnosticResult)
    return completion.choices[0].message.parsed.model_dump()


def generate_practice_exercise(course_text: str, difficulty: str) -> dict:
    completion = client.beta.chat.completions.parse(model="gpt-4o-mini",
                                                    messages=[{"role": "user", "content": f"Exercice {difficulty}"}],
                                                    response_format=PracticeExercise)
    return completion.choices[0].message.parsed.model_dump()


def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    completion = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[
        {"role": "user", "content": f"Correction: {student_answer}"}], response_format=EvaluationResult)
    return completion.choices[0].message.parsed.model_dump()


def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    completion = client.beta.chat.completions.parse(model="gpt-4o-mini",
                                                    messages=[{"role": "user", "content": f"Plan pour {goal}"}],
                                                    response_format=DailyPlan)
    return completion.choices[0].message.parsed.model_dump()


def chat_with_tutor(history: list, course_context: str, current_message: str) -> str:
    messages = [{"role": "system", "content": "Tuteur expert."}] + history[-4:] + [
        {"role": "user", "content": current_message}]
    res = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
    return res.choices[0].message.content