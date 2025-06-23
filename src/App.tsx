import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import PersonalityQuiz from './components/PersonalityQuiz';
import ProfileSetup from './components/ProfileSetup';
import BrowseProfiles from './components/BrowseProfiles';
import AIChat from './components/AIChat';
import Chats from './components/Chats';
import MatchRequests from './components/MatchRequests';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/quiz" 
              element={
                <ProtectedRoute>
                  <PersonalityQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile-setup" 
              element={
                <ProtectedRoute requiresQuiz>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/browse" 
              element={
                <ProtectedRoute requiresQuiz requiresProfile>
                  <BrowseProfiles />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute requiresQuiz requiresProfile>
                  <AIChat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chats" 
              element={
                <ProtectedRoute requiresQuiz requiresProfile>
                  <Chats />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/match-requests" 
              element={
                <ProtectedRoute requiresQuiz requiresProfile>
                  <MatchRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute requiresQuiz requiresProfile>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            {/* Legacy route redirect */}
            <Route path="/matches" element={<Navigate to="/chats" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;