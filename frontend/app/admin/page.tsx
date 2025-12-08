'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Loader2, Users, Activity, Clock, Star, TrendingUp, Calendar, Lock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
        fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
            headers: { 'user-email': user?.emailAddresses[0].emailAddress || '' }
        });
        if (res.ok) {
            const data = await res.json();
            setStats(data);
        } else {
            throw new Error("Accès refusé ou erreur serveur");
        }
    } catch (e: any) {
        console.error(e);
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  if (!isLoaded || loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

  if (error) return (
      <div className="h-screen flex flex-col items-center justify-center text-red-600 gap-4">
          <Lock size={48} />
          <h1 className="text-2xl font-bold">Accès Refusé</h1>
          <p>{error}</p>
      </div>
  );

  // Données factices pour le graphique (à connecter avec de vraies données historiques si dispo)
  const chartData = [
    { name: 'Lun', users: stats?.dau || 10 },
    { name: 'Mar', users: stats?.dau ? stats.dau + 5 : 15 },
    { name: 'Mer', users: stats?.dau ? stats.dau - 2 : 12 },
    { name: 'Jeu', users: stats?.dau ? stats.dau + 8 : 20 },
    { name: 'Ven', users: stats?.dau ? stats.dau + 3 : 18 },
    { name: 'Sam', users: stats?.dau ? stats.dau + 10 : 25 },
    { name: 'Dim', users: stats?.dau ? stats.dau + 15 : 30 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Tableau de Bord Admin</h1>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} label="Total Utilisateurs" value={stats?.total_users} color="bg-blue-500" />
            <StatCard icon={Activity} label="Actifs (24h)" value={stats?.dau} color="bg-green-500" />
            <StatCard icon={Calendar} label="Actifs (7j)" value={stats?.wau} color="bg-purple-500" />
            <StatCard icon={Clock} label="Temps Moyen" value={stats?.avg_session_time} color="bg-orange-500" />
        </div>

        {/* SECOND ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* Feature Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500" /> Fonctionnalité Favorite
                </h3>
                <div className="flex items-center justify-center h-32">
                    <span className="text-4xl font-black text-slate-900">{stats?.top_feature}</span>
                </div>
            </div>

            {/* Retention Card */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="text-red-500" /> Rétention J+1
                </h3>
                <div className="flex items-center justify-center h-32">
                    <span className="text-4xl font-black text-slate-900">{stats?.retention_j1}</span>
                </div>
            </div>
        </div>

        {/* CHART */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-bold mb-6">Activité Hebdomadaire (Simulation)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-900">{value ?? '-'}</p>
            </div>
        </div>
    );
}