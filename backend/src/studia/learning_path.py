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


# ✅ NOUVEAU MODÈLE STRUCTURE
class StructureItem(BaseModel):
    level: int = Field(description="Niveau hiérarchique (1 pour I, 2 pour A, 3 pour 1).")
    title: str = Field(description="Le titre de la partie.")
    missing_word: str = Field(description="Mot clé à deviner (optionnel).")


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


class StepStructure(BaseModel):
    title: str = Field(description="Titre de l'étape (ex: 'Plan du cours').")
    items: List[StructureItem] = Field(description="La liste ordonnée des parties.")


# --- 3. BLUEPRINTS PAR MATIÈRE ---

class MathPath(BaseModel):
    step_1_theorems: StepTheory = Field(description="Définitions et théorèmes.")
    step_2_formulas: StepVocabulary = Field(description="Flashcards formules.")
    step_3_logic_quiz: StepDeepQuiz


class HistoryPath(BaseModel):
    step_1_structure: StepStructure = Field(description="Le plan détaillé à maîtriser.")
    step_2_chronology: StepVocabulary
    step_3_concepts: StepDeepQuiz


class PhilosophyPath(BaseModel):
    step_1_structure: StepStructure
    step_2_authors: StepTheory
    step_3_method: StepMethodology


class SVTPath(BaseModel):
    step_1_keywords: StepVocabulary
    step_2_mechanism: StepTheory
    step_3_validation: StepDeepQuiz


class LanguagePath(BaseModel):
    step_1_grammar: StepTheory
    step_2_idioms: StepVocabulary
    step_3_vocab_quiz: StepDeepQuiz


class GeneralPath(BaseModel):
    step_1_structure: StepStructure
    step_2_learn: StepTheory
    step_3_check: StepDeepQuiz


# --- GÉNÉRATEUR PRINCIPAL ---

def generate_mastery_path(course_text: str, subject: str = "Général") -> dict:
    print(f"🧬 Génération Parcours 20/20 pour : {subject}")

    safe_text = course_text[:25000]

    # Sélection Stratégique
    if subject in ["Mathématiques", "NSI"]:
        schema = MathPath
        prompt = "Tu es un prof de Maths. Rigueur absolue."
    elif subject in ["Histoire-Géo", "HGGSP", "Géopolitique"]:
        schema = HistoryPath
        prompt = "Tu es un prof d'Histoire. Le PLAN est crucial."
    elif subject in ["Philosophie", "HLP", "Français", "Littérature"]:
        schema = PhilosophyPath
        prompt = "Tu es un prof de Lettres. Structure de la pensée."
    elif subject in ["SVT", "Physique-Chimie"]:
        schema = SVTPath
        prompt = "Tu es un prof de Sciences."
    elif subject in ["Anglais", "Espagnol", "Allemand"]:
        schema = LanguagePath
        prompt = "Tu es un prof de Langues."
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

        # Transformation
        steps = []
        for key, value in raw_data.items():
            step_type = "unknown"

            # Détection intelligente
            if "items" in value and isinstance(value["items"], list):
                step_type = "structure"
            elif "content_markdown" in value:
                step_type = "learn"
            elif "flashcards" in value:
                step_type = "flashcards"
                if not value["flashcards"]: value["flashcards"] = [{"front": "Erreur", "back": "Vide"}]
            elif "questions" in value:
                step_type = "quiz"
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


# --- FONCTIONS ADAPTATIVES ---
# ... (Modèles adaptatifs inchangés - QuizQuestionAdaptive, etc.)
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


# ✅ CORRECTION CRITIQUE DU TUTEUR
def chat_with_tutor(history: list, course_context: str, current_message: str) -> str:
    """Chatbot Tuteur avec contexte complet."""

    # On limite le contexte pour ne pas exploser les tokens, mais on en garde assez (15k caractères)
    safe_context = course_context[:15000]

    system_prompt = f"""Tu es un tuteur personnel expert.
    Ton élève te pose des questions sur un cours spécifique.

    VOICI LE CONTENU DU COURS (C'est ta source de vérité absolue) :
    ---
    {safe_context}
    ---

    Réponds aux questions en utilisant UNIQUEMENT les informations ci-dessus si possible.
    Si la réponse n'est pas dans le cours, dis-le poliment mais essaie d'aider avec tes connaissances générales.
    Sois pédagogique, clair et encourageant.
    """

    messages = [{"role": "system", "content": system_prompt}]

    # On ajoute l'historique récent (les 6 derniers messages) pour la conversation
    # On filtre les messages système de l'historique pour ne pas polluer
    for msg in history[-6:]:
        if msg.get("role") != "system":
            messages.append(msg)

    messages.append({"role": "user", "content": current_message})

    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return res.choices[0].message.content
    except Exception as e:
        print(f"❌ Erreur Chat: {e}")
        return "Désolé, j'ai eu un petit problème technique. Peux-tu reformuler ?"