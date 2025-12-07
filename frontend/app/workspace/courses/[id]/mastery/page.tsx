'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, ArrowLeft, Trophy, RefreshCcw } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import QuizDisplay from '@/components/workspace/QuizDisplay';
import FlashcardViewer from '@/components/workspace/FlashcardViewer';
import PracticeInterface from '@/components/workspace/PracticeInterface';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

// Les étapes du parcours
type Step = 'loading' | 'diagnostic' | 'analysis' | 'remediation_learn' | 'remediation_flashcards' | 'remediation_quiz' | 'final_quiz' | 'practice_easy' | 'practice_hard' | 'success';

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [step, setStep] = useState<Step>('loading');
  const [courseText, setCourseText] = useState('');

  // Data State
  const [diagnosticQuiz, setDiagnosticQuiz] = useState<any>(null);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);
  const [remediationData, setRemediationData] = useState<any>(null);
  const [validationQuiz, setValidationQuiz] = useState<any>(null);
  const [finalQuiz, setFinalQuiz] = useState<any>(null);
  const [currentExercise, setCurrentExercise] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user && params.id) {
        const init = async () => {
            const course = await getCourseById(Number(params.id), user.id);
            setCourseText(course.extracted_text);

            // 1. Générer le Diagnostic
            const res = await fetch(`${API_URL}/api/path/diagnostic`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ course_text: course.extracted_text })
            });
            const data = await res.json();
            setDiagnosticQuiz(data); // data.questions
            setStep('diagnostic');
        };
        init();
    }
  }, [user, params.id]);

  // --- LOGIQUE DE TRANSITION ---

  const handleDiagnosticComplete = (answers: number[]) => {
      // Analyse des réponses
      const mistakes: string[] = [];
      diagnosticQuiz.questions.forEach((q: any, i: number) => {
          // On utilise correct_index car c'est le format backend
          const correct = q.correct_index ?? q.correctAnswer;
          if (answers[i] !== correct) {
              if (q.concept) mistakes.push(q.concept);
          }
      });

      // On dédoublonne
      const uniqueMistakes = Array.from(new Set(mistakes));
      setWeakConcepts(uniqueMistakes);

      if (uniqueMistakes.length === 0) {
          // 100% réussite -> On saute la remédiation
          launchFinalQuiz();
      } else {
          // On lance la remédiation sur les points faibles
          launchRemediation(uniqueMistakes);
      }
  };

  const launchRemediation = async (concepts: string[]) => {
      setStep('analysis'); // Loader avec message "Analyse de vos lacunes..."

      // Appel API pour le contenu de cours + flashcards
      const res = await fetch(`${API_URL}/api/path/remediation`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_text: courseText, weak_concepts: concepts, difficulty: 1 })
      });
      const data = await res.json();
      setRemediationData(data);
      setStep('remediation_learn');
  };

  const handleRemediationQuizComplete = (answers: number[]) => {
      // Pour simplifier, on considère qu'après la remédiation, on passe à la suite
      // Dans une version V2, on pourrait boucler si encore des fautes
      launchFinalQuiz();
  };

  const launchFinalQuiz = async () => {
      setStep('analysis'); // Loader
      const res = await fetch(`${API_URL}/api/path/validation`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_text: courseText, concepts: [], difficulty: 3 }) // Difficulté max
      });
      const data = await res.json();
      setFinalQuiz(data); // data.questions
      setStep('final_quiz');
  };

  const handleFinalQuizComplete = () => {
      launchPractice('easy');
  };

  const launchPractice = async (diff: 'easy' | 'hard') => {
      setStep('analysis');
      const res = await fetch(`${API_URL}/api/path/practice`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_text: courseText, difficulty: diff })
      });
      const data = await res.json();
      setCurrentExercise(data);
      setStep(diff === 'easy' ? 'practice_easy' : 'practice_hard');
  };

  const handlePracticeComplete = () => {
      if (step === 'practice_easy') {
          if (confirm("Bravo ! Prêt pour le niveau Boss (Difficile) ?")) {
              launchPractice('hard');
          } else {
              finishPath();
          }
      } else {
          finishPath();
      }
  };

  const finishPath = () => {
      if (user) addXp(user.id, 500, "Mastery Path Completed");
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setStep('success');
  };

  // --- RENDU ---

  if (step === 'loading' || step === 'analysis') {
      return (
          <div className="flex h-screen items-center justify-center bg-white flex-col gap-4">
              <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
              <p className="text-slate-500 font-medium animate-pulse">
                  {step === 'loading' ? 'Préparation du diagnostic...' : 'L\'IA analyse vos résultats et adapte le parcours...'}
              </p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

        {/* Header commun */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm flex justify-between items-center">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm">
                <ArrowLeft size={16}/> Quitter
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                {step.replace('_', ' ')}
            </span>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">

            {/* 1. DIAGNOSTIC */}
            {step === 'diagnostic' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Évaluation Initiale</h1>
                        <p className="text-slate-500">Voyons ce que vous savez déjà pour personnaliser la suite.</p>
                    </div>
                    <QuizDisplay quiz={{questions: diagnosticQuiz.questions}} onComplete={handleDiagnosticComplete} />
                </div>
            )}

            {/* 2. REMEDIATION (LEARN) */}
            {step === 'remediation_learn' && remediationData && (
                <div className="animate-in fade-in">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl">
                        <h3 className="font-bold text-red-800 mb-1">Lacunes détectées :</h3>
                        <p className="text-red-700 text-sm">{weakConcepts.join(', ')}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
                        <article className="prose prose-slate max-w-none">
                            <ReactMarkdown>{remediationData.text}</ReactMarkdown>
                        </article>
                    </div>
                    <button onClick={() => setStep('remediation_flashcards')} className="btn-b-primary w-full mt-8 py-4 text-lg">
                        Passer à la mémorisation
                    </button>
                </div>
            )}

            {/* 3. REMEDIATION (FLASHCARDS) */}
            {step === 'remediation_flashcards' && remediationData && (
                <div className="animate-in fade-in">
                    <h2 className="text-center text-2xl font-bold mb-8">Ancrage des connaissances</h2>
                    <FlashcardViewer flashcards={remediationData.flashcards} />
                    <div className="text-center mt-12">
                        <button onClick={async () => {
                            setStep('analysis');
                            // Génération du quiz de validation intermédiaire
                            const res = await fetch(`${API_URL}/api/path/validation`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ course_text: courseText, concepts: weakConcepts, difficulty: 2 })
                            });
                            const data = await res.json();
                            setValidationQuiz(data);
                            setStep('remediation_quiz');
                        }} className="btn-b-primary px-12">Test de vérification</button>
                    </div>
                </div>
            )}

            {/* 4. REMEDIATION (QUIZ VERIF) */}
            {step === 'remediation_quiz' && validationQuiz && (
                <div className="animate-in fade-in">
                    <h2 className="text-center text-2xl font-bold mb-8">Avez-vous bien retenu ?</h2>
                    <QuizDisplay quiz={{questions: validationQuiz.questions}} onComplete={handleRemediationQuizComplete} />
                </div>
            )}

            {/* 5. FINAL QUIZ */}
            {step === 'final_quiz' && finalQuiz && (
                <div className="animate-in fade-in">
                    <h2 className="text-center text-3xl font-black mb-8 text-purple-600">Le Boss Final</h2>
                    <QuizDisplay quiz={{questions: finalQuiz.questions}} onComplete={handleFinalQuizComplete} />
                </div>
            )}

            {/* 6. PRACTICE (EASY & HARD) */}
            {(step === 'practice_easy' || step === 'practice_hard') && currentExercise && (
                <PracticeInterface
                    exercise={currentExercise}
                    courseText={courseText}
                    onComplete={handlePracticeComplete}
                />
            )}

            {/* 7. SUCCESS */}
            {step === 'success' && (
                <div className="text-center py-20 animate-in zoom-in">
                    <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                        <Trophy size={64} className="text-slate-900"/>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 mb-6">MAÎTRISE TOTALE !</h1>
                    <p className="text-xl text-slate-500 mb-12">Vous avez transformé vos lacunes en force.</p>
                    <button onClick={() => router.push('/workspace/courses')} className="btn-b-primary px-12 py-4 text-lg">Retour</button>
                </div>
            )}

        </div>
    </div>
  );
}