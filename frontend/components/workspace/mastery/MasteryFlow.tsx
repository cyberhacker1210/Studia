'use client';

import { useState, useEffect } from 'react';
import {
    masteryStart,
    analyzeStudentAnswer,
    generatePractice,
    generateExam,
    evaluateExam,
    MasteryPathResponse,
    AnalysisResult
} from '@/lib/api';

// ==========================================
// 1. COMPOSANT FLASHCARDS (Révision)
// ==========================================
const FlashcardSession = ({ cards, onComplete }: { cards: any[], onComplete: () => void }) => {
    const [index, setIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        if (index < cards.length - 1) {
            setTimeout(() => setIndex(index + 1), 300);
        } else {
            onComplete();
        }
    };

    const currentCard = cards[index];

    return (
        <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    Révision Flashcards
                </span>
                <h3 className="text-2xl font-black text-gray-800 dark:text-white">Carte {index + 1} / {cards.length}</h3>
            </div>

            <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative w-full max-w-lg h-80 cursor-pointer perspective-1000 group"
            >
                <div className={`relative w-full h-full duration-500 transform transition-transform preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    {/* Recto */}
                    <div className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-b-4 border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-8 backface-hidden">
                        <span className="text-gray-400 text-sm font-bold uppercase mb-4">Question</span>
                        <p className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 leading-snug">
                            {currentCard.front}
                        </p>
                        <p className="absolute bottom-6 text-sm text-gray-400 animate-pulse">Cliquez pour retourner</p>
                    </div>
                    {/* Verso */}
                    <div className="absolute w-full h-full bg-indigo-600 rounded-3xl shadow-2xl border-b-4 border-indigo-800 flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180 text-white">
                        <span className="text-indigo-200 text-sm font-bold uppercase mb-4">Réponse</span>
                        <p className="text-xl text-center font-medium leading-relaxed">
                            {currentCard.back}
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleNext}
                className="px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-lg transition-transform hover:scale-105"
            >
                {index < cards.length - 1 ? 'Carte Suivante 👉' : 'Passer aux Exercices 🔥'}
            </button>
        </div>
    );
};

// ==========================================
// 2. COMPOSANT EXERCICE (Open Question)
// ==========================================
const ExerciseSession = ({ title, instruction, difficulty, onComplete }: any) => {
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setAnswer("");
        setFeedback(null);
    }, [instruction]);

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        try {
            // L'instruction contient souvent "instruction" et "expected_answer_points"
            const points = instruction.expected_answer_points || [];
            const result = await analyzeStudentAnswer(answer, instruction.instruction, points);
            setFeedback(result);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    // Thèmes de couleurs
    const themes = {
        facile: "bg-green-50 border-green-200 text-green-800",
        moyen: "bg-yellow-50 border-yellow-200 text-yellow-800",
        difficile: "bg-red-50 border-red-200 text-red-800"
    };
    const currentTheme = themes[difficulty as keyof typeof themes] || themes.moyen;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right duration-500">
            <div className={`p-6 rounded-2xl border-2 ${currentTheme} shadow-sm`}>
                <div className="flex items-center space-x-2 mb-2">
                    <span className="uppercase text-xs font-black tracking-wider border border-current px-2 py-0.5 rounded">
                        {difficulty}
                    </span>
                    <h3 className="font-bold text-lg">{title}</h3>
                </div>
                <p className="text-xl font-medium">{instruction.instruction}</p>
            </div>

            {!feedback ? (
                <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
                    <textarea
                        className="w-full p-4 border-none rounded-xl focus:ring-0 text-gray-700 text-lg min-h-[200px] resize-none"
                        placeholder="Écrivez votre réponse ici..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                    <div className="p-2 bg-gray-50 rounded-xl mt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !answer}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all disabled:opacity-50"
                        >
                            {loading ? 'Analyse en cours...' : 'Valider ma réponse'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className={`p-6 ${feedback.understanding_score > 60 ? 'bg-green-100' : 'bg-orange-100'}`}>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">Score de précision</span>
                            <span className="text-3xl font-black">{feedback.understanding_score}%</span>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <p className="text-gray-700 text-lg leading-relaxed">{feedback.feedback}</p>

                        <button
                            onClick={feedback.understanding_score > 40 ? onComplete : () => setFeedback(null)}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] ${
                                feedback.understanding_score > 40
                                ? 'bg-gray-900 text-white hover:bg-black'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            {feedback.understanding_score > 40 ? 'Niveau Suivant 👉' : 'Réessayer ↺'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// 3. VUE PRINCIPALE PRATIQUE
// ==========================================
const PracticeView = ({ content, onComplete }: { content: any, onComplete: () => void }) => {
    const [stage, setStage] = useState<'intro' | 'flashcards' | 'facile' | 'moyen' | 'difficile'>('intro');

    if (stage === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-8 text-center animate-in zoom-in duration-300">
                <div className="bg-indigo-100 p-6 rounded-full text-indigo-600">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Entraînement Ciblé</h2>
                    <p className="text-xl text-gray-500 max-w-md mx-auto">
                        Nous avons généré un programme personnalisé pour combler vos lacunes.
                    </p>
                </div>
                <button
                    onClick={() => setStage('flashcards')}
                    className="px-10 py-4 bg-indigo-600 text-white text-lg font-bold rounded-full shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                    Commencer 🚀
                </button>
            </div>
        );
    }

    // Gestion si flashcards vide (sécurité)
    const hasFlashcards = content.revision_flashcards && content.revision_flashcards.length > 0;

    if (stage === 'flashcards') {
        if (!hasFlashcards) { setStage('facile'); return null; }
        return <FlashcardSession cards={content.revision_flashcards} onComplete={() => setStage('facile')} />;
    }

    // Indicateur de progression
    const progressMap = { facile: 1, moyen: 2, difficile: 3 };
    const currentProgress = progressMap[stage as keyof typeof progressMap] || 0;

    return (
        <div className="py-8">
            <div className="flex justify-center space-x-2 mb-8">
                {[1, 2, 3].map(lvl => (
                    <div key={lvl} className={`h-2 w-12 rounded-full transition-all duration-300 ${lvl <= currentProgress ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                ))}
            </div>

            {stage === 'facile' && <ExerciseSession title="Niveau 1" instruction={content.exercice_facile} difficulty="facile" onComplete={() => setStage('moyen')} />}
            {stage === 'moyen' && <ExerciseSession title="Niveau 2" instruction={content.exercice_moyen} difficulty="moyen" onComplete={() => setStage('difficile')} />}
            {stage === 'difficile' && <ExerciseSession title="Niveau 3" instruction={content.exercice_difficile} difficulty="difficile" onComplete={onComplete} />}
        </div>
    );
};

// ==========================================
// 4. AUTRES VUES (Théorie, Diag, Examen)
// ==========================================

const TheoryView = ({ content, onNext }: { content: any, onNext: () => void }) => (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-4xl font-black mb-6 text-gray-900 dark:text-white">{content.title}</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed">
                {content.content_markdown}
            </div>
        </div>
        <div className="flex justify-center">
            <button onClick={onNext} className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-xl transition-all hover:scale-105">
                J'ai tout lu, passer au Test 👉
            </button>
        </div>
    </div>
);

const DiagnosticView = ({ content, onComplete }: { content: any, onComplete: (results: any[]) => void }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [feedback, setFeedback] = useState<AnalysisResult | null>(null);

    const question = content.questions[currentIndex];

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        try {
            const analysis = await analyzeStudentAnswer(answer, question.question, question.expected_answer_points);
            setFeedback(analysis);
            setResults([...results, { ...analysis, questionId: question.id }]);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleNext = () => {
        setFeedback(null);
        setAnswer("");
        if (currentIndex < content.questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete(results);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between font-bold text-gray-400 uppercase text-sm tracking-widest">
                <span>Diagnostic</span>
                <span>Question {currentIndex + 1} / {content.questions.length}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">{question.question}</h3>

                {!feedback ? (
                    <div className="space-y-4">
                        <textarea
                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-purple-500 rounded-2xl transition-all min-h-[140px] resize-none text-lg"
                            placeholder="Votre réponse..."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />
                        <button onClick={handleSubmit} disabled={loading || !answer} className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl shadow-lg hover:bg-purple-700 transition-colors">
                            {loading ? 'Analyse en cours...' : 'Valider'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className={`p-6 rounded-2xl ${feedback.understanding_score > 60 ? 'bg-green-50 text-green-900' : 'bg-orange-50 text-orange-900'}`}>
                            <div className="font-bold mb-2 text-lg">Feedback ({feedback.understanding_score}/100)</div>
                            <p>{feedback.feedback}</p>
                        </div>
                        <button onClick={handleNext} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg">
                            Continuer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ExamView = ({ content, courseText, onComplete }: { content: any, courseText: string, onComplete: (res: any) => void }) => {
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        const result = await evaluateExam(content.title, courseText, content.correction_criteria, answer);
        onComplete(result);
        setLoading(false);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-3xl shadow-xl border-t-8 border-red-600">
                <h2 className="text-3xl font-black text-gray-900 mb-4">🎓 EXAMEN FINAL</h2>
                <h3 className="text-xl font-bold text-red-600 mb-4">{content.title}</h3>
                <div className="bg-red-50 p-6 rounded-2xl text-gray-800 font-medium mb-6 leading-relaxed">
                    {content.main_problem}
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                    <p className="font-bold mb-2 uppercase tracking-wide">Indices :</p>
                    <ul className="list-disc pl-5 space-y-1">{content.hints.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul>
                </div>
            </div>

            <div className="bg-white p-2 rounded-3xl shadow-xl">
                <textarea
                    className="w-full p-8 border-none rounded-2xl focus:ring-0 min-h-[400px] text-lg text-gray-700 resize-none"
                    placeholder="Rédigez votre copie d'examen ici..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />
            </div>

            <button onClick={handleSubmit} disabled={loading || !answer} className="w-full py-5 bg-red-600 text-white font-bold rounded-2xl shadow-xl hover:bg-red-700 text-xl transition-transform hover:scale-[1.01]">
                {loading ? 'Correction par le jury...' : 'Rendre ma copie'}
            </button>
        </div>
    );
};

// ==========================================
// 5. ORCHESTRATEUR PRINCIPAL
// ==========================================
export default function MasteryFlow({ course }: { course: any }) {
    const [pathData, setPathData] = useState<MasteryPathResponse | null>(null);
    const [currentStepId, setCurrentStepId] = useState(1);
    const [loading, setLoading] = useState(true);
    const [examResult, setExamResult] = useState<any>(null);

    useEffect(() => {
        if (course?.extracted_text) {
            masteryStart(course.extracted_text, course.subject)
                .then(data => { setPathData(data); setLoading(false); })
                .catch(e => console.error(e));
        }
    }, [course]);

    const updateStep = (id: number, content: any) => {
        setPathData(prev => prev ? ({...prev, steps: prev.steps.map(s => s.id === id ? { ...s, content } : s)}) : null);
    };

    const handleDiagComplete = async (results: any[]) => {
        setLoading(true);
        const weakPoints = results.filter(r => r.understanding_score < 60).map(r => r.concept);
        if (weakPoints.length > 0) {
            const practiceContent = await generatePractice(course.extracted_text, weakPoints);
            updateStep(3, practiceContent);
            setCurrentStepId(3);
        } else {
            await startExam();
        }
        setLoading(false);
    };

    const startExam = async () => {
        setLoading(true);
        const examContent = await generateExam(course.extracted_text);
        updateStep(4, examContent);
        setCurrentStepId(4);
        setLoading(false);
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            <p className="text-gray-500 font-medium animate-pulse">Chargement de votre parcours...</p>
        </div>
    );

    if (!pathData) return <div>Erreur de chargement.</div>;

    if (examResult) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-12 flex items-center justify-center">
                <div className="bg-white p-12 rounded-[2rem] shadow-2xl max-w-3xl w-full text-center animate-in zoom-in duration-500">
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm">Parcours Terminé</span>
                    <h1 className="text-6xl font-black mt-8 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        {examResult.correction_detailee?.match(/\d+\/20/)?.[0] || "Note ?"}
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 italic">"{examResult.feedback_global}"</p>
                    <div className="text-left bg-gray-50 p-8 rounded-2xl text-gray-700 whitespace-pre-wrap border border-gray-100 leading-relaxed">
                        {examResult.correction_detailee}
                    </div>
                </div>
            </div>
        );
    }

    const currentStep = pathData.steps.find(s => s.id === currentStepId);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans text-gray-900">
            {/* Steps Indicator */}
            <div className="max-w-xl mx-auto mb-16">
                <div className="flex justify-between relative">
                    {[1, 2, 3, 4].map(step => (
                        <div key={step} className="relative z-10 flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 border-4 ${
                                step === currentStepId ? 'bg-blue-600 border-blue-200 text-white scale-110 shadow-lg' :
                                step < currentStepId ? 'bg-green-500 border-green-200 text-white' :
                                'bg-white border-gray-200 text-gray-300'
                            }`}>
                                {step < currentStepId ? '✓' : step}
                            </div>
                            <span className={`text-xs font-bold mt-2 uppercase tracking-widest ${step === currentStepId ? 'text-blue-600' : 'text-gray-300'}`}>
                                {['Théorie', 'Diag', 'Pratique', 'Exam'][step-1]}
                            </span>
                        </div>
                    ))}
                    {/* Ligne de fond */}
                    <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 -z-0"></div>
                    {/* Ligne de progression */}
                    <div
                        className="absolute top-6 left-0 h-1 bg-green-500 -z-0 transition-all duration-700"
                        style={{ width: `${((currentStepId - 1) / 3) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Zone de contenu principale */}
            <div className="max-w-5xl mx-auto transition-all duration-500">
                {currentStep?.type === 'theory' && <TheoryView content={currentStep.content} onNext={() => setCurrentStepId(2)} />}
                {currentStep?.type === 'diagnostic' && <DiagnosticView content={currentStep.content} onComplete={handleDiagComplete} />}
                {currentStep?.type === 'remediation' && <PracticeView content={currentStep.content} onComplete={startExam} />}
                {currentStep?.type === 'exam' && <ExamView content={currentStep.content} courseText={course.extracted_text} onComplete={setExamResult} />}
            </div>
        </div>
    );
}