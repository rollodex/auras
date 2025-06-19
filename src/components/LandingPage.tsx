import React from 'react';
import { Sparkles, Heart, MessageCircle, Brain, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, hasCompletedQuiz, hasCompletedProfile } = useAuth();

  const getStartLink = () => {
    if (!isAuthenticated) return '/auth';
    if (!hasCompletedQuiz) return '/quiz';
    if (!hasCompletedProfile) return '/profile-setup';
    return '/browse';
  };

  const getStartText = () => {
    if (!isAuthenticated) return 'Get Started';
    if (!hasCompletedQuiz) return 'Continue Quiz';
    if (!hasCompletedProfile) return 'Complete Profile';
    return 'Start Browsing';
  };

  return (
    <div className="min-h-screen bg-night-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-rizz-pink/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-aura-violet/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-vibe-blue/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-synthetic-radial opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-8 px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-synthetic-gradient rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-glow-white" />
              </div>
              <h1 className="text-2xl font-bold text-glow-white">Auras</h1>
            </div>
            {isAuthenticated && (
              <Link 
                to={getStartLink()}
                className="text-glow-white/80 hover:text-glow-white transition-colors text-sm font-medium"
              >
                Continue →
              </Link>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-glow-white mb-4 leading-tight">
              Find Your
              <span className="bg-synthetic-gradient bg-clip-text text-transparent">
                {' '}Perfect Vibe
              </span>
            </h2>
            <p className="text-xl text-glow-white/80 mb-8 max-w-md mx-auto leading-relaxed">
              Chat with AI versions of people's personalities before you match. 
              Discover deeper connections through authentic vibes.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6 mb-12">
            <div className="bg-glow-white/10 backdrop-blur-lg rounded-2xl p-6 border border-glow-white/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-synthetic-gradient rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-glow-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-glow-white mb-1">AI Personality Quiz</h3>
                  <p className="text-glow-white/70 text-sm">Take our fun quiz to create your unique digital aura</p>
                </div>
              </div>
            </div>

            <div className="bg-glow-white/10 backdrop-blur-lg rounded-2xl p-6 border border-glow-white/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-vibe-blue to-aura-violet rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-glow-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-glow-white mb-1">Chat with AI Personas</h3>
                  <p className="text-glow-white/70 text-sm">Test compatibility by chatting with their AI before matching</p>
                </div>
              </div>
            </div>

            <div className="bg-glow-white/10 backdrop-blur-lg rounded-2xl p-6 border border-glow-white/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-rizz-pink to-aura-violet rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-glow-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-glow-white mb-1">Meaningful Matches</h3>
                  <p className="text-glow-white/70 text-sm">Connect with people who truly vibe with your energy</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link 
              to={getStartLink()}
              className="inline-flex items-center space-x-2 bg-synthetic-gradient text-glow-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span>{getStartText()}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8">
          <div className="text-center">
            <p className="text-glow-white/60 text-sm">
              Ready to boost your Aura and Rizz? ✨
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}