'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, BrainCircuit, CheckCircle, XCircle, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';

export default function ImmersiveMasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [courseText, setCourseText] = useState('');
  const [session, setSession] = useState<any>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      setSession(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if(!userAnswer.trim()) return;
    setEvaluating(true);

    const currentStep = session.steps[currentStepIndex];

    try {
        const res = await fetch(`${API_URL}/api/path/evaluate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instruction: currentStep.instruction,
                student_answer: userAnswer,
                course_context: courseText
            }),
        });
        const result = await res.json();
        setFeedback(result);

        if (result.is_correct && user) {
            await addXp(user.id, currentStep.xp, 'Étape parcours validée');
        }
    } catch (err) {
        console.error(err);
    } finally {
        setEvaluating(false);
    }
  };

  const handleNext = () => {
      setFeedback(null);
      setUserAnswer('');
      if (currentStepIndex < session.steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
      } else {
          router.push('/workspace'); // Ou écran de fin de session
      }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <BrainCircuit className="animate-pulse text-purple-500 w-20 h-20 mb-6"/>
        <h2 className="text-2xl font-bold">Initialisation du protocole d'apprentissage...</h2>
        <p className="text-gray-400 mt-2">Analyse du contenu et génération des exercices.</p>
    </div>
  );

  const currentStep = session?.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / session?.steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
         <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900">
            <ArrowLeft />
         </button>
         <span className="font-bold text-gray-900">Mode Parcours</span>
         <div className="w-6"></div>
      </div>

      {/* PROGRESS BAR */}
      <div className="h-1.5 bg-gray-200 w-full">
          <div className="h-full bg-purple-600 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">

        {/* HEADER STEP */}
        <div className="mb-8 text-center">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                Étape {currentStepIndex + 1} / {session.steps.length}
            </span>
            <h1 className="text-3xl font-black text-gray-900 mt-4">
                {currentStep.type === 'feynman' && "Technique Feynman"}
                {currentStep.type === 'quiz_open' && "Rappel Actif"}
                {currentStep.type === 'synthesis' && "Synthèse"}
            </h1>
        </div>

        {/* CARD INTERACTIVE */}
        <div className="bg-white w-full rounded-3xl shadow-2xl border border-gray-100 overflow-hidden p-8 relative">

            <div className="mb-8">
                <p className="text-lg text-gray-700 font-medium leading-relaxed">
                    {currentStep.instruction}
                </p>
                {currentStep.concept && (
                    <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 font-bold rounded-r-lg">
                        Concept cible : {currentStep.concept}
                    </div>
                )}
            </div>

            {!feedback ? (
                <div className="space-y-4 animate-in fade-in">
                    <textarea
                        className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-purple-500 outline-none transition-all resize-none h-40 text-lg text-gray-800"
                        placeholder="Tapez votre réponse ici..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                    />
                    <button
                        onClick={handleValidate}
                        disabled={!userAnswer || evaluating}
                        className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {evaluating ? <Loader2 className="animate-spin"/> : <Sparkles size={20}/>}
                        {evaluating ? "L'IA corrige..." : "Vérifier ma réponse"}
                    </button>
                </div>
            ) : (
                <div className="animate-in zoom-in-95">
                    <div className={`p-6 rounded-2xl mb-6 ${feedback.is_correct ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {feedback.is_correct ? <CheckCircle className="text-green-600"/> : <XCircle className="text-orange-600"/>}
                            <h3 className={`font-bold text-lg ${feedback.is_correct ? 'text-green-800' : 'text-orange-800'}`}>
                                {feedback.is_correct ? "Excellent !" : "Pas tout à fait..."}
                            </h3>
                            <span className="ml-auto font-bold text-sm bg-white px-3 py-1 rounded-full shadow-sm">
                                Score: {feedback.score}/100
                            </span>
                        </div>
                        <p className="text-gray-700">{feedback.feedback}</p>
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                        Continuer <ArrowRight size={20}/>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}