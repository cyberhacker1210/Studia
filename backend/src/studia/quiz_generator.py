import os
import base64
import re
from http.client import responses

from dotenv import load_dotenv
from openai import OpenAI

from . import settings

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)
image_path = settings.IMAGE_PATH


def load_course(path_to_image):
    with open(path_to_image, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")
        return image_base64


def extract_text(image_base64):
    prompt = "Extract the text from this image :don't add any information or comments."
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
                            "url": f"data:image/png;base64,{image_base64}"
                        },
                    },
                ],
            }
        ],
    )

    print(response.choices[0].message.content)
    return response.choices[0].message.content

def quiz_generator():
    course = load_course(image_path)
    context = extract_text(course)



    prompt = """Tu es un assistant qui répond toujours et juste en JSON avec deux clés : 'question' et 'answer'. Pas de texte parasite, que du JSON.
    Crée un quiz basé uniquement sur ce cours : le quiz doit traiter seulement le contenu du cours, ne pas ajouter d'informations ou de commentaires.
    Le JSON doit être comme ceci :

    {
      "quiz": [
        {
          "question": "Quelle est la formule de la production ?",
          "answer": "Production = Travail + Machines + Aléa"
        },
        {
          "question": "Quelle institution française est mentionnée ?",
          "answer": "INSEE"
        }
      ]
    }
    """


    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format="json",

        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt + context
                    },
                ],
            }
        ],
    )
    print("quiz generated")
    print(response.choices[0].message.content)
    return response.choices[0].message.content

def clear_text():
    response = quiz_generator()
    data = re.sub(r"```", "", response)
    data = re.sub(r"```json", "", response)
    return data


def create_quiz():
    data = clear_text()
    return data


def main():
    create_quiz()
