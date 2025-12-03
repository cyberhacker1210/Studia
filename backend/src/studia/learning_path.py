"""
Learning Path Generator - Complete Mastery Logic
"""
import json
import os
from typing import List, Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ==========================================
# 1. GÉNÉRATION DE LA CARTE (STRUCTURE)
# ==========================================
def generate_mastery_path(course_text: str) -> dict:
    print("🧬 Génération Parcours Structuré...")

    safe_text = course_text[:20000] # On prend plus de contexte

    prompt = f"""Tu es un professeur d'université expert. Analyse ce cours et structure-le en un parcours d'apprentissage complet et rigoureux.
    
    COURS SOURCE :
    {safe_text}

    TA MISSION :
    Crée un parcours de 3 à 5 modules logiques.
    Pour CHAQUE module, fournis :
    1. Un contenu théorique DENSE (Markdown) avec des exemples concrets.
    2. Un Quiz de vérification (3-5 questions).
    3. Un "Exercice Pratique" (Mise en situation à résoudre par écrit).

    FORMAT JSON ATTENDU (Strictement) :
    {{
      "modules": [
        {{
          "title": "Module 1 : [Nom du Concept]",
          "description": "Objectif pédagogique du module.",
          "content": "## Titre\\nExplication détaillée...\\n### Exemple\\n...",
          "quiz": [
             {{ "question": "...", "options": ["A","B","C","D"], "correct_index": 0, "explanation": "..." }}
          ],
          "practice": {{
             "instruction": "Voici une situation : [Contexte]. Comment appliquez-vous le cours ?",
             "solution_key_points": ["Point clé 1", "Point clé 2", "Conclusion attendue"]
          }}
        }},
        {{ ... Module 2 ... }}
      ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"❌ Erreur IA: {e}")
        return {"modules": []}

# ==========================================
# 2. FONCTIONS ADAPTATIVES (Détails)
# ==========================================

def generate_diagnostic_quiz(course_text: str) -> dict:
    print("🧬 Génération Diagnostic...")
    prompt = f"""Crée un quiz de diagnostic de 10 questions couvrant tout le cours pour évaluer le niveau initial.
    COURS : {course_text[:15000]}
    JSON : {{ "questions": [ {{ "question": "...", "options": ["..."], "correct_index": 0, "explanation": "...", "concept": "Thème associé" }} ] }}
    """
    try:
        res = client.chat.completions.create(model="gpt-4o-mini", response_format={"type": "json_object"}, messages=[{"role": "user", "content": prompt}])
        return json.loads(res.choices[0].message.content)
    except: return {"questions": []}

def generate_remediation_content(course_text: str, weak_concepts: List[str], difficulty: int) -> dict:
    print(f"💊 Génération Remédiation : {weak_concepts}")
    prompt = f"""L'élève ne comprend pas : {', '.join(weak_concepts)}.
    Réexplique ces points spécifiquement avec des analogies simples.
    COURS : {course_text[:15000]}
    JSON : {{ "text": "Explication Markdown...", "flashcards": [ {{ "front": "Question", "back": "Réponse courte" }} ] }}
    """
    try:
        res = client.chat.completions.create(model="gpt-4o-mini", response_format={"type": "json_object"}, messages=[{"role": "user", "content": prompt}])
        return json.loads(res.choices[0].message.content)
    except: return {"text": "Erreur", "flashcards": []}

def generate_validation_quiz(course_text: str, concepts: List[str], difficulty: int) -> dict:
    print(f"🎯 Génération Validation (Niveau {difficulty})...")
    diff_str = "Difficile, pièges et réflexion" if difficulty > 1 else "Moyen, vérification de compréhension"
    prompt = f"""Quiz de 5 questions sur : {', '.join(concepts)}. Niveau : {diff_str}.
    COURS : {course_text[:15000]}
    JSON : {{ "questions": [ {{ "question": "...", "options": ["..."], "correct_index": 0, "explanation": "..." }} ] }}
    """
    try:
        res = client.chat.completions.create(model="gpt-4o-mini", response_format={"type": "json_object"}, messages=[{"role": "user", "content": prompt}])
        return json.loads(res.choices[0].message.content)
    except: return {"questions": []}

# ==========================================
# 3. FONCTIONS UTILITAIRES (Chat, Correction)
# ==========================================

def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    """Corrige un exercice pratique"""
    print("📝 Correction exercice...")
    prompt = f"""Tu es un correcteur bienveillant mais rigoureux.
    CONTEXTE DU COURS : {course_context[:5000]}
    QUESTION POSÉE : {instruction}
    RÉPONSE ÉLÈVE : {student_answer}
    
    Analyse la réponse. Est-elle juste ? Complète ?
    Donne une note sur 100 et un feedback constructif.
    
    JSON : {{ "is_correct": bool (true si > 60/100), "feedback": "Commentaire...", "score": int }}
    """
    try:
        res = client.chat.completions.create(model="gpt-4o-mini", response_format={"type": "json_object"}, messages=[{"role": "user", "content": prompt}])
        return json.loads(res.choices[0].message.content)
    except: return {"is_correct": False, "feedback": "Erreur correction", "score": 0}

def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    prompt = f"""Coach productivité. But: {goal}. Deadline: {deadline}. XP: {current_xp}.
    JSON : {{ "daily_message": "Motivation...", "quote": "Citation...", "micro_tasks": [{{ "id": 1, "task": "Action concrète", "xp_reward": 20 }}] }}"""
    try:
        res = client.chat.completions.create(model="gpt-4o-mini", response_format={"type": "json_object"}, messages=[{"role": "user", "content": prompt}])
        return json.loads(res.choices[0].message.content)
    except: return {}

def chat_with_tutor(history: List[dict], course_context: str) -> str:
    # On garde un historique propre pour ne pas exploser les tokens
    clean_history = [{"role": "system", "content": f"Tu es un Tuteur Socratique. Ne donne jamais la réponse directement, guide l'élève par des questions. Base-toi sur ce cours : {course_context[:8000]}..."}]

    for msg in history[-6:]: # On garde les 6 derniers messages seulement
        if msg.get("role") in ["user", "assistant"]:
            clean_history.append({"role": msg["role"], "content": str(msg["content"])})

    try:
        response = client.chat.completions.create(model="gpt-4o-mini", messages=clean_history)
        return response.choices[0].message.content
    except: return "Désolé, je suis un peu fatigué. Réessaie plus tard."