'use client';

import { useState, useEffect } from 'react';
import { Loader2, Users, Activity, Clock, Lock, ArrowRight, User, Eye, History } from 'lucide-react';
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
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': pwd.trim()
            }
        });

        if (res.ok) {
            const data = await res.json();
            setStats(data);
            setIsAuthenticated(true);
            localStorage.setItem('admin_pwd', pwd);
        } else {
            setError("Mot de passe incorrect");
            localStorage.removeItem('admin_pwd');
        }
    } catch (e) {
        setError("Erreur serveur");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      const savedPwd = localStorage.getItem('admin_pwd');
      if (savedPwd) fetchStats(savedPwd);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      fetchStats(password);
  };

  if (!isAuthenticated) {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full text-center">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Lock size={32} />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 mb-6">Admin Studia</h1>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input
                          type="password"
                          placeholder="Mot de passe"
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 outline-none focus:border-blue-600 font-bold"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                      />
                      <button disabled={loading} className="btn-b-primary w-full py-3 justify-center">
                          {loading ? <Loader2 className="animate-spin"/> : <span className="flex items-center gap-2">Entrer <ArrowRight size={16}/></span>}
                      </button>
                  </form>
                  {error && <p className="text-red-500 font-bold mt-4">{error}</p>}
              </div>
          </div>
      );
  }

  if (loading && !stats) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-12 w-12"/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-20">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900">Vue d'Ensemble</h1>
                <p className="text-slate-500 font-medium">Activité en temps réel</p>
            </div>
            <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('admin_pwd'); }} className="text-sm font-bold text-slate-400 hover:text-red-500">Déconnexion</button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Utilisateurs" value={stats?.total_users} color="bg-blue-500" />
            <StatCard icon={Activity} label="Actifs (24h)" value={stats?.dau} color="bg-green-500" />
            <StatCard icon={Clock} label="Temps Moyen" value={stats?.avg_session_time} color="bg-orange-500" />
            <StatCard icon={History} label="Événements" value={stats?.recent_activity?.length} color="bg-purple-500" />
        </div>

        {/* JOURNAL D'ACTIVITÉ (C'est ça que tu voulais !) */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="text-blue-600"/> Journal d'Activité (Derniers 50)
                </h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                            <th className="p-4">Heure</th>
                            <th className="p-4">Utilisateur</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Détails</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {stats?.recent_activity?.map((log: any) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-slate-400 font-mono text-xs">
                                    {new Date(log.time).toLocaleTimeString()} <br/>
                                    {new Date(log.time).toLocaleDateString()}
                                </td>
                                <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
                                        <User size={12}/>
                                    </div>
                                    {log.user}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        log.action.includes('Quiz') ? 'bg-green-100 text-green-700' :
                                        log.action.includes('Capture') ? 'bg-blue-100 text-blue-700' :
                                        log.action.includes('Flashcards') ? 'bg-purple-100 text-purple-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-500 font-mono text-xs truncate max-w-xs">
                                    {log.details}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-slate-900">{value ?? '-'}</p>
            </div>
        </div>
    );
}