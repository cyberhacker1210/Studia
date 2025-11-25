'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
    ArrowRight, BrainCircuit, CheckCircle, XCircle, Loader2,
    BookOpen, HelpCircle, RotateCcw, Sparkles, ArrowLeft, Save, Layers
} from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import { saveFlashcardDeck } from '@/lib/flashcardService';
import ReactMarkdown from 'react-markdown'; // ⚠️ Nécessite npm install react-markdown

export default function ImmersiveMasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [courseText, setCourseText] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseId, setCourseId] = useState<number>(0);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phases: 'learning' -> 'quiz' -> 'result_quiz' -> 'practice' -> 'feedback_practice'
  const [phase, setPhase] = useState<string>('learning');

  // State Flashcards
  const [savedFlashcards, setSavedFlashcards] = useState(false);
  const [isSavingCards, setIsSavingCards] = useState(false);

  // State Quiz
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizScore, setQuizScore] = useState(0);

  // State Practice
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceFeedback, setPracticeFeedback] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user && params.id) initSession();
  }, [user, params.id]);

  const initSession = async () => {
    try {
      const course = await getCourseById(Number(params.id), user!.id);
      setCourseText(course.extracted_text);
      setCourseTitle(course.title);
      setCourseId(course.id);

      const res = await fetch(`${API_URL}/api/path/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_text: course.extracted_text }),
      });

      if(!res.ok) throw new Error("Erreur API");

      const data = await res.json();
      setQuizAnswers(new Array(data.quiz.length).fill(-1));
      setSession(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de générer le parcours. Le cours est peut-être trop court.");
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION : SAUVEGARDER LES FLASHCARDS ---
  const handleSaveFlashcards = async () => {
      if(!user || !session.flashcards) return;
      setIsSavingCards(true);
      try {
          // On formate pour ton service existant
          const formattedCards = session.flashcards.map((c: any) => ({
              front: c.front,
              back: c.back,
              category: 'Parcours'
          }));

          await saveFlashcardDeck(
              user.id,
              formattedCards,
              `Flashcards - ${courseTitle}`,
              'medium',
              courseId
          );
          setSavedFlashcards(true);
          await addXp(user.id, 20, 'Flashcards sauvegardées');
      } catch (e) {
          console.error(e);
          alert("Erreur lors de la sauvegarde");
      } finally {
          setIsSavingCards(false);
      }
  };

  const submitQuiz = () => {
      let score = 0;
      session.quiz.forEach((q: any, idx: number) => {
          if (quizAnswers[idx] === q.correct_index) score++;
      });
      const percentage = Math.round((score / session.quiz.length) * 100);
      setQuizScore(percentage);
      setPhase('result_quiz');
      if (percentage >= 80 && user) addXp(user.id, 50, 'Quiz Validé');
  };

  const submitPractice = async () => {
    if(!practiceAnswer.trim()) return;
    setEvaluating(true);
    try {
        const res = await fetch(`${API_URL}/api/path/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instruction: session.practice_task.instruction,
                student_answer: practiceAnswer,
                course_context: courseText
            }),
        });
        const result = await res.json();
        setPracticeFeedback(result);
        setPhase('feedback_practice');
        if (result.is_correct && user) await addXp(user.id, 100, 'Parcours terminé');
    } catch (err) {
        console.error(err);
    } finally {
        setEvaluating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <BrainCircuit className="text-indigo-600 w-16 h-16 animate-pulse mb-4"/>
        <h2 className="text-2xl font-bold text-gray-900">Préparation de votre séance...</h2>
        <p className="text-gray-500">L'IA structure vos connaissances.</p>
    </div>
  );

  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar simplifiée */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
         <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ArrowLeft/></button>
         <div className="font-bold text-gray-800 uppercase tracking-wider text-sm">
            {phase === 'learning' && "Phase 1 : Apprentissage"}
            {phase.includes('quiz') && "Phase 2 : Vérification"}
            {phase.includes('practice') && "Phase 3 : Application"}
         </div>
         <div className="w-8"></div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">

        {/* === PHASE 1: APPRENTISSAGE (Texte Beau + Flashcards) === */}
        {phase === 'learning' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">

                {/* CONTENU DU COURS (Markdown) */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 prose prose-indigo lg:prose-lg max-w-none">
                    {/* Le plugin typography de Tailwind rendra ça magnifique */}
                    <ReactMarkdown>{session.learning_content}</ReactMarkdown>
                </div>

                {/* FLASHCARDS GÉNÉRÉES */}
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                            <Layers className="text-indigo-600"/>
                            Flashcards Clés ({session.flashcards.length})
                        </h3>
                        <button
                            onClick={handleSaveFlashcards}
                            disabled={savedFlashcards || isSavingCards}
                            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                savedFlashcards 
                                ? 'bg-green-100 text-green-700 cursor-default' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                            }`}
                        >
                            {isSavingCards ? <Loader2 className="animate-spin" size={16}/> : savedFlashcards ? <CheckCircle size={16}/> : <Save size={16}/>}
                            {savedFlashcards ? "Sauvegardé" : "Sauvegarder le deck"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {session.flashcards.map((card: any, idx: number) => (
                            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                                <p className="font-bold text-gray-800 mb-2 text-sm">{card.front}</p>
                                <div className="h-px bg-gray-100 w-full mb-2"></div>
                                <p className="text-gray-600 text-sm">{card.back}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setPhase('quiz')}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl"
                >
                    J'ai tout retenu, je passe au Quiz <ArrowRight />
                </button>
            </div>
        )}

        {/* === PHASE 2: QUIZ === */}
        {phase === 'quiz' && (
            <div className="animate-in zoom-in-95 space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <h2 className="text-xl font-bold text-gray-900">Test de Connaissances</h2>
                    <p className="text-gray-500">Il faut 80% de réussite pour passer à la suite.</p>
                </div>

                {session.quiz.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <p className="font-bold text-lg mb-4 text-gray-800">{qIdx + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {q.options.map((opt: string, oIdx: number) => (
                                <button
                                    key={oIdx}
                                    onClick={() => {
                                        const newAns = [...quizAnswers];
                                        newAns[qIdx] = oIdx;
                                        setQuizAnswers(newAns);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
                                        quizAnswers[qIdx] === oIdx 
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900' 
                                        : 'border-gray-100 hover:border-gray-300 text-gray-600'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={submitQuiz}
                    disabled={quizAnswers.includes(-1)}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    Valider mes réponses
                </button>
            </div>
        )}

        {/* === PHASE 2 BIS: RÉSULTAT QUIZ === */}
        {phase === 'result_quiz' && (
            <div className="text-center animate-in zoom-in-95 flex flex-col items-center justify-center h-[70vh]">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-8 shadow-2xl ${
                    quizScore >= 80 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                    <span className="text-5xl font-black">{quizScore}%</span>
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-4">
                    {quizScore >= 80 ? "C'est validé !" : "Encore un effort..."}
                </h2>
                <p className="text-gray-500 mb-10 text-lg max-w-md">
                    {quizScore >= 80
                        ? "Vous maîtrisez les bases. Passons à l'application pratique."
                        : "Vous devez relire le cours pour bien ancrer les connaissances avant de pratiquer."}
                </p>

                {quizScore >= 80 ? (
                    <button onClick={() => setPhase('practice')} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
                        Exercice Pratique <ArrowRight />
                    </button>
                ) : (
                    <button onClick={() => setPhase('learning')} className="bg-white text-gray-900 border-2 border-gray-200 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-transform flex items-center gap-2">
                        <RotateCcw /> Relire le cours
                    </button>
                )}
            </div>
        )}

        {/* === PHASE 3: PRATIQUE === */}
        {phase === 'practice' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest">
                        Mise en situation
                    </div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900">
                        <BrainCircuit className="text-indigo-600"/> Cas Pratique
                    </h2>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed">{session.practice_task.instruction}</p>

                    <textarea
                        className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none h-64 text-lg text-gray-800 placeholder:text-gray-400"
                        placeholder="Écrivez votre réponse détaillée ici..."
                        value={practiceAnswer}
                        onChange={(e) => setPracticeAnswer(e.target.value)}
                    />

                    <button
                        onClick={submitPractice}
                        disabled={!practiceAnswer.trim() || evaluating}
                        className="w-full mt-6 bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl"
                    >
                        {evaluating ? <Loader2 className="animate-spin"/> : <Sparkles size={20}/>}
                        {evaluating ? "Le professeur corrige..." : "Soumettre ma réponse"}
                    </button>
                </div>
            </div>
        )}

        {/* === FEEDBACK FINAL === */}
        {phase === 'feedback_practice' && practiceFeedback && (
            <div className="animate-in zoom-in-95">
                <div className={`p-8 rounded-3xl mb-8 shadow-xl border-2 ${practiceFeedback.is_correct ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${practiceFeedback.is_correct ? 'text-green-800' : 'text-orange-800'}`}>
                        {practiceFeedback.is_correct ? <CheckCircle size={28}/> : <HelpCircle size={28}/>}
                        {practiceFeedback.is_correct ? "Excellent travail !" : "Des points à revoir"}
                    </h2>
                    <div className="bg-white/60 p-6 rounded-2xl mb-6 text-gray-800 leading-relaxed text-lg">
                        {practiceFeedback.feedback}
                    </div>
                    <div className="font-bold text-sm text-right text-gray-500 uppercase tracking-wide">
                        Note attribuée : {practiceFeedback.score}/100
                    </div>
                </div>

                <button
                    onClick={() => router.push('/workspace')}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    Terminer la session
                </button>
            </div>
        )}

      </div>
    </div>
  );
}