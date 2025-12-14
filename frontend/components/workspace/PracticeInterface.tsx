'use client';

import { useState } from 'react';
import { Send, Bot, CheckCircle, XCircle, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PracticeInterfaceProps {
  exercise: { instruction: string; context: string; difficulty: string };
  courseText: string;
  onComplete: () => void;
}

export default function PracticeInterface({ exercise, courseText, onComplete }: PracticeInterfaceProps) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'typing' | 'evaluating' | 'feedback'>('typing');
  const [evaluation, setEvaluation] = useState<any>(null);

  // Chat Tuteur
  const [showTutor, setShowTutor] = useState(false); // ✅ État de bascule
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleSubmit = async () => {
    if (answer.length < 10) return alert("Développez un peu plus votre réponse.");
    setStatus('evaluating');

    try {
      const res = await fetch(`${API_URL}/api/path/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: exercise.instruction,
          student_answer: answer,
          course_context: courseText
        })
      });
      const data = await res.json();
      setEvaluation(data);
      setStatus('feedback');
    } catch (e) {
      alert("Erreur de correction");
      setStatus('typing');
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const newMsg = { role: 'user', content: chatInput };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
        const res = await fetch(`${API_URL}/api/chat/tutor`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: newMsg.content, history: messages, course_context: courseText })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch(e) { console.error(e); }
    finally { setChatLoading(false); }
  };

  // VUE TUTEUR (PLEIN ÉCRAN MOBILE)
  if (showTutor) {
      return (
        <div className="flex flex-col h-[600px] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white"><Bot size={20}/></div>
                    <div>
                        <h3 className="font-bold text-white">Tuteur IA</h3>
                        <p className="text-xs text-slate-400">Posez vos questions</p>
                    </div>
                </div>
                <button onClick={() => setShowTutor(false)} className="text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center gap-2 text-sm font-bold">
                    <ArrowLeft size={18} /> Retour
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 mt-10">
                        <p className="text-sm font-bold">Besoin d'un indice ? Demandez-moi !</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {chatLoading && <div className="text-slate-500 text-xs animate-pulse pl-2">L'IA écrit...</div>}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <form onSubmit={(e) => { e.preventDefault(); handleChatSend(); }} className="relative">
                    <input
                        className="w-full bg-slate-50 text-slate-900 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200"
                        placeholder="Une question ?"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors">
                        <Send size={14}/>
                    </button>
                </form>
            </div>
        </div>
      );
  }

  // VUE EXERCICE STANDARD
  return (
    <div className="flex flex-col h-full min-h-[600px]">
        <div className="flex-1 bg-white rounded-[2.5rem] border-2 border-slate-100 overflow-hidden flex flex-col shadow-sm">

            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        <div className={`w-3 h-3 rounded-full ${exercise.difficulty === 'hard' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                        Exercice
                    </div>
                    {/* Bouton d'aide en haut à droite */}
                    <button onClick={() => setShowTutor(true)} className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 border border-blue-100">
                        <HelpCircle size={16} /> Aide Tuteur
                    </button>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{exercise.instruction}</h2>
                {exercise.context && <p className="mt-2 text-slate-600 italic text-sm border-l-2 border-slate-300 pl-3">{exercise.context}</p>}
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                {status === 'typing' && (
                    <textarea
                        className="w-full h-full resize-none outline-none text-lg text-slate-700 placeholder:text-slate-300 bg-transparent leading-relaxed"
                        placeholder="Votre réponse ici..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        autoFocus
                    />
                )}

                {status === 'evaluating' && (
                    <div className="h-full flex items-center justify-center flex-col gap-4 animate-pulse">
                        <Bot size={48} className="text-slate-300" />
                        <p className="text-slate-400 font-bold">Correction IA en cours...</p>
                    </div>
                )}

                {status === 'feedback' && evaluation && (
                    <div className="space-y-6 animate-in fade-in">
                        <div className={`p-6 rounded-2xl border-l-4 ${evaluation.is_correct ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-500'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className={`font-black text-xl ${evaluation.is_correct ? 'text-green-700' : 'text-orange-700'}`}>
                                    Note : {evaluation.score}/100
                                </span>
                                {evaluation.is_correct ? <CheckCircle className="text-green-600"/> : <XCircle className="text-orange-600"/>}
                            </div>
                            <p className="text-slate-700 leading-relaxed">{evaluation.feedback}</p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl">
                            <h3 className="font-bold text-slate-900 mb-3">Correction Type :</h3>
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown>{evaluation.correction}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end bg-white">
                {status === 'typing' && (
                    <button onClick={handleSubmit} className="btn-b-primary px-8 w-full sm:w-auto">Soumettre</button>
                )}
                {status === 'feedback' && (
                    <button onClick={onComplete} className="btn-b-primary px-8 flex items-center gap-2 w-full sm:w-auto">
                        Continuer <ArrowRight size={18}/>
                    </button>
                )}
            </div>
        </div>
    </div>
  );
}