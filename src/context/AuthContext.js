'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const signUp = async (email, password, role, additionalData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          role,
          full_name: additionalData.full_name || '',
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      if (role === 'mentor') {
        const { error: mentorError } = await supabase
          .from('mentors')
          .insert({
            id: data.user.id,
            firm: additionalData.firm || '',
            role_type: additionalData.role_type || '',
            expertise: additionalData.expertise || [],
            bio: additionalData.bio || '',
            linkedin_url: additionalData.linkedin_url || '',
            calendly_link: additionalData.calendly_link || '',
            max_startups: additionalData.max_startups || 4,
          });
        if (mentorError) throw mentorError;
      }

      if (role === 'startup') {
        const { error: startupError } = await supabase
          .from('startups')
          .insert({
            id: data.user.id,
            startup_name: additionalData.startup_name || '',
            founder_name: additionalData.founder_name || '',
            sector: additionalData.sector || '',
            stage: additionalData.stage || '',
            team_size: additionalData.team_size || '',
            pitch_deck_url: additionalData.pitch_deck_url || '',
            description: additionalData.description || '',
          });
        if (startupError) throw startupError;
      }
    }

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile: () => user && fetchProfile(user.id),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
