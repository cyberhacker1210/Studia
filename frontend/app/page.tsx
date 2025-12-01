'use client';

import Link from 'next/link';
import { Brain, ArrowRight, Zap, Layers, Sparkles, Check, GraduationCap, Camera, Smartphone } from 'lucide-react';
import LandingNavbar from '@/components/LandingNavbar';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function ReferralCapture() {
    const searchParams = useSearchParams();
    useEffect(() => {
        const refId = searchParams.get('ref');
        if (refId) localStorage.setItem('studia_referrer_id', refId);
    }, [searchParams]);
    return null;
}

export default function LandingPage() {
    return (
        // overflow-x-hidden est CRUCIAL pour éviter le scroll horizontal sur mobile à cause des animations
        <main className="min-h-screen flex flex-col font-sans bg-white text-slate-900 selection:bg-brand-500 selection:text-white overflow-x-hidden">

            <Suspense fallback={null}><ReferralCapture /></Suspense>

            {/* NAVBAR */}
            <LandingNavbar />

            {/* HERO SECTION */}
            <section className="pt-32 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 relative">
                {/* Fond flou ajusté pour mobile */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[800px] bg-brand-50 rounded-full blur-3xl -z-10 opacity-50"></div>

                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white border-2 border-brand-100 text-brand-600 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 sm:mb-8 shadow-sm animate-fade-in">
                        <Sparkles size={12} fill="currentColor" /> L'IA pour tes études
                    </div>

                    {/* Titre responsive */}
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 mb-6 sm:mb-8 leading-[1.1] tracking-tight animate-slide-up">
                        Arrêtez de réviser.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-brand">Maîtrisez.</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-slate-500 font-medium mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up px-2" style={{ animationDelay: '0.1s' }}>
                        Transformez vos cours en <span className="text-slate-900 font-bold">Quiz</span> et <span className="text-slate-900 font-bold">Flashcards</span> en une seconde grâce à l'IA.
                    </p>

                    {/* Boutons empilés sur mobile, côte à côte sur desktop */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 sm:mb-20 animate-slide-up px-4" style={{ animationDelay: '0.2s' }}>
                        <Link href="/sign-up" className="group w-full sm:w-auto bg-gradient-brand text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-brand-200 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                            Essayer Gratuitement <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="#demo" className="w-full sm:w-auto bg-white text-slate-600 border-2 border-slate-200 text-lg font-bold px-8 py-4 rounded-2xl hover:border-slate-400 hover:text-slate-900 transition-all flex items-center justify-center">
                            Voir la démo
                        </Link>
                    </div>

                    {/* VISUAL HERO - ASTUCE RESPONSIVE : SCALE */}
                    {/* On réduit l'échelle sur mobile (scale-[0.55]) pour que tout rentre sans casser */}
                    <div className="relative max-w-4xl mx-auto h-[280px] sm:h-[400px] md:h-[500px] overflow-visible">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-2xl transform scale-[0.55] sm:scale-[0.8] md:scale-100 origin-top transition-transform duration-500">
                            {/* Carte Centrale */}
                            <div className="bg-white border-4 border-slate-100 rounded-[3rem] shadow-2xl p-8 z-20 animate-float relative">
                                <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="text-xs font-bold text-slate-300 uppercase">Studia AI v2.0</div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
                                    <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                                    <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                                    <div className="mt-8 grid grid-cols-2 gap-4">
                                        <div className="h-32 bg-brand-50 rounded-2xl border-2 border-brand-100 flex flex-col items-center justify-center text-brand-600">
                                            <Brain size={32} className="mb-2" />
                                            <span className="font-bold text-sm">Quiz Généré</span>
                                        </div>
                                        <div className="h-32 bg-accent-purple/10 rounded-2xl border-2 border-accent-purple/20 flex flex-col items-center justify-center text-accent-purple">
                                            <Layers size={32} className="mb-2" />
                                            <span className="font-bold text-sm">Flashcards</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements (Attachés au scale) */}
                                <div className="absolute top-20 -left-4 sm:-left-16 bg-white p-4 rounded-2xl shadow-xl border-2 border-slate-100 z-30 animate-bounce-slow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check size={20} strokeWidth={4} /></div>
                                        <div className="text-left">
                                            <div className="font-black text-slate-900">98%</div>
                                            <div className="text-xs text-slate-500 font-bold">Précision</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute bottom-20 -right-4 sm:-right-10 bg-slate-900 p-4 rounded-2xl shadow-xl z-30 animate-pulse-slow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900"><Zap size={20} fill="currentColor" /></div>
                                        <div className="text-white text-left">
                                            <div className="font-black">+50 XP</div>
                                            <div className="text-xs text-slate-400 font-bold">Gagnés</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENTO GRID FEATURES */}
            <section id="demo" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">Votre cerveau, version 2.0</h2>
                        <p className="text-lg text-slate-500">Trois outils puissants pour hacker vos examens.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

                        {/* Feature 1 */}
                        <div className="md:col-span-2 bg-white rounded-[2rem] p-6 sm:p-10 border-2 border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-blue-50 rounded-full -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-blue-200">
                                    <Camera size={24} />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 sm:mb-3">Scanner de Cours</h3>
                                <p className="text-slate-500 font-medium max-w-md text-sm sm:text-base">
                                    Prenez une photo. Notre IA lit le texte, comprend la structure et génère instantanément du contenu interactif.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-900 text-white rounded-[2rem] p-6 sm:p-10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-400 text-slate-900 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                                    <Brain size={24} />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-extrabold mb-2 sm:mb-3">Quiz IA</h3>
                                <p className="text-slate-400 font-medium text-sm sm:text-base">
                                    Vérifiez si vous avez vraiment compris.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-purple-50 border-2 border-purple-100 rounded-[2rem] p-6 sm:p-10">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                                <Smartphone size={24} />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-purple-900 mb-2 sm:mb-3">Mobile First</h3>
                            <p className="text-purple-700/70 font-medium text-sm sm:text-base">
                                Réviser dans le bus ? Facile.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="md:col-span-2 bg-white rounded-[2rem] p-6 sm:p-10 border-2 border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-green-50 rounded-full -ml-10 -mb-10"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-green-200">
                                    <Layers size={24} />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 sm:mb-3">Répétition Espacée</h3>
                                <p className="text-slate-500 font-medium max-w-md text-sm sm:text-base">
                                    L'algorithme vous montre les flashcards au moment exact où vous alliez les oublier.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-16 sm:py-24 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-20 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/30 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
                            Prêt à hacker votre année ?
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            C'est gratuit pour commencer. Pas de carte bancaire.
                        </p>
                        <Link href="/sign-up" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-slate-900 text-lg sm:text-xl font-bold px-8 py-4 sm:px-12 sm:py-5 rounded-2xl hover:scale-105 transition-transform shadow-xl">
                            Lancer Studia <ArrowRight size={24} />
                        </Link>
                        <p className="mt-6 text-sm text-slate-500 font-bold flex items-center justify-center gap-1">
                            <Check size={14} className="inline" /> 5 éclairs offerts chaque jour
                        </p>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 bg-white border-t border-slate-100 text-center px-4">
                <div className="flex items-center justify-center gap-2 font-bold text-xl text-slate-900 mb-4">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Brain size={16} /></div>
                    Studia.
                </div>
                <p className="text-slate-400 text-sm">© 2024 Studia Education.</p>
            </footer>
        </main>
    );
}