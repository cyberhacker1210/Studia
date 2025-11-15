'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useQuizLimit() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded]);

  // 🔓 MODE GRATUIT ILLIMITÉ
  const canGenerateQuiz = true;
  const remaining = Infinity;
  const quizCount = 0;
  const isPremium = false;

  const incrementQuizCount = async () => {
    return;
  };

  const saveQuiz = async (quizData: any, score: number) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour sauvegarder');
    }

    try {
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (userCheckError?.code === 'PGRST116' || !existingUser) {
        await supabase.from('users').insert({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          created_at: new Date().toISOString()
        });
      }

      const { error } = await supabase
        .from('quiz_history')
        .insert({
          user_id: user.id,
          quiz_data: quizData,
          score: score,
          total_questions: quizData.questions?.length || 0,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      console.log('✅ Quiz saved to history');
      return true;
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw error;
    }
  };

  return {
    quizCount,
    isPremium,
    canGenerateQuiz,
    remaining,
    loading,
    incrementQuizCount,
    saveQuiz
  };
}