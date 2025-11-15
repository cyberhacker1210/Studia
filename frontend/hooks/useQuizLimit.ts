'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useQuizLimit() {
  const { user } = useUser();
  const [quizCount, setQuizCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchUsage() {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        if (userError?.code === 'PGRST116') {
          await supabase.from('users').insert({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            is_premium: false
          });

          await supabase.from('usage_stats').insert({
            user_id: user.id,
            quiz_count: 0
          });

          setIsPremium(false);
          setQuizCount(0);
        } else {
          setIsPremium(userData?.is_premium || false);

          const { data: usageData } = await supabase
            .from('usage_stats')
            .select('quiz_count')
            .eq('user_id', user.id)
            .single();

          setQuizCount(usageData?.quiz_count || 0);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [user]);

  const canGenerateQuiz = isPremium || quizCount < 5;
  const remaining = isPremium ? Infinity : Math.max(0, 5 - quizCount);

  const incrementQuizCount = async () => {
    if (!user || isPremium) return;

    const newCount = quizCount + 1;

    await supabase
      .from('usage_stats')
      .update({ quiz_count: newCount })
      .eq('user_id', user.id);

    setQuizCount(newCount);
  };

  const saveQuiz = async (quizData: any, score: number) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour sauvegarder');
    }

    try {
      const { error } = await supabase
        .from('quiz_history')
        .insert({
          user_id: user.id,
          quiz_data: quizData,
          score: score,
          total_questions: quizData.questions?.length || 0
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