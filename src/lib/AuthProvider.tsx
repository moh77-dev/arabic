import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/stores/useUserStore';

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setSessionStore = useUserStore((s) => s.setSession);
  const clearSession = useUserStore((s) => s.clearSession);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
      if (data.session?.user) {
        setSessionStore({ userId: data.session.user.id, email: data.session.user.email ?? null });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setSessionStore({ userId: newSession.user.id, email: newSession.user.email ?? null });
      } else {
        clearSession();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [setSessionStore, clearSession]);

  return <AuthContext.Provider value={{ session, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
