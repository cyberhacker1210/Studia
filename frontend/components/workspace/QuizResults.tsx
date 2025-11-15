'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Quiz } from '@/lib/api';
import { CheckCircle, XCircle, Save, Check, ArrowLeft } from 'lucide-react';

interface QuizResultsProps {
  quiz: Quiz;
  userAnswers: number[];
  onRetake: () => void;
  onNewQuiz: () => void;
}

export default function QuizResults({ quiz, userAnswers, onRetake, onNewQuiz }: QuizResultsProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const score = userAnswers.reduce((acc, answer, index) => {
    return answer === quiz.questions[index].correctAnswer ? acc + 1 : acc;
  }, 0);

  const percentage = Math.round((score / quiz.questions.length) * 100);

  const handleSave = async () => {
    console.log('🔵 === DÉBUT SAUVEGARDE ===');

    if (!isLoaded) {
      console.log('⏳ Chargement en cours...');
      alert('Chargement en cours...');
      return;
    }

    if (!user) {
      console.log('❌ Pas de user connecté');
      alert('Vous devez être connecté pour sauvegarder');
      return;
    }

    console.log('👤 User connecté:', {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress
    });

    setSaving(true);

    try {
      // Vérifier que l'user existe dans Supabase
      console.log('🔍 Vérification user dans Supabase...');

      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userCheckError && userCheckError.code !== 'PGRST116') {
        console.error('❌ Erreur vérification user:', userCheckError);
        throw userCheckError;
      }

      // Si l'user n'existe pas, le créer
      if (!existingUser) {
        console.log('➕ Création user dans Supabase...');

        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            created_at: new Date().toISOString()
          });

        if (createUserError) {
          console.error('❌ Erreur création user:', createUserError);
          throw createUserError;
        }

        console.log('✅ User créé');
      } else {
        console.log('✅ User existe déjà');
      }

      // Sauvegarder le quiz
      console.log('💾 Sauvegarde du quiz...');
      console.log('📊 Données:', {
        user_id: user.id,
        score: score,
        total_questions: quiz.questions.length
      });

      const { data, error } = await supabase
        .from('quiz_history')
        .insert({
          user_id: user.id,
          quiz_data: quiz,
          score: score,
          total_questions: quiz.questions.length,
          created_at: new Date().toISOString()
        })
        .select();

      console.log('📡 Réponse Supabase:', { data, error });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        throw error;
      }

      console.log('✅ Quiz sauvegardé avec succès!', data);
      setIsSaved(true);

    } catch (error: any) {
      console.error('❌ ERREUR COMPLÈTE:', error);

      let errorMessage = 'Erreur lors de la sauvegarde';

      if (error.message) {
        errorMessage = error.message;
      }

      if (error.code === '23503') {
        errorMessage = 'Erreur de synchronisation utilisateur. Veuillez rafraîchir la page.';
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
      console.log('🔵 === FIN SAUVEGARDE ===');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Score Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Résultats du Quiz
        </h2>

        <div className="mb-6">
          <div className="text-6xl font-bold mb-2">
            <span className={percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-orange-600' : 'text-red-600'}>
              {percentage}%
            </span>
          </div>
          <p className="text-xl text-gray-600">
            {score} / {quiz.questions.length} bonnes réponses
          </p>
        </div>

        {/* Message selon score */}
        <div className="mb-6">
          {percentage >= 90 && <p className="text-lg text-green-600 font-semibold">🎉 Excellent!</p>}
          {percentage >= 70 && percentage < 90 && <p className="text-lg text-blue-600 font-semibold">👍 Bon travail!</p>}
          {percentage >= 50 && percentage < 70 && <p className="text-lg text-orange-600 font-semibold">💪 Pas mal!</p>}
          {percentage < 50 && <p className="text-lg text-red-600 font-semibold">📚 Révisez encore!</p>}
        </div>

        {/* Boutons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSave}
            disabled={isSaved || saving || !isLoaded}
            className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              isSaved
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : saving || !isLoaded
                ? 'bg-gray-100 text-gray-500 cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isSaved ? (
              <>
                <Check size={20} />
                <span>Sauvegardé ✓</span>
              </>
            ) : saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                <span>Sauvegarde...</span>
              </>
            ) : !isLoaded ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Sauvegarder</span>
              </>
            )}
          </button>

          <button
            onClick={onRetake}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            🔄 Refaire
          </button>

          <button
            onClick={onNewQuiz}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            ✨ Nouveau Quiz
          </button>

          <button
            onClick={() => router.push('/workspace/quiz')}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Retour au Hub</span>
          </button>
        </div>

        {isSaved && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl animate-pulse">
            <p className="text-sm text-green-700 font-semibold flex items-center justify-center space-x-2">
              <Check size={18} />
              <span>✅ Quiz sauvegardé dans votre historique!</span>
            </p>
          </div>
        )}
      </div>

      {/* Détails des réponses */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-3">📋</span>
          Détails des Réponses
        </h3>

        <div className="space-y-6">
          {quiz.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;

            return (
              <div
                key={question.id}
                className={`p-6 rounded-xl border-2 transition-all ${
                  isCorrect 
                    ? 'bg-green-50 border-green-200 hover:shadow-lg' 
                    : 'bg-red-50 border-red-200 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {isCorrect ? (
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
                  ) : (
                    <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                  )}

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                      Question {index + 1}: {question.question}
                    </h4>

                    <div className="space-y-2 mb-4">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = userAnswer === optIndex;
                        const isCorrectOption = question.correctAnswer === optIndex;

                        return (
                          <div
                            key={optIndex}
                            className={`p-4 rounded-lg transition-all ${
                              isCorrectOption
                                ? 'bg-green-100 border-2 border-green-500 font-semibold shadow-md'
                                : isUserAnswer
                                ? 'bg-red-100 border-2 border-red-500 font-semibold'
                                : 'bg-white border-2 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {isCorrectOption && (
                                <span className="text-green-600 font-bold text-lg">✓ Bonne réponse</span>
                              )}
                              {isUserAnswer && !isCorrectOption && (
                                <span className="text-red-600 font-bold text-lg">✗ Votre réponse</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <p className="text-sm text-blue-900">
                          <strong className="flex items-center space-x-2 mb-2">
                            <span>💡</span>
                            <span>Explication:</span>
                          </strong>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold mb-2">{score}</p>
            <p className="text-blue-100">Bonnes Réponses</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">{quiz.questions.length - score}</p>
            <p className="text-blue-100">Erreurs</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">{percentage}%</p>
            <p className="text-blue-100">Score Final</p>
          </div>
        </div>
      </div>
    </div>
  );
}