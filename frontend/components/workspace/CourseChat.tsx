'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowRight, User } from 'lucide-react';

// ... Garde tes interfaces Message/Props ...
interface Message { role: 'user' | 'assistant' | 'system'; content: string; }
interface CourseChatProps { courseText: string; courseTitle: string; }

export default function CourseChat({ courseText, courseTitle }: CourseChatProps) {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: `Bonjour ! Je suis ton tuteur pour "${courseTitle}".` }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: newHistory.filter(m => m.role !== 'system'), course_context: courseText }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: "Erreur de connexion." }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
      <div className="bg-white border-b border-slate-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><Bot size={24}/></div>
        <div>
           <h3 className="font-bold text-slate-900 text-lg">Tuteur IA</h3>
           <div className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span><span className="text-xs font-bold text-slate-400 uppercase">En ligne</span></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[80%] p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${isUser ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'}`}>
                   {msg.content}
               </div>
            </div>
          );
        })}
        {isLoading && <div className="text-slate-400 text-xs font-bold animate-pulse pl-4">Le tuteur écrit...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center">
           <input
             type="text" value={input} onChange={(e) => setInput(e.target.value)}
             placeholder="Posez une question..."
             className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-400 font-medium rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
             disabled={isLoading}
           />
           <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 p-3 bg-slate-900 text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
             <ArrowRight size={20} />
           </button>
        </form>
      </div>
    </div>
  );
}