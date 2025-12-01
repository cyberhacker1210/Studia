import json
import os
from typing import List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_diagnostic_quiz(course_text: str) -> dict:
    print("🧬 Génération Diagnostic...")
    prompt = f"""Tu es un expert pédagogique. Crée un quiz de diagnostic de 5 questions pour évaluer la compréhension globale de ce cours.
    
    Chaque question doit tester un concept clé différent.
    
    COURS : {course_text[:15000]}

    JSON ATTENDU :
    {{
      "questions": [
        {{
          "question": "...",
          "options": ["A","B","C","D"],
          "correct_index": 0,
          "explanation": "...",
          "concept": "Nom du concept testé (ex: Dates, Définitions, Formules)"
        }}
      ]
    }}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)

def generate_remediation_content(course_text: str, weak_concepts: List[str], difficulty: int) -> dict:
    print(f"💊 Génération Remédiation (Niveau {difficulty}) pour : {weak_concepts}")
    
    concepts_str = ", ".join(weak_concepts)
    
    prompt = f"""L'élève a échoué sur les concepts suivants : {concepts_str}.
    
    1. Réexplique ces concepts de manière ultra-claire et pédagogique (style "C'est pas sorcier").
    2. Crée 3 flashcards spécifiques pour mémoriser ces points.
    
    Niveau de difficulté actuel : {difficulty}/3 (1=Basique, 3=Expert).
    
    COURS : {course_text[:15000]}

    JSON ATTENDU :
    {{
      "text": "Explication en Markdown...",
      "flashcards": [
        {{ "front": "Question/Concept", "back": "Réponse" }}
      ]
    }}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)

def generate_validation_quiz(course_text: str, concepts: List[str], difficulty: int) -> dict:
    print(f"🎯 Génération Validation (Niveau {difficulty})...")
    
    focus_instruction = ""
    if concepts:
        focus_instruction = f"Concentre les questions sur ces concepts : {', '.join(concepts)}."
    
    difficulty_prompt = ""
    if difficulty == 1: difficulty_prompt = "Questions simples et directes."
    elif difficulty == 2: difficulty_prompt = "Questions pièges ou d'application."
    elif difficulty == 3: difficulty_prompt = "Questions complexes demandant de la réflexion."

    prompt = f"""Crée un quiz de validation de 5 questions.
    {focus_instruction}
    {difficulty_prompt}
    
    COURS : {course_text[:15000]}

    JSON ATTENDU :
    {{
      "questions": [
        {{
          "question": "...",
          "options": ["..."],
          "correct_index": 0,
          "explanation": "...",
          "concept": "..."
        }}
      ]
    }}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)

# ... (Garder les autres fonctions existantes comme chat_with_tutor) ...
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