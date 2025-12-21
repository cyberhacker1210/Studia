'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById } from '@/lib/courseService';
import PracticeInterface from '@/components/workspace/PracticeInterface';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function PracticePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [exercise, setExercise] = useState<any>(null);
  const [courseText, setCourseText] = useState("");

  useEffect(() => {
    if (user && id) {
        getCourseById(Number(id), user.id).then(async (course) => {
            setCourseText(course.extracted_text);
            try {
                // Appel API pour générer un exercice "Difficile" par défaut
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/path/practice`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ course_text: course.extracted_text, difficulty: "hard" })
                });
                const data = await res.json();
                setExercise(data);
            } catch(e) {
                console.error(e);
            }
        });
    }
  }, [user, id]);

  if (!exercise) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 h-12 w-12"/></div>;

  return (
      <div className="h-screen flex flex-col bg-slate-50">
          <div className="px-6 py-4 bg-white border-b border-slate-200">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
                  <ArrowLeft size={18}/> Quitter l'exercice
              </button>
          </div>
          <div className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-hidden">
              <PracticeInterface
                  exercise={exercise}
                  courseText={courseText}
                  onComplete={() => router.back()}
              />
          </div>
      </div>
  );
}