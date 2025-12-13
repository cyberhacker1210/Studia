'use client';

import { useState } from 'react';
import { Send, Bot, CheckCircle, XCircle, HelpCircle, ArrowRight, User , X } from 'lucide-react';
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
  const [chatOpen, setChatOpen] = useState(false);
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)] min-h-[600px]">

        {/* --- ZONE EXERCICE (Gauche) --- */}
        <div className={`flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-500 ${chatOpen ? 'lg:w-3/5' : 'w-full'}`}>

            {/* Header Exercice */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white ${exercise.difficulty === 'hard' ? 'bg-red-500' : 'bg-blue-600'}`}>
                        {exercise.difficulty === 'hard' ? 'Niveau Boss' : 'Application'}
                    </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{exercise.instruction}</h2>
                {exercise.context && (
                    <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-slate-700 text-sm italic rounded-r-xl">
                        {exercise.context}
                    </div>
                )}
            </div>

            {/* Zone de Réponse / Correction */}
            <div className="flex-1 p-8 overflow-y-auto bg-white relative">
                {status === 'typing' && (
                    <textarea
                        className="w-full h-full resize-none outline-none text-lg text-slate-700 placeholder:text-slate-300 bg-transparent leading-relaxed"
                        placeholder="Écrivez votre réponse ici..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        autoFocus
                    />
                )}

                {status === 'evaluating' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 animate-in fade-in">
                        <Bot size={64} className="text-slate-900 animate-bounce mb-6" />
                        <p className="text-xl font-black text-slate-900">Le correcteur relit votre copie...</p>
                    </div>
                )}

                {status === 'feedback' && evaluation && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4">
                        {/* Note & Feedback */}
                        <div className={`p-8 rounded-[2rem] border-l-8 shadow-sm ${evaluation.is_correct ? 'bg-green-50 border-green-500' : 'bg-orange-50 border-orange-500'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className={`font-black text-3xl ${evaluation.is_correct ? 'text-green-700' : 'text-orange-700'}`}>
                                    {evaluation.score}/100
                                </span>
                                {evaluation.is_correct ? <CheckCircle size={32} className="text-green-600"/> : <XCircle size={32} className="text-orange-600"/>}
                            </div>
                            <p className="text-lg font-medium text-slate-800 leading-relaxed">{evaluation.feedback}</p>
                        </div>

                        {/* Corrigé Type */}
                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                            <h3 className="font-black text-slate-900 mb-4 text-lg uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle size={20}/> Correction Type
                            </h3>
                            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                                <ReactMarkdown>{evaluation.correction}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-white">
                <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${chatOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                    <HelpCircle size={20} /> {chatOpen ? 'Masquer le tuteur' : 'Besoin d\'aide ?'}
                </button>

                {status === 'typing' && (
                    <button onClick={handleSubmit} className="btn-b-primary px-10 py-3 text-lg shadow-lg hover:scale-105 transition-transform">
                        Soumettre ma copie
                    </button>
                )}
                {status === 'feedback' && (
                    <button onClick={onComplete} className="btn-b-primary px-10 py-3 text-lg flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                        Terminer <ArrowRight size={20} strokeWidth={3}/>
                    </button>
                )}
            </div>
        </div>

        {/* --- ZONE TUTEUR (Droite - Coulissante sur Desktop) --- */}
        {chatOpen && (
            <div className="fixed inset-0 lg:static lg:w-[450px] bg-white lg:bg-slate-50 lg:border lg:border-slate-200 lg:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl lg:shadow-none z-50 animate-in slide-in-from-right lg:slide-in-from-right-10 duration-300">

                {/* Header Tuteur */}
                <div className="p-6 bg-slate-900 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg"><Bot size={24}/></div>
                        <div>
                            <h3 className="font-black text-white text-lg">Tuteur IA</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">En ligne</span>
                            </div>
                        </div>
                    </div>
                    {/* Bouton Fermer (Mobile uniquement) */}
                    <button onClick={() => setChatOpen(false)} className="lg:hidden p-2 bg-white/10 rounded-full text-white"><X size={20}/></button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-100 lg:bg-white">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-400 mt-10">
                            <p className="text-sm font-bold">Posez une question sur l'exercice.</p>
                        </div>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                                m.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-sm' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold pl-2">
                            <Loader2 size={12} className="animate-spin"/> L'IA réfléchit...
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={(e) => { e.preventDefault(); handleChatSend(); }} className="relative">
                        <input
                            className="w-full bg-slate-50 text-slate-900 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 border border-slate-200 transition-all shadow-inner"
                            placeholder="Une question ?"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                        />
                        <button type="submit" className="absolute right-2 top-2 p-2 bg-slate-900 rounded-xl text-white hover:bg-slate-700 transition-colors shadow-md">
                            <Send size={16}/>
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}