"""
Learning Path Generator - Robust & Complete
"""
import json
import os
from typing import List, Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- 1. FONCTION PRINCIPALE (CORRIGÉE) ---
def generate_mastery_path(course_text: str) -> dict:
    """
    Génère le plan du parcours thématique (La Carte).
    """
    print("🧬 Génération Parcours Thématique...")

    # On tronque pour éviter l'erreur de token limit
    safe_text = course_text[:12000]

    prompt = f"""Tu es un expert pédagogique. Découpe ce cours en 3 à 5 modules thématiques logiques.
    
    STRUCTURE DU PARCOURS :
    1. Module 0 : "Diagnostic Initial" (Quiz global pour voir le niveau)
    2. Module 1 : [Titre du premier grand concept]
    3. Module 2 : [Titre du deuxième grand concept]
    ...
    X. Module Final : "Validation des Acquis"

    COURS (Extrait) :
    {safe_text}

    FORMAT JSON ATTENDU (Strictement) :
    {{
      "modules": [
        {{
          "title": "Diagnostic Initial",
          "description": "Évaluation de départ.",
          "type": "quiz_only",
          "quiz": [
             {{ 
               "question": "Question globale 1 ?", 
               "options": ["A", "B", "C", "D"], 
               "correct_index": 0, 
               "explanation": "Explication." 
             }},
             {{ "question": "...", "options": ["..."], "correct_index": 0, "explanation": "..." }}
          ]
        }},
        {{
          "title": "Concept 1 : [Nom]",
          "description": "Apprentissage du premier pilier.",
          "type": "learning",
          "content": "Cours structuré en Markdown...",
          "quiz": [
             {{ "question": "...", "options": ["..."], "correct_index": 0, "explanation": "..." }}
          ]
        }}
      ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )

        content = response.choices[0].message.content
        data = json.loads(content)

        # Vérification basique
        if "modules" not in data:
            raise ValueError("Clé 'modules' manquante dans la réponse IA")

        return data

    except Exception as e:
        print(f"❌ Erreur IA Parcours: {e}")
        # Fallback de secours pour ne pas crasher le front
        return {
            "modules": [
                {
                    "title": "Module de Secours",
                    "description": "Une erreur est survenue, voici un module par défaut.",
                    "type": "learning",
                    "content": "Le contenu n'a pas pu être généré.",
                    "quiz": []
                }
            ]
        }

# --- 2. FONCTIONS ADAPTATIVES ---

def generate_diagnostic_quiz(course_text: str) -> dict:
    print("🧬 Génération Diagnostic...")
    prompt = f"""Crée un quiz de diagnostic de 5 questions.
    COURS : {course_text[:12000]}
    JSON : {{ "questions": [ {{ "question": "...", "options": ["..."], "correct_index": 0, "explanation": "...", "concept": "..." }} ] }}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except: return {"questions": []}

def generate_remediation_content(course_text: str, weak_concepts: List[str], difficulty: int) -> dict:
    print(f"💊 Génération Remédiation : {weak_concepts}")
    concepts_str = ", ".join(weak_concepts)
    prompt = f"""Explique ces concepts ratés : {concepts_str}. Niveau {difficulty}/3.
    COURS : {course_text[:12000]}
    JSON : {{ "text": "Markdown...", "flashcards": [ {{ "front": "...", "back": "..." }} ] }}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except: return {"text": "Erreur génération.", "flashcards": []}

def generate_validation_quiz(course_text: str, concepts: List[str], difficulty: int) -> dict:
    print(f"🎯 Génération Validation...")
    prompt = f"""Quiz de validation 5 questions. Niveau {difficulty}.
    COURS : {course_text[:12000]}
    JSON : {{ "questions": [ {{ "question": "...", "options": ["..."], "correct_index": 0, "explanation": "...", "concept": "..." }} ] }}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except: return {"questions": []}

# --- 3. FONCTIONS UTILITAIRES ---

def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    prompt = f"""Corrige. Context: {course_context[:1000]}. Q: {instruction}. R: {student_answer}.
    JSON: {{ "is_correct": bool, "feedback": "string", "score": int }}"""
    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(res.choices[0].message.content)
    except: return {"is_correct": False, "feedback": "Erreur", "score": 0}

def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    # Stub simple
    return {
        "daily_message": "Fonce !",
        "quote": "Le succès est la somme de petits efforts.",
        "micro_tasks": [{"id": 1, "task": "Relire le cours", "xp_reward": 20}]
    }

def chat_with_tutor(history: List[dict], course_context: str) -> str:
    clean_history = [{"role": "system", "content": f"Tuteur Socratique. Contexte: {course_context[:3000]}"}]
    for msg in history:
        if msg.get("role") in ["user", "assistant"]:
            clean_history.append({"role": msg["role"], "content": str(msg["content"])})

    try:
        response = client.chat.completions.create(model="gpt-4o-mini", messages=clean_history)
        return response.choices[0].message.content
    except: return "Désolé, je ne peux pas répondre pour le moment."