"""
Quiz Generator - Extract text from images and generate MCQ quizzes with SELF-REFINING
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
    """
    Extract text using GPT-4 Vision with STRUCTURAL formatting.
    """
    prompt = """Extract ALL the text from this image.

    CRITICAL FORMATTING RULES:
    1. Organize the content using Markdown Headers (# for Main Title, ## for Sections, ### for Sub-sections).
    2. Use bullet points (-) for lists.
    3. Use bold (**text**) for key concepts.
    4. If there are formulas, use LaTeX format.
    5. Do not summarize, keep the full content but STRUCTURE IT clearly for reading.
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}},
                ],
            }
        ],
    )
    return response.choices[0].message.content

def verify_and_refine_extraction(image_base64: str, extracted_text: str) -> dict:
    """
    🔄 STEP 2: Verify extraction accuracy and refine if needed
    """

    print("🔍 Verifying text extraction accuracy...")

    verification_prompt = f"""You are a text extraction quality validator. Return your analysis in JSON format.

Compare the EXTRACTED TEXT with the ORIGINAL IMAGE and check:

1. Are all visible words captured?
2. Is the structure preserved (paragraphs, lists, etc.)?
3. Are formulas/equations transcribed correctly?
4. Are there any obvious errors or missing parts?
5. Is the text readable and makes sense?

EXTRACTED TEXT:
{extracted_text}

Return ONLY valid JSON:
{{
  "is_accurate": true or false,
  "confidence_score": 0-100,
  "issues": [
    {{
      "type": "missing_text/wrong_transcription/formatting_error",
      "severity": "high/medium/low",
      "description": "What's wrong",
      "location": "Where in the text"
    }}
  ],
  "needs_refinement": true or false,
  "general_assessment": "Brief overall evaluation"
}}

If confidence_score < 85%, set needs_refinement = true
Return ONLY valid JSON, nothing else."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": verification_prompt
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

    verification = json.loads(response.choices[0].message.content)
    print(f"   Confidence: {verification.get('confidence_score', 0)}%")
    print(f"   Issues found: {len(verification.get('issues', []))}")

    # If needs refinement, do a second extraction with more focus
    if verification.get('needs_refinement', False):
        print("🔧 Refining text extraction...")

        issues_description = "\n".join([
            f"- {issue['description']}" for issue in verification.get('issues', [])
        ])

        refine_prompt = f"""Re-extract the text from this image with EXTRA CARE.

PREVIOUS EXTRACTION HAD THESE ISSUES:
{issues_description}

PREVIOUS EXTRACTED TEXT (for reference):
{extracted_text}

Now extract the text again, fixing these issues:
- Be more careful with formulas and special characters
- Check for missing sections
- Verify formatting and structure
- Double-check numbers and technical terms

Return ONLY the corrected extracted text, nothing else."""

        refine_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": refine_prompt
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

        refined_text = refine_response.choices[0].message.content
        print(f"✅ Text refined: {len(refined_text)} characters")

        verification['refined_text'] = refined_text
        verification['was_refined'] = True
    else:
        verification['refined_text'] = extracted_text
        verification['was_refined'] = False

    return verification


def validate_quiz_quality(course_text: str, quiz_data: dict) -> dict:
    """
    🔄 STEP 3: Validate quiz quality and accuracy
    """

    validation_prompt = f"""You are a quiz quality validator. Analyze this quiz and return your analysis in JSON format.

ORIGINAL COURSE TEXT:
{course_text}

GENERATED QUIZ:
{json.dumps(quiz_data, indent=2, ensure_ascii=False)}

CHECK THE FOLLOWING:
1. Are ALL questions based on FACTS from the course? (not general knowledge)
2. Are the correct answers ACCURATE according to the course text?
3. Are the incorrect options plausible but clearly wrong?
4. Are the explanations clear and refer to the course?
5. Is the difficulty level appropriate?
6. Do the questions test actual understanding (not just memorization)?

Return ONLY valid JSON in this exact format:
{{
  "is_valid": true or false,
  "accuracy_score": 0-100,
  "issues": [
    {{
      "question_index": 0,
      "severity": "high/medium/low",
      "issue": "Description of the problem",
      "suggestion": "How to fix it"
    }}
  ],
  "general_feedback": "Overall assessment"
}}

CRITICAL RULES:
- If a question uses info NOT in the course: is_valid = false
- If correctAnswer is wrong: is_valid = false
- accuracy_score = percentage of questions that are perfectly accurate
- Return ONLY valid JSON"""

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

    print(f"🔍 Quiz Validation Score: {validation_result.get('accuracy_score', 0)}%")
    print(f"   Issues found: {len(validation_result.get('issues', []))}")

    return validation_result


def refine_quiz(course_text: str, quiz_data: dict, validation_result: dict) -> dict:
    """
    🔧 STEP 4: Fix issues found in quiz validation
    """

    if validation_result.get('is_valid', False) and validation_result.get('accuracy_score', 0) >= 90:
        print("✅ Quiz quality is excellent, no refinement needed")
        return quiz_data

    print("🔧 Refining quiz based on validation feedback...")

    refine_prompt = f"""You are a quiz refinement expert. FIX the issues in this quiz and return valid JSON.

ORIGINAL COURSE TEXT:
{course_text}

CURRENT QUIZ (with issues):
{json.dumps(quiz_data, indent=2, ensure_ascii=False)}

VALIDATION ISSUES:
{json.dumps(validation_result.get('issues', []), indent=2, ensure_ascii=False)}

YOUR TASK:
1. Fix EVERY issue mentioned
2. Ensure ALL questions are based ONLY on the course text
3. Verify correct answers are accurate
4. Improve explanations to reference the course
5. Make sure incorrect options are plausible but definitely wrong

Return ONLY the CORRECTED quiz in this EXACT JSON format:
{{
  "questions": [
    {{
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": 0,
      "explanation": "..."
    }}
  ]
}}

CRITICAL: Base EVERYTHING on the course text. NO external information. Return ONLY valid JSON."""

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

    refined_quiz = json.loads(response.choices[0].message.content)
    print("✅ Quiz refined successfully")

    return refined_quiz


def generate_quiz_mcq(
        course_text: str,
        num_questions: int,
        difficulty: str
) -> dict:
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

RÈGLES CRITIQUES:
- Exactement {num_questions} questions
- Chaque question a EXACTEMENT 4 options
- correctAnswer est l'index de la bonne réponse (0, 1, 2, ou 3)
- VARIE les positions: ne mets pas toujours correctAnswer à 0
- Les options incorrectes doivent être plausibles mais clairement fausses
- Chaque question doit avoir une "explanation" courte qui CITE le cours
- Base-toi UNIQUEMENT sur le contenu du cours fourni (pas de connaissances externes)
- Les questions doivent être PRÉCISES et VÉRIFIABLES dans le cours
- Pas de texte avant ou après le JSON, UNIQUEMENT le JSON
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
    )

    quiz_data = json.loads(response.choices[0].message.content)
    print("✅ Initial quiz generated")

    return quiz_data


def quiz_generator_from_image(
        image_base64: str,
        num_questions: int = 5,
        difficulty: str = "medium",
        enable_refinement: bool = True
) -> dict:
    """
    Generate quiz from course image with COMPLETE SELF-REFINING
    """

    print(f"📸 Quiz generation started (Self-Refining: {'ON' if enable_refinement else 'OFF'})")
    print(f"   Parameters: {num_questions} questions, difficulty: {difficulty}")

    try:
        # 🔄 STEP 1: Extract text from image
        print("\n1️⃣ Extracting text from image...")
        course_text = extract_text(image_base64)

        if not course_text or len(course_text.strip()) < 10:
            raise ValueError("Failed to extract text from image or text too short")

        extraction_metadata = {
            "initial_length": len(course_text),
            "was_refined": False,
            "confidence_score": 100
        }

        # 🔄 STEP 2: Verify and refine extraction (if enabled)
        if enable_refinement:
            print("\n2️⃣ Verifying text extraction...")
            verification = verify_and_refine_extraction(image_base64, course_text)

            if verification.get('was_refined', False):
                course_text = verification['refined_text']
                print(f"   ✅ Text was refined (confidence: {verification.get('confidence_score', 0)}%)")

            extraction_metadata = {
                "initial_length": extraction_metadata["initial_length"],
                "final_length": len(course_text),
                "was_refined": verification.get('was_refined', False),
                "confidence_score": verification.get('confidence_score', 0),
                "issues_found": len(verification.get('issues', []))
            }

        # 🔄 STEP 3: Generate quiz
        print(f"\n3️⃣ Generating quiz ({num_questions} questions, {difficulty})...")
        quiz_data = generate_quiz_mcq(course_text, num_questions, difficulty)

        # Validate structure
        if "questions" not in quiz_data:
            raise ValueError("Invalid quiz format: missing 'questions' key")

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

        # 🔄 STEP 4: Validate and refine quiz (if enabled)
        quiz_metadata = {
            "was_refined": False,
            "initial_score": 100,
            "final_score": 100
        }

        if enable_refinement:
            print("\n4️⃣ Validating quiz quality...")
            validation_result = validate_quiz_quality(course_text, quiz_data)

            quiz_metadata["initial_score"] = validation_result.get('accuracy_score', 0)

            # If validation fails or score is low, refine
            if not validation_result.get('is_valid', False) or validation_result.get('accuracy_score', 0) < 90:
                print("\n5️⃣ Refining quiz...")
                quiz_data = refine_quiz(course_text, quiz_data, validation_result)

                # Re-validate after refinement
                print("\n6️⃣ Re-validating refined quiz...")
                final_validation = validate_quiz_quality(course_text, quiz_data)

                quiz_metadata["final_score"] = final_validation.get('accuracy_score', 0)
                quiz_metadata["was_refined"] = True

                print(f"   ✅ Quiz refined (score: {quiz_metadata['initial_score']}% → {quiz_metadata['final_score']}%)")
            else:
                quiz_metadata["final_score"] = validation_result.get('accuracy_score', 0)
                quiz_metadata["was_refined"] = False
                print(f"   ✅ Quiz quality is good ({quiz_metadata['final_score']}%)")

        # ✨ Add metadata to result
        quiz_data["extractedText"] = course_text
        quiz_data["metadata"] = {
            "extraction": extraction_metadata,
            "quiz_quality": quiz_metadata,
            "self_refining_enabled": enable_refinement
        }

        print(f"\n✅ FINAL RESULT:")
        print(f"   Questions: {len(quiz_data['questions'])}")
        print(f"   Text length: {len(course_text)} characters")
        if enable_refinement:
            print(f"   Text confidence: {extraction_metadata.get('confidence_score', 'N/A')}%")
            print(f"   Quiz quality: {quiz_metadata.get('final_score', 'N/A')}%")
            print(f"   Refinements: Text={extraction_metadata.get('was_refined', False)}, Quiz={quiz_metadata.get('was_refined', False)}")

        return quiz_data

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        raise Exception(f"Failed to parse quiz JSON: {str(e)}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise


def quiz_generator_from_text(
        course_text: str,
        num_questions: int = 5,
        difficulty: str = "medium",
        enable_refinement: bool = True
) -> dict:
    """
    Generate quiz from course text with SELF-REFINING
    """

    print(f"📝 Quiz generation from text (Self-Refining: {'ON' if enable_refinement else 'OFF'})")

    try:
        # Generate quiz
        print("1️⃣ Generating quiz...")
        quiz_data = generate_quiz_mcq(course_text, num_questions, difficulty)

        # Validate structure
        if "questions" not in quiz_data:
            raise ValueError("Invalid quiz format: missing 'questions' key")

        quiz_metadata = {
            "was_refined": False,
            "initial_score": 100,
            "final_score": 100
        }

        # Validate and refine (if enabled)
        if enable_refinement:
            print("2️⃣ Validating quiz quality...")
            validation_result = validate_quiz_quality(course_text, quiz_data)

            quiz_metadata["initial_score"] = validation_result.get('accuracy_score', 0)

            if not validation_result.get('is_valid', False) or validation_result.get('accuracy_score', 0) < 90:
                print("3️⃣ Refining quiz...")
                quiz_data = refine_quiz(course_text, quiz_data, validation_result)

                final_validation = validate_quiz_quality(course_text, quiz_data)
                quiz_metadata["final_score"] = final_validation.get('accuracy_score', 0)
                quiz_metadata["was_refined"] = True
            else:
                quiz_metadata["final_score"] = validation_result.get('accuracy_score', 0)

        quiz_data["metadata"] = {
            "quiz_quality": quiz_metadata,
            "self_refining_enabled": enable_refinement
        }

        print(f"✅ Quiz generated: {len(quiz_data['questions'])} questions")
        if enable_refinement:
            print(f"   Quality score: {quiz_metadata.get('final_score', 'N/A')}%")

        return quiz_data

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise