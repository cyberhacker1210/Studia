"""
Learning Path Generator - Full Version
"""
import json
import os
from typing import List, Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- 1. FONCTION PRINCIPALE (Celle qui manquait) ---
def generate_mastery_path(course_text: str) -> dict:
    print("🧬 Génération Parcours Thématique...")

    prompt = f"""Tu es un architecte pédagogique. Analyse ce cours et découpe-le en 3 à 5 modules thématiques logiques (pas de "Jour 1", mais des vrais titres).

    STRUCTURE DU PARCOURS :
    1. Module 0 : "Diagnostic Initial" (Quiz global pour voir le niveau)
    2. Module 1 : [Titre du premier grand concept]
    3. Module 2 : [Titre du deuxième grand concept]
    ...
    X. Module Final : "Validation des Acquis" (Grand Chelem)

    COURS (Extrait) :
    {course_text[:15000]}

    FORMAT JSON ATTENDU :
    {{
      "modules": [
        {{
          "title": "Diagnostic Initial",
          "description": "Évaluation de départ.",
          "type": "quiz_only",
          "quiz": [ ... 5 questions globales ... ]
        }},
        {{
          "title": "Concept 1 : [Nom]",
          "description": "Apprentissage du premier pilier.",
          "type": "learning",
          "content": "Cours structuré en Markdown...",
          "quiz": [ ... 3 questions de vérification ... ]
        }},
        ...
      ]
    }}
    """

# --- 2. FONCTIONS ADAPTATIVES (Diagnostic/Remediation) ---

def generate_diagnostic_quiz(course_text: str) -> dict:
    print("🧬 Génération Diagnostic...")
    prompt = f"""Crée un quiz de diagnostic de 5 questions.
    COURS : {course_text[:15000]}
    JSON : {{ "questions": [ {{ "question": "...", "options": ["..."], "correct_index": 0, "explanation": "...", "concept": "..." }} ] }}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)


def generate_remediation_content(course_text: str, weak_concepts: List[str], difficulty: int) -> dict:
    print(f"💊 Génération Remédiation pour : {weak_concepts}")
    concepts_str = ", ".join(weak_concepts)

    prompt = f"""Explique ces concepts ratés : {concepts_str}.
    Niveau : {difficulty}/3.
    COURS : {course_text[:15000]}
    JSON : {{ "text": "Markdown...", "flashcards": [ {{ "front": "...", "back": "..." }} ] }}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)


def generate_validation_quiz(course_text: str, concepts: List[str], difficulty: int) -> dict:
    print(f"🎯 Génération Validation (Niveau {difficulty})...")
    prompt = f"""Quiz de validation 5 questions. Niveau {difficulty}.
    Concepts : {concepts}
    COURS : {course_text[:15000]}
    JSON : {{ "questions": [ {{ "question": "...", "options": ["..."], "correct_index": 0, "explanation": "...", "concept": "..." }} ] }}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)


# --- 3. FONCTIONS UTILITAIRES ---

def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    prompt = f"""Corrige. Context: {course_context[:1000]}. Q: {instruction}. R: {student_answer}.
    JSON: {{ "is_correct": bool, "feedback": "string", "score": int }}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)


def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    prompt = f"""Coach productivité. But: {goal}. Deadline: {deadline}.
    JSON: {{ "daily_message": "...", "quote": "...", "micro_tasks": [{{ "id": 1, "task": "...", "xp_reward": 20 }}] }}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)


def chat_with_tutor(history: List[dict], course_context: str) -> str:
    clean_history = [{"role": "system", "content": f"Tuteur Socratique. Contexte: {course_context[:3000]}"}]
    for msg in history:
        if msg.get("role") in ["user", "assistant"]:
            clean_history.append({"role": msg["role"], "content": str(msg["content"])})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=clean_history
    )
    return response.choices[0].message.content