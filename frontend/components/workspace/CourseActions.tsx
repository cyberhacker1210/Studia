'use client';

import { useRouter } from 'next/navigation';
import { FileQuestion, Layers, Plus } from 'lucide-react';

interface CourseActionsProps {
  courseId: number;
  quizCount: number;
  flashcardCount: number;
}

export default function CourseActions({ courseId, quizCount, flashcardCount }: CourseActionsProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        🎯 Générer depuis ce cours :
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Quiz */}
        <button
          onClick={() => router.push(`/workspace/courses/${courseId}/generate-quiz`)}
          className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 transition-all transform hover:scale-105"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileQuestion size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-lg font-bold text-gray-900 mb-1 flex items-center space-x-2">
                <span>Quiz</span>
                {quizCount > 0 && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {quizCount}
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Questions à choix multiples
              </p>
              <div className="flex items-center text-blue-600 text-sm font-semibold">
                <Plus size={16} className="mr-1" />
                <span>Créer un quiz</span>
              </div>
            </div>
          </div>
        </button>

        {/* Flashcards */}
        <button
          onClick={() => router.push(`/workspace/courses/${courseId}/generate-flashcards`)}
          className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 hover:border-purple-400 rounded-xl p-6 transition-all transform hover:scale-105"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Layers size={24} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <h4 className="text-lg font-bold text-gray-900 mb-1 flex items-center space-x-2">
                <span>Flashcards</span>
                {flashcardCount > 0 && (
                  <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                    {flashcardCount}
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Cartes de révision
              </p>
              <div className="flex items-center text-purple-600 text-sm font-semibold">
                <Plus size={16} className="mr-1" />
                <span>Créer des flashcards</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}