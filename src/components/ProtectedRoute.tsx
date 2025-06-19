import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresQuiz?: boolean;
  requiresProfile?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiresQuiz = false, 
  requiresProfile = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, hasCompletedQuiz, hasCompletedProfile } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiresProfile && !hasCompletedProfile) {
    return <Navigate to="/profile-setup" replace />;
  }

  if (requiresQuiz && !hasCompletedQuiz) {
    return <Navigate to="/quiz" replace />;
  }

  return <>{children}</>;
}