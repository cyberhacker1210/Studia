"""
Flashcard Generator - Generate flashcards from course text
"""
import json
import re
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_flashcards(
        course_text: str,
        num_cards: int = 10,
        difficulty: str = "medium"
) -> dict:
    """
    Generate flashcards from course text

    Args:
        course_text: Text extracted from course
        num_cards: Number of flashcards to generate
        difficulty: easy, medium, or hard

    Returns:
        dict: Flashcards data
    """

    difficulty_instructions = {
        "easy": "Les flashcards doivent couvrir les concepts de base et les définitions simples.",
        "medium": "Les flashcards doivent aborder des concepts intermédiaires et leurs applications.",
        "hard": "Les flashcards doivent inclure des concepts avancés et des relations complexes."
    }

    prompt = f"""Tu es un assistant qui répond toujours et juste en JSON. Pas de texte parasite, que du JSON.

Crée {num_cards} flashcards (cartes mémoire) basées UNIQUEMENT sur ce cours.

COURS:
{course_text}

DIFFICULTÉ: {difficulty}
{difficulty_instructions[difficulty]}

Le JSON doit être EXACTEMENT comme ceci:
{{
  "flashcards": [
    {{
      "front": "Qu'est-ce que la photosynthèse ?",
      "back": "La photosynthèse est le processus par lequel les plantes convertissent la lumière du soleil en énergie chimique.",
      "category": "Biologie",
      "difficulty": "{difficulty}"
    }},
    {{
      "front": "Formule de la photosynthèse",
      "back": "6CO₂ + 6H₂O + lumière → C₆H₁₂O₆ + 6O₂",
      "category": "Biologie",
      "difficulty": "{difficulty}"
    }}
  ]
}}

RÈGLES IMPORTANTES:
- Exactement {num_cards} flashcards
- Chaque flashcard a :
  * "front" : la question/concept (court et clair)
  * "back" : la réponse/explication (détaillée mais concise)
  * "category" : catégorie du sujet (ex: Mathématiques, Histoire, etc.)
  * "difficulty" : "{difficulty}"
- Varie les types : définitions, formules, concepts, applications, exemples
- Les réponses doivent être complètes mais faciles à mémoriser
- Base-toi UNIQUEMENT sur le contenu du cours fourni
- Pas de texte avant ou après le JSON, UNIQUEMENT le JSON
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
            }
        ],
    )

    flashcards_json = response.choices[0].message.content

    # Clean JSON
    flashcards_json = re.sub(r"```json\n?", "", flashcards_json)
    flashcards_json = re.sub(r"```\n?", "", flashcards_json)

    # Parse JSON
    flashcards_data = json.loads(flashcards_json.strip())

    # Validate
    if "flashcards" not in flashcards_data:
        raise ValueError("Invalid flashcards format: missing 'flashcards' key")

    for i, card in enumerate(flashcards_data["flashcards"]):
        if "front" not in card or "back" not in card:
            raise ValueError(f"Flashcard {i + 1}: missing 'front' or 'back' field")
        if "category" not in card:
            card["category"] = "Général"
        if "difficulty" not in card:
            card["difficulty"] = difficulty

    print(f"✅ Generated {len(flashcards_data['flashcards'])} flashcards")

    return flashcards_data