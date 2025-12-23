'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById } from '@/lib/courseService';
import { Loader2, ArrowLeft, FileText, Lightbulb, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function SummaryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
      console.log("🔍 useEffect déclenché", { user: !!user, id, hasLoaded });
    if (user && id && !hasLoaded) {
        console.log("✅ Condition passée, fetch lancé !");
        setHasLoaded(true);
        getCourseById(Number(id), user.id).then(async (course) => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/path/summary`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_text: course.extracted_text, subject: course.subject })
                });
                const data = await res.json();
                setSummary(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        });
    }else{
        console.log("❌ Condition bloquée");
        }
  }, [user, id, hasLoaded]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-12 w-12"/></div>;
  if (!summary) return <div className="p-10 text-center font-bold text-slate-500">Impossible de générer la fiche.</div>;

  return (
      <div className="max-w-3xl mx-auto py-10 px-6 min-h-screen">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-900 transition-colors"><ArrowLeft size={18}/> Retour</button>

          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-xl">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center"><FileText size={32}/></div>
                  <div>
                      <h1 className="text-3xl font-black text-slate-900 leading-tight">{summary.title || "Fiche sans titre"}</h1>
                      <p className="text-slate-500 font-medium uppercase tracking-wider text-xs mt-1">Fiche de Révision 20/20</p>
                  </div>
              </div>

              {/* DEFINITIONS (Sécurisé) */}
              {summary.key_definitions && summary.key_definitions.length > 0 && (
                  <div className="mb-10">
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2"><GraduationCap size={24} className="text-purple-600"/> Définitions Clés</h3>
                      <div className="grid gap-4">
                          {summary.key_definitions.map((def: any, i: number) => (
                              <div key={i} className="bg-slate-50 p-5 rounded-2xl border-l-4 border-blue-500 shadow-sm">
                                  <span className="font-bold text-slate-900 block mb-1">{def.term} : </span>
                                  <span className="text-slate-600 leading-relaxed text-sm">{def.definition}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {/* CONTENU PRINCIPAL */}
              <div className="prose prose-slate max-w-none mb-10 prose-headings:font-black prose-p:text-slate-600">
                  <ReactMarkdown>{summary.core_concepts || "Contenu vide."}</ReactMarkdown>
              </div>

              {/* CONSEILS (Sécurisé) */}
              {summary.exam_tips && summary.exam_tips.length > 0 && (
                  <div className="bg-yellow-50 p-8 rounded-[2rem] border-2 border-yellow-100">
                      <h3 className="font-black text-yellow-800 mb-4 flex items-center gap-2"><Lightbulb size={24}/> Conseils Exam</h3>
                      <ul className="list-disc pl-5 space-y-2 text-yellow-900 font-medium">
                          {summary.exam_tips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                      </ul>
                  </div>
              )}
          </div>
      </div>
  );
}