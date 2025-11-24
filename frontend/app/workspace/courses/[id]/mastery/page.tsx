'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, BrainCircuit, CheckCircle, XCircle, Loader2, BookOpen, HelpCircle, RotateCcw, Sparkles, ArrowLeft } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import ReactMarkdown from 'react-markdown'; // Optionnel: installe avec 'npm install react-markdown' sinon affiche le texte brut

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [courseText, setCourseText] = useState('');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- STATE MACHINE ---
  // phases: 'learning' -> 'quiz' -> 'result_quiz' -> 'practice' -> 'feedback_practice'
  const [phase, setPhase] = useState<'learning' | 'quiz' | 'result_quiz' | 'practice' | 'feedback_practice'>('learning');

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]); // Index des réponses
  const [quizScore, setQuizScore] = useState(0);

  // Practice State
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

      const res = await fetch(`${API_URL}/api/path/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_text: course.extracted_text }),
      });
      const data = await res.json();

      // Initialisation des réponses vides pour le quiz
      setQuizAnswers(new Array(data.quiz.length).fill(-1));
      setSession(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE QUIZ ---
  const handleQuizOptionSelect = (questionIndex: number, optionIndex: number) => {
      const newAnswers = [...quizAnswers];
      newAnswers[questionIndex] = optionIndex;
      setQuizAnswers(newAnswers);
  };

  const submitQuiz = () => {
      let score = 0;
      session.quiz.forEach((q: any, idx: number) => {
          if (quizAnswers[idx] === q.correct_index) score++;
      });

      const percentage = (score / session.quiz.length) * 100;
      setQuizScore(percentage);
      setPhase('result_quiz');

      if (percentage >= 80 && user) {
          addXp(user.id, 50, 'Quiz parcours validé');
      }
  };

  // --- LOGIQUE PRATIQUE ---
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

        if (result.is_correct && user) {
            await addXp(user.id, 100, 'Parcours terminé');
        }
    } catch (err) {
        console.error(err);
    } finally {
        setEvaluating(false);
    }
  };

  // --- RENDERING ---

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <BrainCircuit className="text-purple-600 w-16 h-16 animate-pulse mb-4"/>
        <h2 className="text-2xl font-bold text-gray-900">Génération du parcours scientifique...</h2>
        <p className="text-gray-500">Création du résumé, du quiz de vérification et de l'exercice.</p>
    </div>
  );

  if (!session) return <div>Erreur de chargement. <button onClick={() => window.location.reload()}>Réessayer</button></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-20">
         <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft/></button>
         <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-purple-700">
            {phase === 'learning' && "Étape 1 : Apprentissage"}
            {(phase === 'quiz' || phase === 'result_quiz') && "Étape 2 : Vérification"}
            {(phase === 'practice' || phase === 'feedback_practice') && "Étape 3 : Application"}
         </div>
         <div className="w-8"></div>
      </div>

      <div className="flex-1 p-6 max-w-3xl mx-auto w-full">

        {/* PHASE 1: APPRENTISSAGE */}
        {phase === 'learning' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8 prose lg:prose-lg max-w-none">
                    <h2 className="flex items-center gap-3 text-2xl font-black text-gray-900 mb-6">
                        <BookOpen className="text-blue-600" />
                        Le Cours Essentiel
                    </h2>
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {/* Utilise ReactMarkdown si installé, sinon affiche session.learning_content */}
                        {session.learning_content}
                    </div>
                </div>
                <button
                    onClick={() => setPhase('quiz')}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                    J'ai compris, passer au test <ArrowRight />
                </button>
            </div>
        )}

        {/* PHASE 2: QUIZ */}
        {phase === 'quiz' && (
            <div className="animate-in zoom-in-95">
                <h2 className="text-2xl font-bold text-center mb-6">Vérifions vos connaissances</h2>
                <div className="space-y-8">
                    {session.quiz.map((q: any, qIdx: number) => (
                        <div key={qIdx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <p className="font-bold text-lg mb-4">{qIdx + 1}. {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt: string, oIdx: number) => (
                                    <button
                                        key={oIdx}
                                        onClick={() => handleQuizOptionSelect(qIdx, oIdx)}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                            quizAnswers[qIdx] === oIdx 
                                            ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold' 
                                            : 'border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={submitQuiz}
                    disabled={quizAnswers.includes(-1)}
                    className="w-full mt-8 bg-purple-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-all"
                >
                    Valider le Quiz
                </button>
            </div>
        )}

        {/* PHASE 2 BIS: RÉSULTAT QUIZ */}
        {phase === 'result_quiz' && (
            <div className="text-center animate-in zoom-in-95 flex flex-col items-center justify-center h-[60vh]">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                    quizScore >= 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                    {quizScore >= 80 ? <CheckCircle size={64}/> : <XCircle size={64}/>}
                </div>

                <h2 className="text-4xl font-black mb-2">{quizScore}% de réussite</h2>
                <p className="text-gray-500 mb-8 text-lg">
                    {quizScore >= 80
                        ? "Excellent ! Vous maîtrisez les bases."
                        : "C'est insuffisant pour passer à la suite."}
                </p>

                {quizScore >= 80 ? (
                    <button
                        onClick={() => setPhase('practice')}
                        className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        Passer à la Pratique <ArrowRight />
                    </button>
                ) : (
                    <button
                        onClick={() => setPhase('learning')}
                        className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <RotateCcw /> Revoir le cours
                    </button>
                )}
            </div>
        )}

        {/* PHASE 3: PRATIQUE */}
        {phase === 'practice' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                        APPLICATION
                    </div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <BrainCircuit className="text-purple-600"/> Exercice Pratique
                    </h2>
                    <p className="text-lg text-gray-700 mb-6">{session.practice_task.instruction}</p>

                    <textarea
                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all resize-none h-48 text-lg"
                        placeholder="Votre réponse détaillée..."
                        value={practiceAnswer}
                        onChange={(e) => setPracticeAnswer(e.target.value)}
                    />

                    <button
                        onClick={submitPractice}
                        disabled={!practiceAnswer.trim() || evaluating}
                        className="w-full mt-6 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {evaluating ? <Loader2 className="animate-spin"/> : <Sparkles size={20}/>}
                        {evaluating ? "Analyse en cours..." : "Soumettre au Professeur"}
                    </button>
                </div>
            </div>
        )}

        {/* PHASE 3 BIS: FEEDBACK FINAL */}
        {phase === 'feedback_practice' && practiceFeedback && (
            <div className="animate-in zoom-in-95">
                <div className={`p-8 rounded-3xl mb-8 shadow-lg border-2 ${practiceFeedback.is_correct ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                    <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${practiceFeedback.is_correct ? 'text-green-800' : 'text-orange-800'}`}>
                        {practiceFeedback.is_correct ? <CheckCircle/> : <HelpCircle/>}
                        {practiceFeedback.is_correct ? "Validé !" : "À améliorer"}
                    </h2>
                    <div className="bg-white/50 p-4 rounded-xl mb-4 text-gray-800 leading-relaxed">
                        {practiceFeedback.feedback}
                    </div>
                    <div className="font-bold text-sm text-right">
                        Score: {practiceFeedback.score}/100 (+{practiceFeedback.is_correct ? session.practice_task.xp : 10} XP)
                    </div>
                </div>

                <button
                    onClick={() => router.push('/workspace')}
                    className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all"
                >
                    Terminer la session
                </button>
            </div>
        )}

      </div>
    </div>
  );
}