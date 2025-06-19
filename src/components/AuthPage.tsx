import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
      navigate('/quiz');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
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

      <div className="relative z-10 min-h-screen flex flex-col justify-center p-6">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-synthetic-gradient rounded-full flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-glow-white" />
              </div>
              <h1 className="text-3xl font-bold text-glow-white">Auras</h1>
            </div>
            <p className="text-glow-white/80 text-lg">Find Your Perfect Vibe</p>
          </div>

          {/* Auth Form */}
          <div className="bg-glow-white/10 backdrop-blur-lg rounded-3xl p-8 border border-glow-white/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-glow-white mb-2">
                {isLogin ? 'Welcome Back' : 'Join Auras'}
              </h2>
              <p className="text-glow-white/70">
                {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-glow-white text-sm font-medium mb-2">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-glow-white/50" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-glow-white/10 border border-glow-white/20 rounded-xl pl-12 pr-4 py-3 text-glow-white placeholder-glow-white/50 focus:outline-none focus:ring-2 focus:ring-rizz-pink backdrop-blur-sm"
                      placeholder="Your name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-glow-white text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-glow-white/50" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-glow-white/10 border border-glow-white/20 rounded-xl pl-12 pr-4 py-3 text-glow-white placeholder-glow-white/50 focus:outline-none focus:ring-2 focus:ring-rizz-pink backdrop-blur-sm"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-glow-white text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-glow-white/50" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-glow-white/10 border border-glow-white/20 rounded-xl pl-12 pr-4 py-3 text-glow-white placeholder-glow-white/50 focus:outline-none focus:ring-2 focus:ring-rizz-pink backdrop-blur-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-synthetic-gradient text-glow-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-glow-white/30 border-t-glow-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-glow-white/70 hover:text-glow-white transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 bg-glow-white/5 backdrop-blur-lg rounded-2xl p-4 border border-glow-white/10">
            <p className="text-glow-white/60 text-sm text-center mb-2">Demo Credentials:</p>
            <p className="text-glow-white/80 text-xs text-center">
              Email: demo@auras.app • Password: demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}