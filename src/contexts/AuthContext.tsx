import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  city?:string;
  user_type: 'customer' | 'vendor' | 'admin';
  created_at: string;
  updated_at: string;
}

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  cnpj?: string;
  logo_url?: string;
  address: string;
  city?:string;
  phone?: string;
  email?: string;
  status: string;
  delivery_fee: number;
  min_order_value: number;
  delivery_time_min: number;
  delivery_time_max: number;
  average_delivery_time: number;
  rating: number;
  is_open: boolean;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  delivery_boy_fee?: number;
}

interface AuthUser extends User {
  profile?: Profile;
  restaurant?: Restaurant;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  register: (userData: any) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile and restaurant data
  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        
        // If user is a vendor, fetch restaurant data
        if (profileData.user_type === 'vendor') {
          const { data: restaurantData } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle();
          
          if (restaurantData) {
            setRestaurant(restaurantData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to defer Supabase calls and prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRestaurant(null);
        }
        setIsLoading(false);
        
        // Handle redirects after auth state changes
        if (event === 'SIGNED_IN' && session?.user) {
          const currentPath = window.location.pathname;
          if (currentPath === '/login' || currentPath === '/register') {
            setTimeout(() => {
              window.location.href = '/';
            }, 100);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    user_type: 'customer' | 'vendor';
    address?: string;
    city?: string;
    restaurant?: {
      name: string;
      cnpj: string;
      description: string;
      address: string;
      city?: string;
      phone?: string;
    };
  }) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: userData.name,
            phone: userData.phone,
            user_type: userData.user_type,
            address: userData.address,
            city: userData.city,
            ...(userData.restaurant && { restaurantData: userData.restaurant })
          }
        }
      });

      // Vendor restaurants are now created via the handle_new_user trigger
      // This ensures RLS policies are properly handled

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    try {
      // Clear all auth state first
      setUser(null);
      setSession(null);
      setProfile(null);
      setRestaurant(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      
      // Force redirect to login after logout
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (!error && user) {
        await fetchUserData(user.id);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    restaurant,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};