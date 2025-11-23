"""
Learning Path, Motivator & Chat Generator
Ce fichier contient toute la logique IA pour les features avancées.
"""
import json
import os
from typing import List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ==========================================
# 1. MODE PARCOURS (INTERACTIF)
# ==========================================

def generate_mastery_path(course_text: str) -> dict:
    """
    Génère un parcours interactif étape par étape (Feynman, Active Recall, etc.)
    """
    print("🧬 Generating Interactive Mastery Path...")

    prompt = f"""You are an expert pedagogical engineer. Design a 3-STEP ACTIVE LEARNING SESSION for this course content.
    
    COURSE TEXT: {course_text[:3000]}... (truncated)

    Create 3 SPECIFIC interactive steps for the student.
    
    1. "FEYNMAN": Pick a complex concept and ask the user to explain it simply.
    2. "QUIZ": Ask a specific open-ended question (no options) that requires deep understanding.
    3. "SYNTHESIS": Ask for a summary of the key takeaways.

    Return JSON format:
    {{
      "steps": [
        {{
          "id": 1,
          "type": "feynman",
          "concept": "Name of the concept",
          "instruction": "Explain [Concept] to a 5-year-old using an analogy.",
          "xp": 50
        }},
        {{
          "id": 2,
          "type": "quiz_open",
          "instruction": "What is the relationship between X and Y according to the text?",
          "xp": 30
        }},
        {{
           "id": 3,
           "type": "synthesis",
           "instruction": "Summarize the main idea in one sentence.",
           "xp": 100
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
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error generating path: {e}")
        # Fallback au cas où l'IA échoue
        return {"steps": []}


def evaluate_student_answer(instruction: str, student_answer: str, course_context: str) -> dict:
    """
    Corrige la réponse de l'élève (Feynman ou Quiz)
    """
    prompt = f"""You are a teacher correcting a student.
    
    CONTEXT: {course_context[:2000]}
    QUESTION/INSTRUCTION: {instruction}
    STUDENT ANSWER: {student_answer}
    
    Evaluate the answer based on the context.
    
    Return JSON:
    {{
      "is_correct": boolean,
      "feedback": "Detailed feedback explaining why it is right or wrong.",
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
# 2. MOTIVATEUR
# ==========================================

def generate_daily_plan(goal: str, deadline: str, current_xp: int) -> dict:
    """
    Découpe un objectif en micro-tâches pour la motivation
    """
    prompt = f"""You are a productivity coach. 
    GOAL: "{goal}" | DEADLINE: "{deadline}" | XP: {current_xp}.

    Create a plan for TODAY only.
    
    Return JSON:
    {{
      "daily_message": "Short encouraging message",
      "quote": "Motivational quote",
      "micro_tasks": [
        {{
          "id": 1,
          "task": "Actionable micro-task (e.g. Read page 5)",
          "xp_reward": 20
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


# ==========================================
# 3. CHAT TUTOR (C'est celle-ci qui manquait !)
# ==========================================

def chat_with_tutor(history: List[dict], course_context: str) -> str:
    """
    Gère la conversation avec le Professeur IA Socratique
    """
    system_prompt = f"""Tu es le "Professeur Studia", un tuteur IA bienveillant et socratique.
    
    CONTEXTE DU COURS:
    {course_context[:4000]}
    
    TES RÈGLES PÉDAGOGIQUES CRITIQUES :
    1. NE DONNE JAMAIS la réponse directe tout de suite.
    2. Pose des questions pour guider l'étudiant vers la réponse ("À ton avis...", "Rappelle-toi de...").
    3. Utilise des analogies simples pour expliquer les concepts complexes.
    4. Si l'étudiant est bloqué, donne un indice, puis un autre.
    5. Sois encourageant et chaleureux (utilise quelques emojis).
    6. Vérifie toujours la compréhension à la fin ("Est-ce que ça fait sens pour toi ?").
    
    Réponds de manière concise.
    """

    # On nettoie l'historique pour s'assurer du format
    clean_history = [{"role": "system", "content": system_prompt}]

    for msg in history:
        if msg.get("role") in ["user", "assistant"]:
            clean_history.append({
                "role": msg["role"],
                "content": msg["content"]
            })

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=clean_history,
        temperature=0.7
    )

    return response.choices[0].message.content