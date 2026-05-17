import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, logAudit } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchNotifications(session.user.id);
      } else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchNotifications(session.user.id);
        if (event === 'SIGNED_IN') {
          logAudit(session.user.id, session.user.email, 'user_login', 'auth', session.user.id);
        }
      } else {
        setProfile(null);
        setNotifications([]);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function fetchNotifications(userId) {
    const { data } = await supabase.from('notifications')
      .select('*').eq('user_id', userId).eq('is_read', false)
      .order('created_at', { ascending: false }).limit(20);
    setNotifications(data || []);
  }

  async function signUp({ email, password, fullName, phone }) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone } }
    });
    return { data, error };
  }

  async function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    if (user) logAudit(user.id, profile?.full_name, 'user_logout', 'auth', user.id);
    await supabase.auth.signOut();
    setProfile(null);
    setNotifications([]);
  }

  async function resetPassword(email) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  }

  async function markNotificationRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  async function refreshProfile() {
    if (user) fetchProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading, notifications,
      signUp, signIn, signOut, resetPassword,
      markNotificationRead, refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
