"""
Learning Path Generator - Micro-Learning Version
"""
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_mastery_path(course_text: str) -> dict:
    print("🧬 Génération Parcours Micro-Learning...")

    prompt = f"""Tu es un architecte pédagogique expert (style Brilliant.org).
    
    TA MISSION :
    Découpe ce cours en 3 modules progressifs pour un apprentissage sur 3 jours.
    Chaque module doit être court, percutant et interactif.

    LE COURS :
    {course_text[:15000]} (tronqué si trop long)

    FORMAT JSON ATTENDU :
    {{
      "modules": [
        {{
          "title": "Jour 1 : Les Fondamentaux",
          "description": "Comprendre les concepts clés.",
          "content": "Explication claire et concise (Markdown)...",
          "quiz": [
             {{ "question": "...", "options": ["A","B"], "correct_index": 0, "explanation": "..." }}
          ]
        }},
        {{
          "title": "Jour 2 : Analyse & Mécanismes",
          "description": "Comment ça marche en détail.",
          "content": "Explication approfondie (Markdown)...",
          "quiz": [ ... ]
        }},
        {{
          "title": "Jour 3 : Application & Synthèse",
          "description": "Mise en pratique et maîtrise.",
          "content": "Synthèse et cas concrets (Markdown)...",
          "quiz": [ ... ]
        }}
      ]
    }}

    RÈGLES :
    1. Le contenu doit être pédagogique, tutoyant l'élève.
    2. Chaque module doit avoir exactement 2 questions de quiz pour vérifier la compréhension immédiate.
    3. JSON pur uniquement.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error: {e}")
        return {"modules": []}

# Les autres fonctions (evaluate_student_answer, etc.) restent inchangées...
def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    prompt = f"""Corrige en français. Context: {course_context[:1000]}. Question: {instruction}. Reponse: {student_answer}.
    JSON: {{ "is_correct": bool, "feedback": "string", "score": int }}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)

def chat_with_tutor(history: list, course_context: str) -> str:
    clean_history = [{"role": "system", "content": f"Tuteur Socratique FR. Contexte: {course_context[:3000]}"}]
    for msg in history:
        if msg.get("role") in ["user", "assistant"]:
            clean_history.append({"role": msg["role"], "content": str(msg["content"])})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=clean_history
    )
    return response.choices[0].message.content

def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    return {} # Placeholder si non utilisé