'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowRight, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CourseChatProps {
  courseText: string;
  courseTitle: string;
}

export default function CourseChat({ courseText, courseTitle }: CourseChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Bonjour ! Je suis ton tuteur pour **"${courseTitle}"**. Pose-moi une question sur le cours, je suis prêt.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
        body: JSON.stringify({
          message: userMsg,
          history: newHistory.filter(m => m.role !== 'system'),
          course_context: courseText
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'system', content: "Désolé, je n'arrive pas à répondre pour le moment. Vérifiez votre connexion." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* Zone de Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';

          if (isSystem) {
              return (
                  <div key={idx} className="text-center text-xs text-red-500 font-medium py-2">
                      {msg.content}
                  </div>
              );
          }

          return (
            <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>

               {/* Avatar IA */}
               {!isUser && (
                   <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 mr-3 mt-1 shadow-sm">
                       <Bot size={16} />
                   </div>
               )}

               {/* Bulle de Message */}
               <div className={`
                   max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
                   ${isUser 
                     ? 'bg-blue-600 text-white rounded-br-none' 
                     : 'bg-white border border-slate-100 rounded-bl-none text-slate-800 font-serif' // Police Serif pour l'IA
                   }
               `}>
                   {isUser ? (
                       <p>{msg.content}</p>
                   ) : (
                       /* --- STYLE MARKDOWN IA (Comme le Lecteur) --- */
                       <div className="prose prose-sm md:prose-base max-w-none
                            prose-p:text-slate-700 prose-p:mb-2 prose-p:leading-relaxed
                            prose-strong:text-slate-900 prose-strong:font-bold prose-strong:font-sans
                            prose-headings:font-sans prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mb-2 prose-headings:mt-4
                            prose-ul:list-disc prose-ul:pl-4 prose-ul:mb-2
                            prose-ol:list-decimal prose-ol:pl-4 prose-ol:mb-2
                            prose-li:text-slate-700 prose-li:font-serif
                            prose-code:bg-slate-100 prose-code:text-pink-600 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
                            prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600
                       ">
                           <ReactMarkdown>{msg.content}</ReactMarkdown>
                       </div>
                   )}
               </div>

               {/* Avatar User */}
               {isUser && (
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 ml-3 mt-1">
                       <User size={16} />
                   </div>
               )}
            </div>
          );
        })}

        {isLoading && (
            <div className="flex justify-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 mr-3 mt-1">
                    <Bot size={16} />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl rounded-bl-none border border-slate-100 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-slate-400"/>
                    <span className="text-xs font-bold text-slate-400">Analyse du cours...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de Saisie */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
           <input
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder="Posez une question..."
             className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 font-medium rounded-2xl py-3.5 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white border border-transparent focus:border-blue-200 transition-all shadow-sm"
             disabled={isLoading}
           />
           <button
             type="submit"
             disabled={!input.trim() || isLoading}
             className="absolute right-2 p-2.5 bg-slate-900 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-md"
           >
             <ArrowRight size={18} />
           </button>
        </form>
      </div>
    </div>
  );
}