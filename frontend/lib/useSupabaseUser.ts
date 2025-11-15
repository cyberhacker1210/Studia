import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export function useSupabaseUser() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      const syncUser = async () => {
        try {
          console.log('🔄 Synchronisation user:', user.id);

          // Vérifier si l'utilisateur existe déjà
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

          if (existingUser) {
            console.log('✅ User existe déjà, pas besoin de sync');
            return;
          }

          // Créer l'utilisateur s'il n'existe pas
          const { error } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress,
              created_at: new Date().toISOString()
            });

          if (error) {
            // Ignorer l'erreur de duplication (23505 = unique violation)
            if (error.code === '23505') {
              console.log('✅ User existe déjà (duplication détectée)');
              return;
            }

            console.error('⚠️ Erreur sync user (non-bloquante):', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
          } else {
            console.log('✅ User synchronisé dans Supabase');
          }
        } catch (err) {
          console.error('⚠️ Erreur complète (non-bloquante):', err);
        }
      };

      syncUser();
    }
  }, [isLoaded, user]);

  return { user, isLoaded };
}