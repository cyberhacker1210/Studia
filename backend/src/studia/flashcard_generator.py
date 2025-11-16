"""
Flashcard Generator - Generate flashcards from course text with SELF-REFINING
"""
import json
import re
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def validate_flashcards_quality(course_text: str, flashcards_data: dict) -> dict:
    """
    🔄 STEP 1: Validate flashcard quality and accuracy

    Returns:
    {
        "is_valid": bool,
        "quality_score": 0-100,
        "issues": [...],
        "general_feedback": str
    }
    """

    print("🔍 Validating flashcards quality...")

    validation_prompt = f"""You are a flashcard quality validator. Analyze these flashcards.

ORIGINAL COURSE TEXT:
{course_text}

GENERATED FLASHCARDS:
{json.dumps(flashcards_data, indent=2, ensure_ascii=False)}

CHECK THE FOLLOWING:
1. Is each "front" (question/concept) based on actual content from the course?
2. Is each "back" (answer) ACCURATE according to the course text?
3. Are the flashcards testing KEY concepts (not trivial/useless facts)?
4. Is the information complete but concise on the "back"?
5. Are there any duplicates or very similar cards?
6. Is the difficulty level appropriate?
7. Are formulas/technical terms correctly written?

Return ONLY valid JSON in this exact format:
{{
  "is_valid": true or false,
  "quality_score": 0-100,
  "issues": [
    {{
      "card_index": 0,
      "severity": "high/medium/low",
      "issue": "Description of the problem",
      "suggestion": "How to fix it"
    }}
  ],
  "general_feedback": "Overall assessment of the flashcards quality"
}}

CRITICAL RULES:
- If a flashcard uses info NOT in the course: is_valid = false, high severity
- If an answer is incomplete or wrong: is_valid = false, high severity
- quality_score = percentage of flashcards that are perfectly accurate and useful
- List ALL issues found, even small ones"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": validation_prompt
            }
        ],
    )

    validation_result = json.loads(response.choices[0].message.content)

    print(f"   Quality Score: {validation_result.get('quality_score', 0)}%")
    print(f"   Issues found: {len(validation_result.get('issues', []))}")

    return validation_result


def refine_flashcards(course_text: str, flashcards_data: dict, validation_result: dict) -> dict:
    """
    🔧 STEP 2: Fix issues found in flashcard validation
    """

    if validation_result.get('is_valid', False) and validation_result.get('quality_score', 0) >= 90:
        print("✅ Flashcards quality is excellent, no refinement needed")
        return flashcards_data

    print("🔧 Refining flashcards based on validation feedback...")

    refine_prompt = f"""You are a flashcard refinement expert. FIX the issues in these flashcards.

ORIGINAL COURSE TEXT:
{course_text}

CURRENT FLASHCARDS (with issues):
{json.dumps(flashcards_data, indent=2, ensure_ascii=False)}

VALIDATION ISSUES:
{json.dumps(validation_result.get('issues', []), indent=2, ensure_ascii=False)}

YOUR TASK:
1. Fix EVERY issue mentioned
2. Ensure ALL flashcards are based ONLY on the course text
3. Verify answers are complete and accurate
4. Remove duplicates if any
5. Make sure "front" is clear and "back" is comprehensive but concise

Return ONLY the CORRECTED flashcards in this EXACT format:
{{
  "flashcards": [
    {{
      "front": "Question/Concept",
      "back": "Complete and accurate answer",
      "category": "Category name",
      "difficulty": "easy/medium/hard"
    }}
  ]
}}

RULES:
- Keep the SAME number of flashcards
- Base EVERYTHING on the course text
- Do NOT add external information
- Make answers specific and complete
- "front" should be short (1 sentence max)
- "back" should be concise but complete (2-3 sentences)"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": refine_prompt
            }
        ],
    )

    refined_flashcards = json.loads(response.choices[0].message.content)
    print("✅ Flashcards refined successfully")

    return refined_flashcards


def generate_flashcards(
        course_text: str,
        num_cards: int = 10,
        difficulty: str = "medium",
        enable_refinement: bool = True  # ✨ NEW: Toggle self-refining
) -> dict:
    """
    Generate flashcards from course text with SELF-REFINING

    Args:
        course_text: Text extracted from course
        num_cards: Number of flashcards to generate
        difficulty: easy, medium, or hard
        enable_refinement: Enable self-refining validation (default: True)

    Returns:
        dict: Flashcards data with metadata
    """

    print(f"🎴 Flashcard generation started (Self-Refining: {'ON' if enable_refinement else 'OFF'})")
    print(f"   Parameters: {num_cards} cards, difficulty: {difficulty}")

    try:
        # STEP 1: Generate initial flashcards
        print("\n1️⃣ Generating initial flashcards...")

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

RÈGLES CRITIQUES:
- Exactement {num_cards} flashcards
- Chaque flashcard a :
  * "front" : la question/concept (court et clair, 1 phrase max)
  * "back" : la réponse/explication (complète mais concise, 2-3 phrases)
  * "category" : catégorie du sujet (ex: Mathématiques, Histoire, etc.)
  * "difficulty" : "{difficulty}"
- Varie les types : définitions, formules, concepts, applications, processus
- Les réponses doivent être PRÉCISES et VÉRIFIABLES dans le cours
- Base-toi UNIQUEMENT sur le contenu du cours fourni (pas de connaissances externes)
- Pas de texte avant ou après le JSON, UNIQUEMENT le JSON
- Teste des concepts IMPORTANTS, pas des détails insignifiants
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

        # STEP 2: Validate structure
        if "flashcards" not in flashcards_data:
            raise ValueError("Invalid flashcards format: missing 'flashcards' key")

        if len(flashcards_data["flashcards"]) != num_cards:
            print(f"⚠️ Warning: Expected {num_cards} flashcards, got {len(flashcards_data['flashcards'])}")

        for i, card in enumerate(flashcards_data["flashcards"]):
            if "front" not in card or "back" not in card:
                raise ValueError(f"Flashcard {i + 1}: missing 'front' or 'back' field")
            if "category" not in card:
                card["category"] = "Général"
            if "difficulty" not in card:
                card["difficulty"] = difficulty

        print(f"✅ Initial flashcards generated: {len(flashcards_data['flashcards'])}")

        # 🔄 STEP 3: SELF-REFINING (if enabled)
        metadata = {
            "was_refined": False,
            "initial_score": 100,
            "final_score": 100
        }

        if enable_refinement:
            print("\n2️⃣ Validating flashcards quality...")
            validation_result = validate_flashcards_quality(course_text, flashcards_data)

            metadata["initial_score"] = validation_result.get('quality_score', 0)

            # If validation fails or score is low, refine
            if not validation_result.get('is_valid', False) or validation_result.get('quality_score', 0) < 90:
                print("\n3️⃣ Refining flashcards...")
                flashcards_data = refine_flashcards(course_text, flashcards_data, validation_result)

                # Re-validate after refinement
                print("\n4️⃣ Re-validating refined flashcards...")
                final_validation = validate_flashcards_quality(course_text, flashcards_data)

                metadata["final_score"] = final_validation.get('quality_score', 0)
                metadata["was_refined"] = True

                print(f"   ✅ Flashcards refined (score: {metadata['initial_score']}% → {metadata['final_score']}%)")
            else:
                metadata["final_score"] = validation_result.get('quality_score', 0)
                metadata["was_refined"] = False
                print(f"   ✅ Flashcards quality is good ({metadata['final_score']}%)")

        # ✨ Add metadata to result
        flashcards_data["metadata"] = {
            "quality": metadata,
            "self_refining_enabled": enable_refinement
        }

        print(f"\n✅ FINAL RESULT:")
        print(f"   Flashcards: {len(flashcards_data['flashcards'])}")
        if enable_refinement:
            print(f"   Quality score: {metadata.get('final_score', 'N/A')}%")
            print(f"   Refined: {metadata.get('was_refined', False)}")

        return flashcards_data

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        raise Exception(f"Failed to parse flashcards JSON: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise