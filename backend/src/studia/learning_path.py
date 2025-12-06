"""
Learning Path Generator - Studia Method (V3)
"""
import json
import os
from typing import List, Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_mastery_path(course_text: str) -> dict:
    print("🧬 Génération Parcours 'Studia Method'...")

    safe_text = course_text[:20000]

    prompt = f"""Tu es un architecte pédagogique expert. Ton but est de faire maîtriser ce cours à un étudiant via la 'Méthode Studia'.
    
    COURS SOURCE :
    {safe_text}

    TA MISSION :
    Découpe ce cours en une série de modules suivant EXACTEMENT cette structure :

    1. Module 1 : "Diagnostic Initial"
       - Type : 'diagnostic'
       - Contenu : Un quiz global de 5 questions pour repérer les lacunes.

    2. Module 2 : "Remédiation Immédiate"
       - Type : 'remediation'
       - Contenu : 5 Flashcards ciblant les erreurs fréquentes + Explication courte.

    3. Modules 3 à X : "Approfondissement Thématique" (autant que nécessaire selon la longueur du cours)
       - Type : 'deep_dive'
       - Titre : Le nom du concept clé.
       - Contenu : Cours détaillé + Quiz spécifique (3 questions).

    4. Avant-Dernier Module : "Synthèse & Ancrage"
       - Type : 'final_review'
       - Contenu : Quiz difficile sur TOUT le cours (10 questions) + Flashcards ultimes.

    5. Dernier Module : "Examen Blanc (DS)"
       - Type : 'exam'
       - Contenu : Une étude de cas complexe à résoudre par écrit (type DS).

    FORMAT JSON ATTENDU (Strictement) :
    {{
      "modules": [
        {{
          "title": "Diagnostic Initial",
          "description": "Évaluation de vos connaissances actuelles.",
          "type": "diagnostic",
          "quiz": [ ... 5 questions ... ]
        }},
        {{
          "title": "Remédiation & Ancrage",
          "description": "Apprentissage ciblé par Flashcards.",
          "type": "remediation",
          "flashcards": [ {{ "front": "...", "back": "..." }}, ... ]
        }},
        {{
          "title": "Thème 1 : [Nom]",
          "type": "deep_dive",
          "content": "Cours...",
          "quiz": [ ... ]
        }},
        {{
          "title": "Grand Chelem (Synthèse)",
          "type": "final_review",
          "quiz": [ ... 10 questions ... ],
          "flashcards": [ ... ]
        }},
        {{
          "title": "Examen Blanc (DS)",
          "type": "exam",
          "practice": {{
             "instruction": "Sujet du DS...",
             "solution_key_points": ["..."]
          }}
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
        print(f"❌ Erreur IA: {e}")
        return {"modules": []}

# ... (Garder les autres fonctions utilitaires comme chat_with_tutor, etc.) ...
# Copie-les depuis la version précédente pour ne pas casser les imports.
def generate_diagnostic_quiz(t): return {}
def generate_remediation_content(t, w, d): return {}
def generate_validation_quiz(t, c, d): return {}
def evaluate_student_answer(i, s, c): return {}
def generate_daily_plan(g, d, c): return {}
def chat_with_tutor(h, c): return ""