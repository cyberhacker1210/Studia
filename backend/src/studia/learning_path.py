"""
Learning Path, Motivator & Chat Generator
"""
import json
import os
from typing import List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ==========================================
# 1. MODE PARCOURS (NOUVELLE LOGIQUE 3 ÉTAPES)
# ==========================================

def generate_mastery_path(course_text: str) -> dict:
    """
    Génère un parcours en 3 phases : Apprentissage, Quiz, Pratique.
    """
    print("🧬 Generating Scientific Mastery Path...")

    prompt = f"""You are a pedagogical expert. Create a Mastery Session for this course.

    COURSE TEXT: {course_text[:3500]}...

    Generate a JSON object with exactly 3 parts:
    
    1. "learning_content": A clear, structured summary of the KEY concepts (Markdown format).
    2. "quiz": 5 Multiple Choice Questions to test understanding.
    3. "practice_task": One complex practical exercise to apply knowledge.

    JSON FORMAT:
    {{
      "learning_content": "## Title\\n\\nExplanation of concepts...",
      "quiz": [
        {{
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_index": 0 (0-3)
        }},
        ... (5 questions total)
      ],
      "practice_task": {{
        "instruction": "Describe a specific scenario where the student must apply the course.",
        "xp": 100
      }}
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
        print(f"Error path: {e}")
        return {} # Géré dans le main.py

def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    """Corrige l'exercice pratique"""
    prompt = f"""Teacher context.
    COURSE: {course_context[:2000]}
    TASK: {instruction}
    ANSWER: {student_answer}
    
    Return JSON:
    {{
      "is_correct": boolean,
      "feedback": "Constructive feedback.",
      "score": number (0-100)
    }}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)


# ==========================================
# 2. CHAT TUTOR (CORRECTION ERREUR)
# ==========================================

def chat_with_tutor(history: List[dict], course_context: str) -> str:
    """
    Gère la conversation avec le Professeur IA (Sécurisé)
    """
    system_prompt = f"""Tu es le Professeur Studia, tuteur socratique.
    CONTEXTE: {course_context[:3000]}
    RÈGLES: Ne donne pas la réponse, guide l'étudiant. Sois bref."""

    # ✅ FIX: On reconstruit l'historique proprement pour éviter les erreurs de format
    clean_history = [{"role": "system", "content": system_prompt}]

    for msg in history:
        # On ne garde que user et assistant, et on ignore les messages vides
        if msg.get("role") in ["user", "assistant"] and msg.get("content"):
            clean_history.append({
                "role": msg["role"],
                "content": str(msg["content"]) # Force string
            })

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=clean_history,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Chat Error: {e}")
        return "Je réfléchis encore... Peux-tu reformuler ?"

# ==========================================
# 3. MOTIVATEUR (Inchangé)
# ==========================================
def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    prompt = f"""Productivity Coach. GOAL: {goal}, DEADLINE: {deadline}.
    Return JSON: {{ "daily_message": "...", "quote": "...", "micro_tasks": [{{ "id": 1, "task": "...", "xp_reward": 20 }}] }}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)