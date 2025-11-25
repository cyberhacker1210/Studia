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

def generate_mastery_path(course_text: str) -> dict:
    print("🧬 Génération Parcours...")
    prompt = f"""Expert pédagogique. Crée un parcours pour ce cours: {course_text[:3000]}...
    JSON ATTENDU:
    {{
      "learning_content": "Résumé Markdown...",
      "flashcards": [{{ "front": "Q", "back": "R" }}],
      "quiz": [{{ "question": "Q?", "options": ["A","B"], "correct_index": 0 }}],
      "practice_task": {{ "instruction": "Exercice...", "xp": 100 }}
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
        print(f"Error: {e}")
        return {}

def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    prompt = f"""Corrige en français. Context: {course_context[:1000]}. Question: {instruction}. Reponse: {student_answer}.
    JSON: {{ "is_correct": bool, "feedback": "string", "score": int }}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)

def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    prompt = f"""Coach productivité FR. But: {goal}. Deadline: {deadline}.
    JSON: {{ "daily_message": "...", "quote": "...", "micro_tasks": [{{ "id": 1, "task": "...", "xp_reward": 20 }}] }}"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)

def chat_with_tutor(history: List[dict], course_context: str) -> str:
    clean_history = [{"role": "system", "content": f"Tuteur Socratique FR. Contexte: {course_context[:3000]}"}]
    for msg in history:
        if msg.get("role") in ["user", "assistant"]:
            clean_history.append({"role": msg["role"], "content": str(msg["content"])})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=clean_history
    )
    return response.choices[0].message.content