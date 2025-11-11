"""
Quiz Generator - Extract text from images and generate MCQ quizzes
"""
import os
import re
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# OpenAI Client
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)


def extract_text(image_base64: str) -> str:
    """Extract text from image using GPT-4 Vision"""

    prompt = "Extract the text from this image: don't add any information or comments."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        },
                    },
                ],
            }
        ],
    )

    extracted_text = response.choices[0].message.content
    print(f"✅ Text extracted: {len(extracted_text)} characters")
    return extracted_text


def generate_quiz_mcq(
        course_text: str,
        num_questions: int,
        difficulty: str
) -> str:
    """Generate MCQ quiz from course text"""

    difficulty_instructions = {
        "easy": "Les questions doivent être simples et directes, adaptées aux débutants.",
        "medium": "Les questions doivent être de difficulté moyenne, nécessitant une bonne compréhension du cours.",
        "hard": "Les questions doivent être difficiles et exiger une connaissance approfondie du cours."
    }

    prompt = f"""Tu es un assistant qui répond toujours et juste en JSON. Pas de texte parasite, que du JSON.

Crée un quiz de {num_questions} questions à choix multiples (QCM) basé UNIQUEMENT sur ce cours.

COURS:
{course_text}

DIFFICULTÉ: {difficulty}
{difficulty_instructions[difficulty]}

Le JSON doit être EXACTEMENT comme ceci:
{{
  "questions": [
    {{
      "question": "Quelle est la formule de la production mentionnée dans le cours?",
      "options": [
        "Production = Travail + Machines + Aléa",
        "Production = Capital + Travail",
        "Production = Coût + Bénéfice",
        "Production = Offre + Demande"
      ],
      "correctAnswer": 0,
      "explanation": "Selon le cours, la formule exacte est Production = Travail + Machines + Aléa"
    }}
  ]
}}

RÈGLES IMPORTANTES:
- Exactement {num_questions} questions
- Chaque question a EXACTEMENT 4 options
- correctAnswer est l'index de la bonne réponse (0, 1, 2, ou 3)
- VARIE les positions: ne mets pas toujours correctAnswer à 0
- Les options incorrectes doivent être plausibles mais clairement fausses
- Chaque question doit avoir une "explanation" courte
- Base-toi UNIQUEMENT sur le contenu du cours fourni
- Pas de texte avant ou après le JSON, UNIQUEMENT le JSON
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                ],
            }
        ],
    )

    print("✅ Quiz generated")
    return response.choices[0].message.content


def clean_json_text(json_text: str) -> str:
    """Clean JSON text by removing markdown code blocks"""
    data = re.sub(r"```json\n?", "", json_text)
    data = re.sub(r"```\n?", "", data)
    return data.strip()


def quiz_generator_from_image(
        image_base64: str,
        num_questions: int = 5,
        difficulty: str = "medium"
) -> dict:
    """
    Generate quiz from course image

    Args:
        image_base64: Base64 encoded image (without data URI prefix)
        num_questions: Number of questions to generate
        difficulty: easy, medium, or hard

    Returns:
        dict: Quiz data with questions
    """

    print(f"📸 Quiz generation started")
    print(f"   Parameters: {num_questions} questions, difficulty: {difficulty}")

    try:
        # Step 1: Extract text from image
        course_text = extract_text(image_base64)

        if not course_text or len(course_text.strip()) < 10:
            raise ValueError("Failed to extract text from image or text too short")

        # Step 2: Generate quiz from extracted text
        quiz_json = generate_quiz_mcq(course_text, num_questions, difficulty)

        # Step 3: Clean JSON
        quiz_json_clean = clean_json_text(quiz_json)

        # Step 4: Parse JSON
        quiz_data = json.loads(quiz_json_clean)

        # Step 5: Validate structure
        if "questions" not in quiz_data:
            raise ValueError("Invalid quiz format: missing 'questions' key")

        if len(quiz_data["questions"]) != num_questions:
            print(f"⚠️ Warning: Expected {num_questions} questions, got {len(quiz_data['questions'])}")

        # Validate each question
        for i, q in enumerate(quiz_data["questions"]):
            if "question" not in q:
                raise ValueError(f"Question {i + 1}: missing 'question' field")
            if "options" not in q or len(q["options"]) != 4:
                raise ValueError(f"Question {i + 1}: must have exactly 4 options")
            if "correctAnswer" not in q:
                raise ValueError(f"Question {i + 1}: missing 'correctAnswer' field")
            if not (0 <= q["correctAnswer"] <= 3):
                raise ValueError(f"Question {i + 1}: correctAnswer must be 0-3")
            if "explanation" not in q:
                q["explanation"] = ""

        print(f"✅ Quiz successfully generated: {len(quiz_data['questions'])} questions")
        return quiz_data

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        raise Exception(f"Failed to parse quiz JSON: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise