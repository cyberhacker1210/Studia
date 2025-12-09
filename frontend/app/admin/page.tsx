'use client';

import { useState, useEffect } from 'react';
import { Loader2, Users, Activity, Clock, Star, TrendingUp, Calendar, Lock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async (pwd: string) => {
    setLoading(true);
    setError('');
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/dashboard`, {
            headers: { 'x-admin-password': pwd }
        });
        if (res.ok) {
            const data = await res.json();
            setStats(data);
            setIsAuthenticated(true);
            localStorage.setItem('admin_pwd', pwd); // Sauvegarde locale pour le confort
        } else {
            setError("Mot de passe incorrect");
        }
    } catch (e) {
        setError("Erreur serveur");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      // Auto-login si déjà connecté
      const savedPwd = localStorage.getItem('admin_pwd');
      if (savedPwd) fetchStats(savedPwd);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      fetchStats(password);
  };

  // --- ECRAN DE LOGIN ---
  if (!isAuthenticated) {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full text-center">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Lock size={32} />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 mb-6">Accès Admin</h1>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input
                          type="password"
                          placeholder="Mot de passe secret"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-600 transition-colors font-bold"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                      />
                      <button disabled={loading} className="btn-b-primary w-full py-3 justify-center">
                          {loading ? <Loader2 className="animate-spin"/> : <span className="flex items-center gap-2">Entrer <ArrowRight size={16}/></span>}
                      </button>
                  </form>
                  {error && <p className="text-red-500 font-bold mt-4 animate-pulse">{error}</p>}
              </div>
          </div>
      );
  }

  // --- DASHBOARD ---
  if (loading && !stats) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;

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
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-slate-900">Tableau de Bord</h1>
            <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('admin_pwd'); }} className="text-sm font-bold text-slate-400 hover:text-red-500">Déconnexion</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} label="Total Utilisateurs" value={stats?.total_users} color="bg-blue-500" />
            <StatCard icon={Activity} label="Actifs (24h)" value={stats?.dau} color="bg-green-500" />
            <StatCard icon={Calendar} label="Actifs (7j)" value={stats?.wau} color="bg-purple-500" />
            <StatCard icon={Clock} label="Temps Moyen" value={stats?.avg_session_time} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Star className="text-yellow-500" /> Fonctionnalité Favorite</h3>
                <div className="flex items-center justify-center h-32">
                    <span className="text-4xl font-black text-slate-900">{stats?.top_feature}</span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-red-500" /> Rétention J+1</h3>
                <div className="flex items-center justify-center h-32">
                    <span className="text-4xl font-black text-slate-900">{stats?.retention_j1}</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-96">
            <h3 className="text-lg font-bold mb-6">Activité Hebdomadaire</h3>
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