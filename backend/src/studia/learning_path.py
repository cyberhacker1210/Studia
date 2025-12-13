import json
import os
from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- 1. MODÈLES DE DONNÉES ATOMIQUES ---

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


# --- 3. BLUEPRINTS PAR MATIÈRE (LE CŒUR DU SYSTÈME) ---

# Chaque matière a sa propre structure de JSON
# Cela force l'IA à générer EXACTEMENT ce qu'il faut

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


# --- GÉNÉRATEUR INTELLIGENT ---

def generate_mastery_path(course_text: str, subject: str = "Général") -> dict:
    print(f"🧬 Génération Parcours 20/20 pour : {subject}")

    safe_text = course_text[:25000]

    # Sélection du Schéma (Blueprint) et du Prompt
    if subject == "Mathématiques":
        schema = MathPath
        prompt = "Tu es un prof de Maths d'élite. Crée un parcours axé sur la rigueur, les définitions exactes et la logique."
    elif subject == "Histoire-Géo" or subject == "HGGSP":
        schema = HistoryPath
        prompt = "Tu es un prof d'Histoire. Crée un parcours axé sur la chronologie et la logique causale."
    elif subject == "Philosophie" or subject == "HLP":
        schema = PhilosophyPath
        prompt = "Tu es un prof de Philo. Crée un parcours axé sur les distinctions conceptuelles et les auteurs."
    elif subject == "SVT" or subject == "Physique-Chimie":
        schema = SVTPath
        prompt = "Tu es un prof de Sciences. Crée un parcours axé sur les mots-clés obligatoires et la démarche scientifique."
    elif subject in ["Anglais", "Espagnol", "Allemand"]:
        schema = LanguagePath
        prompt = "Tu es un prof de Langues. Crée un parcours axé sur le vocabulaire riche (idioms) et la grammaire."
    else:
        schema = GeneralPath
        prompt = "Tu es un pédagogue expert. Crée un parcours d'apprentissage complet."

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"COURS :\n{safe_text}"}
            ],
            response_format=schema,
        )

        # On récupère les données brutes
        raw_data = completion.choices[0].message.parsed.model_dump()

        # On normalise pour que le Frontend s'y retrouve (il attend une liste d'étapes)
        # C'est ici qu'on transforme le Blueprint spécifique en une liste d'étapes génériques pour l'UI
        steps = []

        for key, value in raw_data.items():
            step_type = "unknown"
            if "theorems" in key or "context" in key or "learn" in key or "mechanism" in key or "grammar" in key or "authors" in key:
                step_type = "learn"
            elif "formulas" in key or "chronology" in key or "memorize" in key or "keywords" in key or "idioms" in key or "concepts" in key:
                step_type = "flashcards"
            elif "quiz" in key or "check" in key or "logic" in key or "validation" in key:
                step_type = "quiz"
            elif "method" in key:
                step_type = "method"  # Nouveau type pour la philo/lettres

            steps.append({
                "type": step_type,
                "title": value.get("title", "Étape"),
                "data": value
            })

        return {"steps": steps}

    except Exception as e:
        print(f"❌ Erreur IA: {e}")
        # Fallback
        return {"steps": []}


# --- FONCTIONS UTILES (CHAT, ETC) ---
# ... (Garder les autres fonctions existantes)
def chat_with_tutor(h, c, m): return "..."


def generate_diagnostic_quiz(t): return {}


def generate_remediation_content(t, w, d): return {}


def generate_validation_quiz(t, c, d): return {}


def generate_practice_exercise(t, d): return {}


def evaluate_student_answer(i, s, c): return {}


def generate_daily_plan(g, d, c): return {}