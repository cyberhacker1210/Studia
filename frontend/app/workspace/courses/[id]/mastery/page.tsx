'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Brain, Zap, CheckCircle, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { getCourseById } from '@/lib/courseService';
import { addXp } from '@/lib/gamificationService';
import ReactMarkdown from 'react-markdown';

type Phase = 'diagnostic' | 'learning' | 'validation' | 'success';

interface Question {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  concept: string;
}

interface LearningContent {
  text: string;
  flashcards: { front: string; back: string }[];
}

export default function MasteryPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [courseText, setCourseText] = useState('');
  const [phase, setPhase] = useState<Phase>('diagnostic');
  const [loading, setLoading] = useState(true);

  const [quiz, setQuiz] = useState<Question[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [weakConcepts, setWeakConcepts] = useState<string[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null);
  const [difficulty, setDifficulty] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user && params.id) {
        const init = async () => {
            const course = await getCourseById(Number(params.id), user.id);
            setCourseText(course.extracted_text);
            generateDiagnosticQuiz(course.extracted_text);
        };
        init();
    }
  }, [user, params.id]);

  const generateDiagnosticQuiz = async (text: string) => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/path/diagnostic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_text: text }),
        });
        const data = await res.json();
        setQuiz(data.questions);
        setQuizAnswers(new Array(data.questions.length).fill(-1));
        setPhase('diagnostic');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const generateRemediation = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/path/remediation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                course_text: courseText,
                weak_concepts: weakConcepts,
                difficulty: difficulty
            }),
        });
        const data = await res.json();
        setLearningContent(data);
        setPhase('learning');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const generateValidationQuiz = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/api/path/validation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                course_text: courseText,
                concepts: weakConcepts,
                difficulty: difficulty
            }),
        });
        const data = await res.json();
        setQuiz(data.questions);
        setQuizAnswers(new Array(data.questions.length).fill(-1));
        setPhase('validation');
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmitDiagnostic = () => {
      const mistakes = quiz.filter((q, i) => quizAnswers[i] !== q.correct_index);
      const mistakesConcepts = mistakes.map(q => q.concept);

      if (mistakes.length === 0) {
          if (difficulty >= 3) {
              setPhase('success');
              addXp(user!.id, 500, 'Maîtrise Totale');
          } else {
              setDifficulty(d => d + 1);
              alert(`Parfait ! Passage au niveau ${difficulty + 1}.`);
              generateValidationQuiz();
          }
      } else {
          setWeakConcepts([...new Set(mistakesConcepts)]);
          generateRemediation();
      }
  };

  const handleFinishLearning = () => {
      generateValidationQuiz();
  };

  const handleSubmitValidation = () => {
      const score = quiz.reduce((acc, q, i) => acc + (quizAnswers[i] === q.correct_index ? 1 : 0), 0);
      const percentage = (score / quiz.length) * 100;

      if (percentage >= 80) {
          if (difficulty >= 3) {
              setPhase('success');
              addXp(user!.id, 1000, 'Expert');
          } else {
              setDifficulty(d => d + 1);
              setWeakConcepts([]);
              alert(`Niveau validé ! On monte d'un cran.`);
              generateValidationQuiz();
          }
      } else {
          alert("Encore des erreurs. On reprend l'explication.");
          const newMistakes = quiz.filter((q, i) => quizAnswers[i] !== q.correct_index).map(q => q.concept);
          setWeakConcepts([...new Set(newMistakes)]);
          generateRemediation();
      }
  };

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center flex-col bg-white">
              <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  <Brain className="absolute inset-0 m-auto text-slate-900" size={32}/>
              </div>
              <h2 className="text-xl font-bold text-slate-900 animate-pulse">Analyse cognitive en cours...</h2>
          </div>
      );
  }

  if (phase === 'diagnostic' || phase === 'validation') {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 pb-32">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-sm mb-8 hover:text-slate-900 transition-colors">
                  <ArrowLeft size={18}/> Retour
              </button>

              <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                      {phase === 'diagnostic' ? 'Diagnostic' : `Niveau ${difficulty}/3`}
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">
                      {phase === 'diagnostic' ? 'Évaluation initiale' : 'Validation des acquis'}
                  </h1>
              </div>

              <div className="space-y-6">
                  {quiz.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 transition-all hover:border-slate-200">
                          <p className="font-bold text-lg mb-6 text-slate-900">{q.question}</p>
                          <div className="space-y-3">
                              {q.options.map((opt, oIdx) => (
                                  <button
                                      key={oIdx}
                                      onClick={() => {
                                          const newAns = [...quizAnswers];
                                          newAns[qIdx] = oIdx;
                                          setQuizAnswers(newAns);
                                      }}
                                      className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${
                                          quizAnswers[qIdx] === oIdx
                                          ? 'border-slate-900 bg-slate-900 text-white shadow-md transform scale-[1.01]'
                                          : 'border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
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
                onClick={phase === 'diagnostic' ? handleSubmitDiagnostic : handleSubmitValidation}
                disabled={quizAnswers.includes(-1)}
                className="fixed bottom-6 left-6 right-6 md:left-auto md:right-auto md:w-[700px] mx-auto bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
              >
                  Valider mes réponses
              </button>
          </div>
      );
  }

  if (phase === 'learning' && learningContent) {
      return (
          <div className="max-w-3xl mx-auto py-12 px-6 pb-32">
              <div className="bg-orange-50 border-2 border-orange-100 rounded-[2rem] p-8 mb-8">
                  <h2 className="text-xl font-black text-orange-800 mb-2 flex items-center gap-2">
                      <AlertTriangle size={24}/> Concepts à renforcer
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-4">
                      {weakConcepts.map(c => (
                          <span key={c} className="bg-white text-orange-600 px-3 py-1 rounded-lg text-sm font-bold shadow-sm border border-orange-100">{c}</span>
                      ))}
                  </div>
              </div>

              <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 mb-12 prose prose-slate prose-lg max-w-none">
                  <ReactMarkdown>{learningContent.text}</ReactMarkdown>
              </div>

              <div className="grid gap-4 mb-12">
                  {learningContent.flashcards.map((fc, idx) => (
                      <div key={idx} className="bg-white border-2 border-slate-100 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer shadow-sm">
                          <p className="font-black text-slate-900 mb-2 text-lg">{fc.front}</p>
                          <div className="h-px w-16 bg-slate-200 mx-auto my-3"></div>
                          <p className="text-slate-500 font-medium">{fc.back}</p>
                      </div>
                  ))}
              </div>

              <button
                onClick={handleFinishLearning}
                className="btn-b-primary w-full py-4"
              >
                  Je suis prêt à retester <Zap size={20} className="ml-2 fill-yellow-400 text-yellow-400"/>
              </button>
          </div>
      );
  }

  if (phase === 'success') {
      return (
          <div className="flex h-screen items-center justify-center bg-white text-center px-6 animate-in zoom-in">
              <div className="max-w-md">
                  <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-yellow-200">
                      <TrendingUp size={64} className="text-yellow-600"/>
                  </div>
                  <h1 className="text-5xl font-black text-slate-900 mb-4">MAÎTRISE TOTALE !</h1>
                  <p className="text-xl text-slate-500 font-medium mb-10">
                      Vous avez validé le niveau expert ({difficulty}/3). Vous êtes prêt pour l'examen.
                  </p>
                  <button onClick={() => router.push('/workspace/courses')} className="btn-b-primary w-full py-4 text-lg">
                      Retour à la bibliothèque
                  </button>
              </div>
          </div>
      );
  }

  return null;
}