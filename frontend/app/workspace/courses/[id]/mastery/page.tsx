'use client';

import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getCourseById } from '@/lib/courseService'; // Assure-toi que cette fonction existe
import { useState, useEffect } from 'react';
import MasteryFlow from '@/components/workspace/mastery/MasteryFlow';

export default function MasteryPage() {
    const { id } = useParams();
    const { user } = useUser();
    const [course, setCourse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && id) {
            getCourseById(Number(id), user.id)
                .then(data => {
                    if (data) {
                        setCourse(data);
                    } else {
                        setError("Cours introuvable.");
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError("Erreur lors du chargement du cours.");
                });
        }
    }, [user, id]);

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center text-red-500">
                {error}
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex h-screen items-center justify-center space-x-3">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                <span>Chargement du cours...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
            <MasteryFlow course={course} />
        </div>
    );
}