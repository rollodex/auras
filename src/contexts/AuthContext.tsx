import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AuthUser, PersonalityProfile } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasCompletedQuiz: boolean;
  hasCompletedProfile: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserPersonality: (personality: PersonalityProfile) => void;
  updateUserProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    const storedPersonality = localStorage.getItem('userPersonality');
    const storedProfile = localStorage.getItem('userProfile');

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
      setHasCompletedQuiz(!!storedPersonality);
      setHasCompletedProfile(!!storedProfile);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login - in real app, this would call an API
    const userData: AuthUser = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      age: 25,
      gender: 'non-binary',
      bio: '',
      interests: [],
      personality: {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
        summary: '',
        aiPersona: '',
        detailedPrompt: ''
      },
      photos: [],
      auraColor: 'from-purple-400 to-pink-500'
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const signup = async (email: string, password: string, name: string) => {
    // Simulate signup - in real app, this would call an API
    const userData: AuthUser = {
      id: Date.now().toString(),
      email,
      name,
      age: 25,
      gender: 'non-binary',
      bio: '',
      interests: [],
      personality: {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0,
        summary: '',
        aiPersona: '',
        detailedPrompt: ''
      },
      photos: [],
      auraColor: 'from-purple-400 to-pink-500'
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPersonality');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userMatches');
    localStorage.removeItem('userChats');
    setUser(null);
    setIsAuthenticated(false);
    setHasCompletedQuiz(false);
    setHasCompletedProfile(false);
  };

  const updateUserPersonality = (personality: PersonalityProfile) => {
    if (user) {
      const updatedUser = { ...user, personality };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('userPersonality', JSON.stringify(personality));
      setHasCompletedQuiz(true);
    }
  };

  const updateUserProfile = (profile: any) => {
    if (user) {
      const updatedUser = { ...user, ...profile };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setHasCompletedProfile(true);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      hasCompletedQuiz,
      hasCompletedProfile,
      login,
      signup,
      logout,
      updateUserPersonality,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}