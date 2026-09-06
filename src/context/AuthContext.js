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
        const fetchedProfile = await fetchProfile(session.user.id);
        
        // Handle pending OAuth registration
        if (fetchedProfile && fetchedProfile.role === 'pending') {
          const pendingReg = localStorage.getItem('pendingOAuthRegistration');
          if (pendingReg) {
            try {
              const regData = JSON.parse(pendingReg);
              const { role, fullName, founderName } = regData;
              
              // Update profile role
              await supabase
                .from('profiles')
                .update({ role, full_name: fullName || founderName || fetchedProfile.full_name })
                .eq('id', session.user.id);
              
              // Insert into mentor/startup table
              if (role === 'mentor') {
                await supabase.from('mentors').insert({
                  id: session.user.id
                });
              } else if (role === 'startup') {
                await supabase.from('startups').insert({
                  id: session.user.id,
                  founder_name: founderName || ''
                });
              }
              
              localStorage.removeItem('pendingOAuthRegistration');
              await fetchProfile(session.user.id); // Re-fetch updated profile
            } catch (err) {
              console.error('Failed to resolve pending OAuth registration', err);
            }
          }
        }
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

      if (error) {
        // If profile doesn't exist, try to create it manually
        if (error.code === 'PGRST116') {
           const { data: { user } } = await supabase.auth.getUser();
           if (user) {
             const newProfile = {
               id: userId,
               email: user.email,
               full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
               role: user.user_metadata?.role || 'pending'
             };
             const { data: insertedData, error: insertError } = await supabase
               .from('profiles')
               .insert(newProfile)
               .select()
               .single();
             
             if (!insertError && insertedData) {
               setProfile(insertedData);
               return insertedData;
             }
           }
        }
        throw error;
      }
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  const signUp = async (email, password, role, additionalData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          ...additionalData
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const signInWithOAuth = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    if (error) throw error;
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
      signInWithOAuth,
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
