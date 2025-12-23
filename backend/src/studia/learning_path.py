import json
import os
from typing import List, Literal, Optional, Any

from pip._internal.commands import completion
from pydantic import BaseModel, Field
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# --- MODÈLES COMMUNS ---
class FlashcardItem(BaseModel): front: str; back: str


class QuizItem(BaseModel): question: str; options: List[str]; correctAnswer: int; explanation: str


class OpenQuestion(BaseModel): instruction: str; expected_answer_points: List[str]


# --- NOUVEAU : FICHE DE SYNTHÈSE ---
class SummarySheet(BaseModel):
    title: str = Field(description="Titre de la fiche.")
    key_definitions: List[dict] = Field(description="Liste {term, definition}. Définitions mot pour mot.")
    core_concepts: str = Field(description="Les points essentiels du cours en Markdown structuré.")
    exam_tips: List[str] = Field(description="Pièges à éviter et conseils méthode.")


# --- MODÈLES ÉTAPES (Mastery Path) ---
class StepTheory(BaseModel): title: str; content_markdown: str


class StepVocabulary(BaseModel): title: str; flashcards: List[FlashcardItem]


class StepDeepQuiz(BaseModel): title: str; questions: List[QuizItem]


class StepStructure(BaseModel): title: str; items: List[dict]  # Simplifié pour éviter import circulaire


class StepMethodology(BaseModel): title: str; tips_markdown: str


class StepPractice(BaseModel): title: str; exercise: OpenQuestion

class DiagnosticQuestion(BaseModel):
    id: int;
    concept: str
    question: str;
    expected_answer_points: List[str];

class ConceptAnalysis(BaseModel):
    id: int;
    concept: str ;
    understanding_score: int;
    correct_points: List[str];
    missing_points: List[str];
    misconceptions: List[str];
    feedback: str;

class DiagnosticQuestionSet(BaseModel):
    questions: List[DiagnosticQuestion];

class ProgressiveExerciseSet(BaseModel):
    exercice_facile : OpenQuestion;
    exercice_moyen : OpenQuestion;
    exercice_difficile : OpenQuestion;

class ExamSimulation(BaseModel):
    title: str
    subject_context: str
    main_problem: str
    hints: List[str]
    correction_criteria: List[str]
    success_threshold: int


class AdaptiveMasteryPath(BaseModel):
    title: str

    # ÉTAPE 1 : Toujours disponible au début
    step_1_theory: StepTheory  # Le cours (pour réviser avant)
    step_2_diagnostic: DiagnosticQuestionSet  # Les 5 questions pour tester

    # ÉTAPES SUIVANTES : Vides au début (Placeholder)
    # On met Optional car on ne les a pas encore !
    step_3_remediation: Optional[ProgressiveExerciseSet] = None
    step_4_exam: Optional[ExamSimulation] = None


# --- BLUEPRINTS (Mastery Path) ---
class MathPath(
    BaseModel): step_1_theorems: StepTheory; step_2_formulas: StepVocabulary; step_3_logic_quiz: StepDeepQuiz; step_4_problem: StepPractice


class HistoryPath(
    BaseModel): step_1_context: StepTheory; step_2_chronology: StepVocabulary; step_3_check: StepDeepQuiz; step_4_synthesis: StepPractice


class PhilosophyPath(
    BaseModel): step_1_authors: StepTheory; step_2_concepts: StepVocabulary; step_3_method: StepMethodology; step_4_essay: StepPractice


class LanguagePath(
    BaseModel): step_1_grammar: StepTheory; step_2_idioms: StepVocabulary; step_3_quiz: StepDeepQuiz; step_4_writing: StepPractice


class GeneralPath(
    BaseModel): step_1_learn: StepTheory; step_2_memorize: StepVocabulary; step_3_check: StepDeepQuiz; step_4_apply: StepPractice


# --- FONCTIONS ---

def generate_summary_sheet(course_text: str, subject: str) -> dict:
    """Génère une fiche de révision dense (Version Robuste)."""
    print(f"📝 Génération Fiche 20/20 pour : {subject}")

    # On limite à 15k caractères pour être sûr que ça passe avec gpt-4o-mini
    safe_text = course_text[:15000]

    prompt = f"""Tu es un professeur agrégé de {subject}.
    Rédige une fiche de révision d'excellence pour ce cours.

    FORMAT JSON STRICT :
    {{
      "title": "Titre du chapitre",
      "key_definitions": [
        {{"term": "Mot clé 1", "definition": "Définition précise"}},
        {{"term": "Mot clé 2", "definition": "Définition précise"}}
      ],
      "core_concepts": "Résumé structuré en Markdown (utilises des # titres et - listes).",
      "exam_tips": ["Conseil 1", "Piège à éviter"]
    }}
    """

    try:
        # Essai avec Pydantic
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": safe_text}],
            response_format=SummarySheet,
        )
        return completion.choices[0].message.parsed.model_dump()

    except Exception as e:
        print(f"❌ Erreur Fiche Pydantic: {e}")

        # Fallback manuel (si Pydantic échoue)
        try:
            res = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt + " Réponds uniquement en JSON valide."},
                    {"role": "user", "content": safe_text}
                ],
                response_format={"type": "json_object"}
            )
            data = json.loads(res.choices[0].message.content)
            # On s'assure que les champs existent
            return {
                "title": data.get("title", "Fiche de Révision"),
                "key_definitions": data.get("key_definitions", []),
                "core_concepts": data.get("core_concepts", "Résumé non généré."),
                "exam_tips": data.get("exam_tips", [])
            }
        except:
            return {
                "title": "Erreur de Génération",
                "key_definitions": [],
                "core_concepts": "L'IA n'a pas pu traiter ce cours. Il est peut-être trop long ou illisible.",
                "exam_tips": []
            }

def generate_mastery_path(course_text: str, subject: str = "Général") -> dict:
    print(f"🧬 Génération Parcours 20/20 pour : {subject}")
    safe_text = course_text[:25000]
    prompt_maths = '''MATH_PROMPT = """
Tu es un professeur agrégé de mathématiques, expert du programme de lycée.

🎯 OBJECTIF :
Créer un parcours d'apprentissage qui permet à l'élève de VRAIMENT maîtriser 
le chapitre, pas juste le survoler. Il doit pouvoir avoir 20/20 à un DS.

👤 PUBLIC :
Lycéen (Seconde à Terminale). Il a le cours mais ne le comprend pas forcément.

📚 POUR L'ÉTAPE THÉORIE (step_1_theorems) :
- Réexplique chaque notion avec des MOTS SIMPLES d'abord
- Puis donne la définition rigoureuse exacte (celle à écrire en DS)
- Ajoute un exemple CONCRET pour chaque notion
- Explique le POURQUOI (à quoi ça sert, d'où ça vient)
- Mentionne les erreurs classiques à éviter

📝 POUR LES FORMULES (step_2_formulas) :
- Chaque flashcard = UNE formule ou propriété
- Face avant : la situation / quand l'utiliser
- Face arrière : la formule EXACTE avec notation rigoureuse
- Inclure les conditions d'utilisation (ex: "pour tout x > 0")

🧠 POUR LE QUIZ (step_3_logic_quiz) :
- Questions qui testent la COMPRÉHENSION, pas la mémoire
- Inclure des questions "piège" classiques du Bac
- Chaque mauvaise réponse = une erreur typique d'élève
- Explication détaillée pour chaque réponse

💪 POUR L'EXERCICE (step_4_problem) :
- Exercice de niveau DS/Bac
- Doit mobiliser PLUSIEURS notions du chapitre
- L'instruction doit être rédigée comme au Bac
- Les points attendus doivent inclure les étapes de rédaction

⚠️ ÉVITE :
- Le contenu trop simple (niveau collège)
- Les formules sans contexte
- Les exercices à une seule étape
"""'''

    prompt_histoire = '''HISTORY_PROMPT = """
Tu es un professeur agrégé d'histoire-géographie, expert du programme de lycée.

🎯 OBJECTIF :
Créer un parcours qui permet à l'élève de MAÎTRISER le chapitre pour le Bac.
Il doit pouvoir faire une composition ou une étude de documents sans stress.

👤 PUBLIC :
Lycéen préparant le Bac. Il a le cours mais n'arrive pas à le structurer.

📚 POUR L'ÉTAPE CONTEXTE (step_1_context) :
- Situe le chapitre dans son époque et son espace
- Explique les ENJEUX : pourquoi c'est important ?
- Donne les grandes problématiques du chapitre
- Fais les liens avec l'actualité si pertinent
- Structure avec des parties claires (I, II, III)

📅 POUR LA CHRONOLOGIE (step_2_chronology) :
- Chaque flashcard = UN événement ou UNE date clé
- Face avant : la date
- Face arrière : l'événement + sa SIGNIFICATION (pourquoi c'est important)
- Inclure aussi les acteurs clés (qui a fait quoi)

🧠 POUR LE QUIZ (step_3_check) :
- Mélanger dates, acteurs, causes, conséquences
- Questions de MISE EN RELATION (cause → effet)
- Questions "piège" sur les confusions classiques
- Explication qui replace dans le contexte

💪 POUR LA SYNTHÈSE (step_4_synthesis) :
- Sujet type Bac (composition ou étude de doc)
- L'instruction doit être formulée comme au Bac
- Les points attendus = plan détaillé + exemples précis à citer
- Inclure les attentes méthodologiques (intro, transitions, conclusion)

⚠️ ÉVITE :
- Les listes de dates sans explication
- Le par cœur sans compréhension
- Les généralités sans exemples précis
"""'''

    prompt_francais = '''PHILOSOPHY_PROMPT = """
Tu es un professeur agrégé de philosophie/lettres, expert du programme de lycée.

🎯 OBJECTIF :
Créer un parcours qui permet à l'élève de PENSER par lui-même et de 
RÉDIGER une dissertation ou un commentaire de niveau Bac (14/20 minimum).

👤 PUBLIC :
Lycéen préparant le Bac. Il récite des idées sans les comprendre.

📚 POUR L'ÉTAPE AUTEURS (step_1_authors) :
- Présente chaque auteur avec sa THÈSE CENTRALE
- Explique avec des mots simples PUIS avec le vocabulaire technique
- Donne une CITATION clé par auteur (à pouvoir réutiliser)
- Explique POURQUOI cette pensée est importante/révolutionnaire
- Fais les liens entre auteurs (qui répond à qui, qui s'oppose)

📝 POUR LES CONCEPTS (step_2_concepts) :
- Chaque flashcard = UN concept philosophique
- Face avant : le concept + "selon [auteur]"
- Face arrière : définition PRÉCISE + exemple concret
- Inclure les distinctions importantes (ex: liberté/libre-arbitre)

🧠 POUR LA MÉTHODE (step_3_method) :
- Rappel de la structure dissertation (intro, 3 parties, conclusion)
- Comment problématiser un sujet
- Comment utiliser les auteurs sans réciter
- Comment faire des transitions
- Les erreurs qui font perdre des points

💪 POUR LA DISSERTATION (step_4_essay) :
- Sujet type Bac
- L'instruction = le sujet exact
- Les points attendus = plan possible + auteurs à mobiliser + distinctions à faire
- Préciser les pièges du sujet

⚠️ ÉVITE :
- Les résumés de cours sans problématisation
- Les citations sans explication
- Les plans tout faits sans réflexion
"""'''

    prompt_langue = '''LANGUAGE_PROMPT = """
Tu es un professeur agrégé de langues, expert du programme de lycée.

🎯 OBJECTIF :
Créer un parcours qui améliore VRAIMENT le niveau de l'élève en compréhension
et expression. Il doit pouvoir écrire un essai fluide et sans fautes de base.

👤 PUBLIC :
Lycéen préparant le Bac. Il fait toujours les mêmes erreurs de grammaire.

📚 POUR LA GRAMMAIRE (step_1_grammar) :
- Explique chaque point de grammaire avec la RÈGLE CLAIRE
- Donne des exemples avec traduction
- Montre l'ERREUR TYPIQUE française et la correction
- Astuce mnémotechnique si possible
- Cas particuliers à connaître

📝 POUR LE VOCABULAIRE (step_2_idioms) :
- Chaque flashcard = UNE expression idiomatique ou mot de liaison
- Face avant : le mot/expression en français
- Face arrière : traduction + EXEMPLE dans une phrase + niveau de langue
- Privilégier le vocabulaire utile pour les essais Bac

🧠 POUR LE QUIZ (step_3_quiz) :
- Questions sur les erreurs de grammaire classiques
- QCM de vocabulaire en contexte
- Phrases à corriger
- Explication de POURQUOI c'est faux

💪 POUR L'EXPRESSION ÉCRITE (step_4_writing) :
- Sujet type Bac (essai, article, lettre)
- L'instruction en langue cible
- Les points attendus = structure + expressions à utiliser + erreurs à éviter
- Grille d'évaluation simplifiée

⚠️ ÉVITE :
- Les listes de vocabulaire hors contexte
- La grammaire sans exemples
- Les exercices trop simples
"""'''

    prompt_générale = '''GENERAL_PROMPT = """
Tu es un pédagogue expert, spécialiste de l'apprentissage efficace.

🎯 OBJECTIF :
Créer un parcours qui permet à l'élève de MAÎTRISER le sujet en profondeur.
Pas de survol superficiel, il doit pouvoir réussir un contrôle.

👤 PUBLIC :
Lycéen. Il a le cours mais n'arrive pas à l'assimiler efficacement.

📚 POUR L'ÉTAPE APPRENDRE (step_1_learn) :
- Structure le cours de manière LOGIQUE (du simple au complexe)
- Explique chaque notion avec des mots simples d'abord
- Ajoute des exemples concrets pour chaque concept
- Fais des liens entre les notions
- Résume les points ESSENTIELS à retenir absolument

📝 POUR LA MÉMORISATION (step_2_memorize) :
- Chaque flashcard = UNE notion clé
- Face avant : question ou situation
- Face arrière : réponse précise et complète
- Privilégier la COMPRÉHENSION sur le par cœur

🧠 POUR LA VÉRIFICATION (step_3_check) :
- Questions variées (définitions, applications, analyse)
- Tester la compréhension, pas juste la mémoire
- Inclure des questions qui demandent de RÉFLÉCHIR
- Explications détaillées

💪 POUR L'APPLICATION (step_4_apply) :
- Exercice qui mobilise PLUSIEURS notions
- Niveau attendu en contrôle
- L'instruction doit être claire et complète
- Les points attendus = étapes de résolution

⚠️ ÉVITE :
- Le contenu trop superficiel
- Les exercices trop simples
- Le par cœur sans compréhension
"""'''

    if subject in ["Mathématiques", "NSI"]:
        schema = MathPath; prompt = prompt_maths
    elif subject in ["Histoire-Géo", "HGGSP"]:
        schema = HistoryPath; prompt = prompt_histoire
    elif subject in ["Philosophie", "Français"]:
        schema = PhilosophyPath; prompt = prompt_francais
    elif subject in ["Anglais", "Espagnol"]:
        schema = LanguagePath; prompt = prompt_langue
    else:
        schema = GeneralPath; prompt = prompt_générale

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": prompt}, {"role": "user", "content": f"COURS :\n{safe_text}"}],
            response_format=schema,
        )
        raw_data = completion.choices[0].message.parsed.model_dump()

        steps = []
        for key, value in raw_data.items():
            step_type = "unknown"
            if "content_markdown" in value:
                step_type = "learn"
            elif "flashcards" in value:
                step_type = "flashcards"
                if not value["flashcards"]: value["flashcards"] = [{"front": "Vide", "back": "..."}]
            elif "questions" in value:
                step_type = "quiz"
            elif "exercise" in value:
                step_type = "practice"
            elif "tips_markdown" in value:
                step_type = "method"

            steps.append({"type": step_type, "title": value.get("title", "Étape"), "data": value})
        return {"steps": steps}
    except Exception as e:
        print(f"❌ Erreur IA: {e}")
        return {"steps": []}


def generate_diagnostic_questions(course_text : str, subject : str) -> dict:
    safe_text = course_text[:15000]

    prompt = f"""
    Tu es un professeur expert en pédagogie de {subject}.

    🎯 OBJECTIF : 
    Créer un diagnostic pour évaluer si l'élève a une compréhension PROFONDE du cours.

    🚫 À ÉVITER ABSOLUMENT :
    - Les questions "Oui/Non"
    - La récitation simple de dates ou de définitions par cœur
    - Les questions superficielles

    ✅ TYPES DE QUESTIONS ATTENDUES :
    1. COMPARAISON : Demande de lier ou d'opposer deux concepts (ex: "Terre vs Vénus")
    2. CAUSALITÉ : "Pourquoi..." ou "Comment..."
    3. SYNTHÈSE : Demande d'expliquer un mécanisme global

    POUR CHAQUE QUESTION :
    - Identifie clairement le concept testé.
    - Liste les points clés (mots ou idées) attendus dans la réponse de l'élève.
    """
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": prompt}, {"role": "user", "content": f"COURS :\n{safe_text}"}],
        response_format=DiagnosticQuestionSet,
    )

    return (completion.choices[0].message.parsed.model_dump())


def analyze_student_answer(student_answer: str, question: str, expected_points: List[str]) -> dict:
    # SYSTEM : Le rôle et les règles
    system_prompt = """
    Tu es un professeur agrégé expert. Tu es bienveillant mais JUSTE.
    Ta mission est d'analyser la réponse de l'élève pour l'aider à progresser.

    CRITÈRES D'ANALYSE :
    1. Vérifie si le SENS des points attendus est présent.
    2. Identifie connaissances acquises, lacunes et fausses croyances.
    3. Donne un score de compréhension (0-100).
    """

    user_content = f"""
    CONTEXTE :
    - Question : "{question}"
    - Points attendus : {", ".join(expected_points)}

    RÉPONSE ÉLÈVE :
    "{student_answer}"

    Analyse cette réponse maintenant.
    """

    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        response_format=ConceptAnalysis,
    )

    return completion.choices[0].message.parsed.model_dump()

def generate_progressive_practice(course_text: str, weak_concepts: List[str]) -> dict:
    safe_text = course_text[:20000]  # Un peu plus large pour les exos
    concepts_str = ", ".join(weak_concepts)
    prompt = f"""
    Tu es un coach pédagogique expert, spécialisé dans la remédiation scolaire.
    Ton élève a des lacunes identifiées sur : {concepts_str}.

    🎯 OBJECTIF :
    Créer une progression de 3 exercices pour l'amener de la difficulté à la maîtrise.
    Basé strictement sur le cours fourni.

    📈 LA PROGRESSION ATTENDUE :

    1. EXERCICE FACILE (Mise en confiance) :
       - Application directe et mécanique du cours.
       - Aucune piège.
       - But : Vérifier qu'il connaît la définition/formule de base.

    2. EXERCICE MOYEN (Connexion) :
       - Demande de réfléchir et de choisir le bon outil.
       - Peut combiner deux notions simples.
       - But : Vérifier qu'il comprend QUAND utiliser la notion.

    3. EXERCICE DIFFICILE (Maîtrise / Type Examen) :
       - Situation complexe ou inédite.
       - Nécessite plusieurs étapes de raisonnement.
       - Contient des subtilités ou pièges classiques.
       - But : Vérifier s'il est prêt pour l'évaluation finale.

    Pour chaque exercice, fournis l'instruction claire et les points clés attendus pour la correction en te basant seulement sur le cours de reférence : {safe_text}
    """
    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format=ProgressiveExerciseSet,
        )
        return completion.choices[0].message.parsed.model_dump()

    except Exception as e:
        print(f"❌ Erreur Pratique: {e}")
        return {}


def generate_exam_simulation(course_text: str) -> dict:
    safe_text = course_text[:20000]

    prompt = f"""
        Tu es un examinateur officiel.
        Ton objectif : Créer un sujet d'examen FINAL pour valider ce chapitre.

        CONTRAINTES :
        1. Le sujet doit être de niveau EXAMEN (Bac/Contrôle final).
        2. Il doit mélanger les concepts (ne pas être linéaire).
        3. Il doit demander de la rédaction et de la rigueur.

        Génère :
        - Un énoncé clair.
        - 3 indices progressifs (du plus vague au plus précis) pour débloquer l'élève sans donner la réponse.
        - Une liste de CRITÈRES PRÉCIS pour l'évaluation (ce qu'il faut absolument avoir écrit pour avoir les points).
        - Le nombre de critères nécessaires pour avoir la moyenne (threshold).

        Basé sur ce cours :
        {safe_text}
        """

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format=ExamSimulation,
        )
        return completion.choices[0].message.parsed.model_dump()

    except Exception as e:
        print(f"❌ Erreur Examen: {e}")
        return {}



# --- FONCTIONS SECONDAIRES (Compatibilité) ---
class StepContentLearn(BaseModel): markdown: str


class StepContentFlashcards(BaseModel): cards: List[dict]


class StepContentQuiz(BaseModel): questions: List[dict]


class StepContentPractice(BaseModel): instruction: str; context: str


def generate_step_content(step_type: str, course_text: str, subject: str) -> dict:
    safe_text = course_text[:20000]
    if step_type == 'learn':
        prompt = f"Cours Markdown {subject}"; schema = StepContentLearn
    elif step_type == 'flashcards':
        prompt = f"Flashcards {subject}"; schema = StepContentFlashcards
    elif step_type == 'quiz':
        prompt = f"Quiz {subject}"; schema = StepContentQuiz
    elif step_type == 'practice':
        prompt = f"Exercice {subject}"; schema = StepContentPractice
    else:
        return {}

    try:
        res = client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "system", "content": prompt},
                                                                                {"role": "user", "content": safe_text}],
                                                 response_format=schema)
        return res.choices[0].message.parsed.model_dump()
    except:
        return {}


# Autres stubs nécessaires
class QuizQuestionAdaptive(BaseModel): question: str; options: List[
    str]; correct_index: int; explanation: str; concept: str


class DiagnosticResult(BaseModel): questions: List[QuizQuestionAdaptive]


class RemediationContent(BaseModel): summary: str; flashcards: List[dict]


class PracticeExercise(BaseModel): instruction: str; difficulty: Literal['easy', 'hard']


class EvaluationResult(BaseModel): is_correct: bool; score: int; feedback: str; correction: str


class MicroTask(BaseModel): id: int; task: str; xp_reward: int


class DailyPlan(BaseModel): daily_message: str; quote: str; micro_tasks: List[MicroTask]


def generate_diagnostic_quiz(t): return \
client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Diag:\n{t[:15000]}"}],
                                   response_format=DiagnosticResult).choices[0].message.parsed.model_dump()


def generate_remediation_content(t, w, d):
    class R(BaseModel):
        text: str; flashcards: List[dict]

    try:
        return {"summary": client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[
            {"role": "user", "content": f"Remediation {w}"}], response_format=R).choices[0].message.parsed.text,
                "flashcards": []}
    except:
        return {"summary": "Err", "flashcards": []}


def generate_validation_quiz(t, c, d): return generate_diagnostic_quiz(t)


def generate_practice_exercise(t, d):
    prompt = f"""
    Voici le cours :
    {t}

    génere un exercice contenant dans l instruction la question du niveau : {d}
    """

    response = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt},
                  {"role": "system", "content": "tu es un proffesseur expert"}

                  ],
        response_format=PracticeExercise
    )

    return response.choices[0].message.parsed.model_dump()


def evaluate_student_answer(i, s, c): return \
client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Eval:{s}"}],
                                   response_format=EvaluationResult).choices[0].message.parsed.model_dump()


def generate_daily_plan(g, d, c): return \
client.beta.chat.completions.parse(model="gpt-4o-mini", messages=[{"role": "user", "content": f"Plan {g}"}],
                                   response_format=DailyPlan).choices[0].message.parsed.model_dump()


def chat_with_tutor(h, c, m):
    msgs = [{"role": "system", "content": "Tuteur."}] + h[-4:] + [{"role": "user", "content": m}]
    return client.chat.completions.create(model="gpt-4o-mini", messages=msgs).choices[0].message.content


def start_adaptive_learning(course_text: str, subject: str) -> dict:
    print(f"🚀 Démarrage Parcours Adaptatif : {subject}")
    safe_text = course_text[:20000]

    prompt_theory = ""

    if subject in ["Mathématiques", "NSI"]:
        prompt_theory = """
        Tu es un professeur agrégé de mathématiques.
        Rédige UNIQUEMENT la partie COURS (Théorie) pour cet élève.

        CRITÈRES D'EXCELLENCE :
        - Réexplique chaque notion avec des MOTS SIMPLES d'abord
        - Puis donne la définition rigoureuse exacte
        - Ajoute un exemple CONCRET pour chaque notion
        - Explique le POURQUOI (à quoi ça sert)
        """
    elif subject in ["Histoire-Géo", "HGGSP"]:
        prompt_theory = """
        Tu es un professeur d'Histoire-Géo.
        Rédige UNIQUEMENT la partie CONTEXTE et COURS.

        CRITÈRES D'EXCELLENCE :
        - Situe le chapitre dans son époque et son espace
        - Explique les ENJEUX et problématiques
        - Structure avec des parties claires
        """
    else:
        prompt_theory = """
        Tu es un professeur expert.
        Rédige une leçon structurée et approfondie sur ce texte.
        Explique les concepts clés, donne des exemples et structure le tout logiquement.
        """

    theory_completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt_theory},
            {"role": "user", "content": safe_text}
        ],
        response_format=StepTheory
    )

    diagnostic_data = generate_diagnostic_questions(safe_text, subject)

    # 4. Assemblage
    return {
        "title": f"Parcours : {subject}",
        "steps": [
            {
                "id": 1,
                "type": "theory",
                "status": "unlocked",
                "content": theory_completion.choices[0].message.parsed.model_dump()
            },
            {
                "id": 2,
                "type": "diagnostic",
                "status": "unlocked",
                "content": diagnostic_data
            },
            {
                "id": 3,
                "type": "remediation",
                "status": "locked",
                "content": None
            },
            {
                "id": 4,
                "type": "exam",
                "status": "locked",
                "content": None
            }
        ]
    }