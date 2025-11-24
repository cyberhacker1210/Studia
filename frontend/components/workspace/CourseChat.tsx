'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Sparkles, GraduationCap, AlertTriangle } from 'lucide-react';

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
    {
      role: 'assistant',
      content: `Bonjour ! Je suis ton professeur particulier pour le cours **"${courseTitle}"**. \n\nJe suis là pour t'aider à comprendre, pas juste te donner les réponses. Sur quel point veux-tu qu'on travaille ?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Variable d'environnement pour l'API
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // 1. Ajouter le message utilisateur à l'interface
    const newHistory = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // 2. Nettoyer l'historique pour l'API (garder uniquement user/assistant)
      const cleanHistory = newHistory
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      // 3. Appel à l'API "Professeur Socratique"
      const response = await fetch(`${API_URL}/api/chat/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: cleanHistory,
          course_context: courseText
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();

      // 4. Ajouter la réponse du prof
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error('Erreur chat:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: "❌ Désolé, j'ai eu un petit problème de connexion avec le professeur. Réessaie dans un instant !"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

      {/* Header du Chat */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Professeur Studia</h3>
            <p className="text-blue-100 text-xs flex items-center gap-1">
              <Sparkles size={10} /> Mode Socratique Actif
            </p>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';

          return (
            <div
              key={idx}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>

                {/* Avatar */}
                {!isSystem && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                    isUser ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                  </div>
                )}

                {/* Bulle de message */}
                <div
                  className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    isSystem 
                      ? 'bg-red-50 text-red-600 w-full text-center border border-red-100 flex items-center justify-center gap-2'
                      : isUser
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {isSystem && <AlertTriangle size={16} />}

                  {/* Rendu basique du Markdown pour le gras et les retours à la ligne */}
                  <div className="whitespace-pre-wrap">
                    {msg.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Indicateur de frappe */}
        {isLoading && (
          <div className="flex justify-start w-full animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question au professeur..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-gray-700 placeholder-gray-400 outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}