'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2, ArrowLeft, CheckCircle, BookOpen, Layers, Brain, Trophy, Target, Zap } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import { useEnergy } from '@/hooks/useEnergy'; // ✅ IMPORT
import QuizDisplay from '@/components/workspace/QuizDisplay';
import FlashcardViewer from '@/components/workspace/FlashcardViewer';
import PracticeInterface from '@/components/workspace/PracticeInterface';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';

type Step = 'loading' | 'start' | 'diagnostic' | 'analysis' | 'remediation_learn' | 'remediation_flashcards' | 'remediation_quiz' | 'final_quiz' | 'practice_easy' | 'practice_hard' | 'success' | 'error';

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { consumeEnergy, isPremium } = useEnergy(); // ✅ HOOK

  const [step, setStep] = useState<Step>('loading');
  const [courseText, setCourseText] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSubject, setCourseSubject] = useState('');

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
        loadCourse();
    }
  }, [user, params.id]);

  const loadCourse = async () => {
      try {
        const course = await getCourseById(Number(params.id), user!.id);
        setCourseText(course.extracted_text);
        setCourseTitle(course.title);
        setCourseSubject(course.subject || 'Général');
        setStep('start');
      } catch (e) {
          console.error("Erreur chargement cours", e);
          setStep('error');
      }
  };

  // --- ACTIONS ---

  const startDiagnostic = async () => {
      // ✅ VÉRIFICATION ET CONSOMMATION D'ÉNERGIE (Coût : 3)
      const canProceed = await consumeEnergy(3);
      if (!canProceed) {
          if(confirm("⚡️ Pas assez d'énergie ! Ce mode expert coûte 3 éclairs.\n\nVoir les offres Premium ?")) {
              router.push('/workspace/pricing');
          }
          return;
      }

      setStep('loading');
      try {
        const res = await fetch(`${API_URL}/api/path/diagnostic`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_text: courseText })
        });
        if (!res.ok) throw new Error("Erreur API");
        const data = await res.json();
        setDiagnosticQuiz({ questions: data.questions });
        setStep('diagnostic');
      } catch (e) {
          console.error(e);
          alert("Erreur lors de la génération du diagnostic.");
          setStep('start');
      }
  };

  const handleDiagnosticComplete = (answers: number[]) => {
      if (!diagnosticQuiz) return;

      const mistakes: string[] = [];
      diagnosticQuiz.questions.forEach((q: any, i: number) => {
          const correct = q.correct_index ?? q.correctAnswer;
          if (answers[i] !== correct) {
              if (q.concept) mistakes.push(q.concept);
          }
      });

      const uniqueMistakes = Array.from(new Set(mistakes));
      setWeakConcepts(uniqueMistakes);

      if (uniqueMistakes.length === 0) {
          launchFinalQuiz();
      } else {
          launchRemediation(uniqueMistakes);
      }
  };

  const launchRemediation = async (concepts: string[]) => {
      setStep('analysis');
      try {
        const res = await fetch(`${API_URL}/api/path/remediation`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_text: courseText, weak_concepts: concepts, difficulty: 1 })
        });
        const data = await res.json();
        setRemediationData(data);
        setStep('remediation_learn');
      } catch (e) {
          alert("Erreur génération remédiation");
          setStep('start');
      }
  };

  const handleRemediationQuizComplete = (answers: number[]) => {
      launchFinalQuiz();
  };

  const launchFinalQuiz = async () => {
      setStep('analysis');
      try {
        const res = await fetch(`${API_URL}/api/path/validation`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_text: courseText, concepts: [], difficulty: 3 })
        });
        const data = await res.json();
        setFinalQuiz({ questions: data.questions });
        setStep('final_quiz');
      } catch (e) {
          alert("Erreur quiz final");
      }
  };

  const handleFinalQuizComplete = () => {
      launchPractice('easy');
  };

  const launchPractice = async (diff: 'easy' | 'hard') => {
      setStep('analysis');
      try {
        const res = await fetch(`${API_URL}/api/path/practice`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_text: courseText, difficulty: diff })
        });
        const data = await res.json();
        setCurrentExercise(data);
        setStep(diff === 'easy' ? 'practice_easy' : 'practice_hard');
      } catch (e) {
          alert("Erreur exercice");
      }
  };

  const handlePracticeComplete = () => {
      if (step === 'practice_easy') {
          if (confirm("Excellent ! Voulez-vous tenter l'exercice Difficile pour plus d'XP ?")) {
              launchPractice('hard');
          } else {
              finishPath();
          }
      } else {
          finishPath();
      }
  };

  const finishPath = () => {
      if (user) addXp(user.id, 500, "Parcours Maîtrisé");
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setStep('success');
  };

  // --- VUES ---

  if (step === 'loading' || step === 'analysis') {
      return (
          <div className="flex h-screen items-center justify-center bg-white flex-col gap-6">
              <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
              <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">L'IA travaille...</h2>
                  <p className="text-slate-500 font-medium">
                      {step === 'loading' ? 'Préparation du parcours' : 'Analyse de vos réponses et adaptation du contenu'}
                  </p>
              </div>
          </div>
      );
  }

  if (step === 'error') {
      return <div className="p-10 text-center">Erreur de chargement du cours.</div>;
  }

  // --- ÉCRAN DE DÉPART ---
  if (step === 'start') {
      return (
        <div className="min-h-screen bg-slate-50 px-4 py-8">
            <button onClick={() => router.push('/workspace/courses')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-12">
                <ArrowLeft size={16}/> Quitter
            </button>

            <div className="text-center py-12 animate-in zoom-in max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <Target size={48} className="text-blue-600" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4">Prêt à maîtriser "{courseTitle}" ?</h1>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                    Je vais d'abord évaluer ton niveau actuel pour créer un programme de révision 100% personnalisé.
                </p>
                <button
                    onClick={startDiagnostic}
                    className="btn-b-primary px-10 py-4 text-lg shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto"
                >
                    <Zap size={20} className="fill-yellow-400 text-yellow-400" />
                    Lancer le Diagnostic
                    {!isPremium && <span className="text-xs bg-slate-800 text-yellow-400 px-2 py-0.5 rounded-full font-bold ml-2 border border-yellow-400/30">-3 ⚡️</span>}
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

        {/* HEADER COMMUN */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-sm flex justify-between items-center">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm">
                <ArrowLeft size={16}/> Quitter
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Mode Parcours Adaptatif
            </span>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">

            {/* 1. DIAGNOSTIC */}
            {step === 'diagnostic' && diagnosticQuiz && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-slate-900 mb-2">Évaluation Initiale</h1>
                        <p className="text-slate-500">Répondez spontanément.</p>
                    </div>
                    <QuizDisplay quiz={diagnosticQuiz} onComplete={handleDiagnosticComplete} />
                </div>
            )}

            {/* 2. REMEDIATION (LEARN) */}
            {step === 'remediation_learn' && remediationData && (
                <div className="animate-in fade-in">
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-2xl">
                        <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2"><Brain size={18}/> Lacunes identifiées :</h3>
                        <div className="flex flex-wrap gap-2">
                            {weakConcepts.map(c => <span key={c} className="bg-white text-red-600 px-3 py-1 rounded-lg text-sm font-bold border border-red-100">{c}</span>)}
                        </div>
                    </div>
                    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600">
                            <ReactMarkdown>{remediationData.summary}</ReactMarkdown>
                        </div>
                    </div>
                    <button onClick={() => setStep('remediation_flashcards')} className="btn-b-primary w-full mt-8 py-4 text-lg shadow-lg">
                        J'ai compris, je veux mémoriser
                    </button>
                </div>
            )}

            {/* 3. REMEDIATION (FLASHCARDS) */}
            {step === 'remediation_flashcards' && remediationData && (
                <div className="animate-in fade-in">
                    <div className="text-center mb-8">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">Mémorisation</span>
                        <h2 className="text-3xl font-black text-slate-900 mt-4">Ancrage des connaissances</h2>
                    </div>

                    <FlashcardViewer
                        flashcards={remediationData.flashcards}
                        mode={['Anglais', 'Espagnol', 'Allemand'].includes(courseSubject) ? 'vocabulary' : 'standard'}
                    />

                    <div className="text-center mt-12">
                        <button onClick={async () => {
                            setStep('analysis');
                            const res = await fetch(`${API_URL}/api/path/validation`, {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ course_text: courseText, concepts: weakConcepts, difficulty: 2 })
                            });
                            const data = await res.json();
                            setValidationQuiz({ questions: data.questions });
                            setStep('remediation_quiz');
                        }} className="btn-b-primary px-12 py-3">Passer au test de vérification</button>
                    </div>
                </div>
            )}

            {/* 4. REMEDIATION (QUIZ VERIF) */}
            {step === 'remediation_quiz' && validationQuiz && (
                <div className="animate-in fade-in">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Vérification des acquis</h2>
                    </div>
                    <QuizDisplay quiz={validationQuiz} onComplete={handleRemediationQuizComplete} />
                </div>
            )}

            {/* 5. FINAL QUIZ */}
            {step === 'final_quiz' && finalQuiz && (
                <div className="animate-in fade-in">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            <Trophy size={12}/> Niveau Boss
                        </div>
                        <h2 className="text-4xl font-black text-slate-900">Validation Finale</h2>
                        <p className="text-slate-500 mt-2">Couvre l'ensemble du cours avec des questions pièges.</p>
                    </div>
                    <QuizDisplay quiz={finalQuiz} onComplete={handleFinalQuizComplete} />
                </div>
            )}

            {/* 6. PRACTICE */}
            {(step === 'practice_easy' || step === 'practice_hard') && currentExercise && (
                <div className="animate-in fade-in">
                    <PracticeInterface
                        exercise={currentExercise}
                        courseText={courseText}
                        onComplete={handlePracticeComplete}
                    />
                </div>
            )}

            {/* 7. SUCCESS */}
            {step === 'success' && (
                <div className="text-center py-20 animate-in zoom-in">
                    <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce">
                        <Trophy size={64} className="text-slate-900"/>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 mb-6">MAÎTRISE TOTALE !</h1>
                    <p className="text-xl text-slate-500 max-w-md mx-auto mb-12">
                        Vous maîtrisez maintenant ce sujet de A à Z.
                        <br/><strong className="text-blue-600">+500 XP</strong>
                    </p>
                    <button onClick={() => router.push('/workspace/courses')} className="btn-b-primary px-12 py-4 text-lg">
                        Retour à la bibliothèque
                    </button>
                </div>
            )}

        </div>
    </div>
  );
}