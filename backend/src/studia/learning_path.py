import json
import os
from typing import List, Literal, Optional, Any
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- MODÈLES COMMUNS ---
class FlashcardItem(BaseModel): front: str; back: str


class QuizItem(BaseModel): question: str; options: List[str]; correctAnswer: int; explanation: str


class OpenQuestion(BaseModel): instruction: str; expected_answer_points: List[str]


# --- NOUVEAU : FICHE DE SYNTHÈSE ---
class SummarySheet(BaseModel):
    title: str = Field(description="Titre de la fiche.")
    key_definitions: List[dict] = Field(description="Liste {term, definition}. Définitions mot pour mot.")
    core_concepts: str = Field(description="Les points essentiels du cours en Markdown structuré.")
    exam_tips: List[str] = Field(description="Pièges à éviter et conseils méthode.")


# --- MODÈLES ÉTAPES (Mastery Path) ---
class StepTheory(BaseModel): title: str; content_markdown: str


class StepVocabulary(BaseModel): title: str; flashcards: List[FlashcardItem]


class StepDeepQuiz(BaseModel): title: str; questions: List[QuizItem]


class StepStructure(BaseModel): title: str; items: List[dict]  # Simplifié pour éviter import circulaire


class StepMethodology(BaseModel): title: str; tips_markdown: str


class StepPractice(BaseModel): title: str; exercise: OpenQuestion


# --- BLUEPRINTS (Mastery Path) ---
class MathPath(
    BaseModel): step_1_theorems: StepTheory; step_2_formulas: StepVocabulary; step_3_logic_quiz: StepDeepQuiz; step_4_problem: StepPractice


class HistoryPath(
    BaseModel): step_1_context: StepTheory; step_2_chronology: StepVocabulary; step_3_check: StepDeepQuiz; step_4_synthesis: StepPractice


class PhilosophyPath(
    BaseModel): step_1_authors: StepTheory; step_2_concepts: StepVocabulary; step_3_method: StepMethodology; step_4_essay: StepPractice


class LanguagePath(
    BaseModel): step_1_grammar: StepTheory; step_2_idioms: StepVocabulary; step_3_quiz: StepDeepQuiz; step_4_writing: StepPractice


class GeneralPath(
    BaseModel): step_1_learn: StepTheory; step_2_memorize: StepVocabulary; step_3_check: StepDeepQuiz; step_4_apply: StepPractice


# --- FONCTIONS ---

def generate_summary_sheet(course_text: str, subject: str) -> dict:
    """Génère une fiche de révision dense (Version Robuste)."""
    print(f"📝 Génération Fiche 20/20 pour : {subject}")

    # On limite à 15k caractères pour être sûr que ça passe avec gpt-4o-mini
    safe_text = course_text[:15000]

    prompt = f"""Tu es un professeur agrégé de {subject}.
    Rédige une fiche de révision d'excellence pour ce cours.

    FORMAT JSON STRICT :
    {{
      "title": "Titre du chapitre",
      "key_definitions": [
        {{"term": "Mot clé 1", "definition": "Définition précise"}},
        {{"term": "Mot clé 2", "definition": "Définition précise"}}
      ],
      "core_concepts": "Résumé structuré en Markdown (utilises des # titres et - listes).",
      "exam_tips": ["Conseil 1", "Piège à éviter"]
    }}
    """

    try:
        # Essai avec Pydantic
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": safe_text}],
            response_format=SummarySheet,
        )
        return completion.choices[0].message.parsed.model_dump()

    except Exception as e:
        print(f"❌ Erreur Fiche Pydantic: {e}")

        # Fallback manuel (si Pydantic échoue)
        try:
            res = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt + " Réponds uniquement en JSON valide."},
                    {"role": "user", "content": safe_text}
                ],
                response_format={"type": "json_object"}
            )
            data = json.loads(res.choices[0].message.content)
            # On s'assure que les champs existent
            return {
                "title": data.get("title", "Fiche de Révision"),
                "key_definitions": data.get("key_definitions", []),
                "core_concepts": data.get("core_concepts", "Résumé non généré."),
                "exam_tips": data.get("exam_tips", [])
            }
        except:
            return {
                "title": "Erreur de Génération",
                "key_definitions": [],
                "core_concepts": "L'IA n'a pas pu traiter ce cours. Il est peut-être trop long ou illisible.",
                "exam_tips": []
            }

def generate_mastery_path(course_text: str, subject: str = "Général") -> dict:
    print(f"🧬 Génération Parcours 20/20 pour : {subject}")
    safe_text = course_text[:25000]

    if subject in ["Mathématiques", "NSI"]:
        schema = MathPath; prompt = "Prof de Maths."
    elif subject in ["Histoire-Géo", "HGGSP"]:
        schema = HistoryPath; prompt = "Prof d'Histoire."
    elif subject in ["Philosophie", "Français"]:
        schema = PhilosophyPath; prompt = "Prof de Lettres."
    elif subject in ["Anglais", "Espagnol"]:
        schema = LanguagePath; prompt = "Prof de Langues."
    else:
        schema = GeneralPath; prompt = "Pédagogue expert."

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": f"COURS :\n{safe_text}"}],
            response_format=schema,
        )
        raw_data = completion.choices[0].message.parsed.model_dump()

        steps = []
        for key, value in raw_data.items():
            step_type = "unknown"
            if "content_markdown" in value:
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


# --- FONCTIONS SECONDAIRES (Compatibilité) ---
class StepContentLearn(BaseModel): markdown: str


class StepContentFlashcards(BaseModel): cards: List[dict]


class StepContentQuiz(BaseModel): questions: List[dict]


class StepContentPractice(BaseModel): instruction: str; context: str


def generate_step_content(step_type: str, course_text: str, subject: str) -> dict:
    safe_text = course_text[:20000]
    if step_type == 'learn':
        prompt = f"Cours Markdown {subject}"; schema = StepContentLearn
    elif step_type == 'flashcards':
        prompt = f"Flashcards {subject}"; schema = StepContentFlashcards
    elif step_type == 'quiz':
        prompt = f"Quiz {subject}"; schema = StepContentQuiz
    elif step_type == 'practice':
        prompt = f"Exercice {subject}"; schema = StepContentPractice
    else:
        return {}

    try:
        res = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "system", "content": prompt},
                                                                                {"role": "user", "content": safe_text}],
                                                 response_format=schema)
        return res.choices[0].message.parsed.model_dump()
    except:
        return {}


# Autres stubs nécessaires
class QuizQuestionAdaptive(BaseModel): question: str; options: List[
    str]; correct_index: int; explanation: str; concept: str


class DiagnosticResult(BaseModel): questions: List[QuizQuestionAdaptive]


class RemediationContent(BaseModel): summary: str; flashcards: List[dict]


class PracticeExercise(BaseModel): instruction: str; context: str; difficulty: Literal['easy', 'hard']


class EvaluationResult(BaseModel): is_correct: bool; score: int; feedback: str; correction: str


class MicroTask(BaseModel): id: int; task: str; xp_reward: int


class DailyPlan(BaseModel): daily_message: str; quote: str; micro_tasks: List[MicroTask]


def generate_diagnostic_quiz(t): return \
client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Diag:\n{t[:15000]}"}],
                                   response_format=DiagnosticResult).choices[0].message.parsed.model_dump()


def generate_remediation_content(t, w, d):
    class R(BaseModel):
        text: str; flashcards: List[dict]

    try:
        return {"summary": client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[
            {"role": "user", "content": f"Remediation {w}"}], response_format=R).choices[0].message.parsed.text,
                "flashcards": []}
    except:
        return {"summary": "Err", "flashcards": []}


def generate_validation_quiz(t, c, d): return generate_diagnostic_quiz(t)


def generate_practice_exercise(t, d): return \
client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Exo {d}"}],
                                   response_format=PracticeExercise).choices[0].message.parsed.model_dump()


def evaluate_student_answer(i, s, c): return \
client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Eval:{s}"}],
                                   response_format=EvaluationResult).choices[0].message.parsed.model_dump()


def generate_daily_plan(g, d, c): return \
client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Plan {g}"}],
                                   response_format=DailyPlan).choices[0].message.parsed.model_dump()


def chat_with_tutor(h, c, m):
    msgs = [{"role": "system", "content": "Tuteur."}] + h[-4:] + [{"role": "user", "content": m}]
    return client.chat.completions.create(model="gpt-4o-mini", messages=msgs).choices[0].message.content