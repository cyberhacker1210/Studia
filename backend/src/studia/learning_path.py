"""
Learning Path Generator (Interactive Mode)
"""
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)


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