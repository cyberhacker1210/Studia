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
    """
    Génère le parcours complet en 3 modules (Micro-Learning)
    Appelé par /api/path/generate
    """
    print("🧬 Génération Parcours Micro-Learning (Map)...")

    prompt = f"""Tu es un architecte pédagogique. Découpe ce cours en 3 modules progressifs pour un apprentissage sur 3 jours.

    COURS (Extrait) :
    {course_text[:15000]}

    FORMAT JSON ATTENDU (Strictement) :
    {{
      "modules": [
        {{
          "title": "Jour 1 : Les Bases",
          "description": "Comprendre les concepts clés.",
          "content": "Résumé clair en Markdown...",
          "quiz": [
             {{ "question": "...", "options": ["A","B"], "correct_index": 0, "explanation": "..." }}
          ]
        }},
        {{
          "title": "Jour 2 : Approfondissement",
          "description": "Analyse détaillée.",
          "content": "Contenu détaillé en Markdown...",
          "quiz": [ ... ]
        }},
        {{
          "title": "Jour 3 : Maîtrise",
          "description": "Application et synthèse.",
          "content": "Synthèse finale en Markdown...",
          "quiz": [ ... ]
        }}
      ]
    }}

    RÈGLES :
    - 3 Modules exactement.
    - Chaque module a 2 questions de quiz.
    - Réponds UNIQUEMENT en JSON valide.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error generate_mastery_path: {e}")
        # Fallback en cas d'erreur pour ne pas crasher le front
        return {
            "modules": [
                {
                    "title": "Module 1 (Erreur IA)",
                    "description": "Impossible de générer le contenu.",
                    "content": "Désolé, une erreur est survenue. Réessayez.",
                    "quiz": []
                }
            ]
        }


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