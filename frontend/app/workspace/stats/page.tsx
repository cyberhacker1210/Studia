'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Award, BookOpen, Layers, Flame, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function StatsPage() {
  const { user } = useUser();
  const [stats, setStats] = useState({ quizzes: 0, cards: 0, score: 0, streak: 1 });

  useEffect(() => {
    if (user) {
        const load = async () => {
            const { data: q } = await supabase.from('quiz_history').select('score, total_questions').eq('user_id', user.id);
            const { data: d } = await supabase.from('flashcard_decks').select('flashcards').eq('user_id', user.id);

            const totalQ = q?.length || 0;
            const totalC = d?.reduce((acc, deck) => acc + deck.flashcards.length, 0) || 0;
            const avg = totalQ > 0 ? Math.round(q!.reduce((acc, val) => acc + (val.score/val.total_questions), 0) / totalQ * 100) : 0;

            setStats({ quizzes: totalQ, cards: totalC, score: avg, streak: 1 });
        };
        load();
    }
  }, [user]);

  const StatCard = ({ icon: Icon, label, value, color, unit }: any) => (
      <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 flex items-center gap-6 shadow-sm">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
              <Icon size={32} strokeWidth={2.5} />
          </div>
          <div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{label}</p>
              <p className="text-4xl font-black text-slate-900">
                  {value} <span className="text-lg text-slate-400 font-bold">{unit}</span>
              </p>
          </div>
      </div>
  );

  return (
    <div className="pb-20">
        <h1 className="text-4xl font-black text-slate-900 mb-10">Statistiques</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-slate-200">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Votre Progression</h2>
                    <p className="text-slate-400 font-medium">Vous êtes sur une bonne lancée ! Continuez comme ça.</p>
                </div>
                <div className="flex items-center gap-4 bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
                    <Flame size={32} className="text-orange-500 fill-orange-500 animate-pulse" />
                    <div>
                        <div className="text-xs font-bold text-slate-300 uppercase">Série</div>
                        <div className="text-2xl font-black">{stats.streak} Jours</div>
                    </div>
                </div>
            </div>

            <StatCard icon={Target} label="Score Moyen" value={stats.score} unit="%" color="bg-green-100 text-green-600" />
            <StatCard icon={BookOpen} label="Quiz Terminés" value={stats.quizzes} unit="" color="bg-blue-100 text-blue-600" />
            <StatCard icon={Layers} label="Cartes Créées" value={stats.cards} unit="" color="bg-purple-100 text-purple-600" />
            <StatCard icon={Award} label="Niveau" value="3" unit="" color="bg-yellow-100 text-yellow-600" />
        </div>
    </div>
  );
}