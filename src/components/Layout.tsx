import React from 'react';
import { Heart, User, MessageCircle, Sparkles, LogOut } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isAuthenticated, hasCompletedProfile, logout } = useAuth();
  const isHomePage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';

  // Don't show navigation on landing page or auth page
  if (isHomePage || isAuthPage) {
    return <>{children}</>;
  }

  // Don't show bottom nav if user hasn't completed profile
  const showBottomNav = isAuthenticated && hasCompletedProfile;

  return (
    <div className="min-h-screen bg-night-black">
      <div className="max-w-md mx-auto bg-glow-white/5 backdrop-blur-lg min-h-screen border-x border-glow-white/10">
        {/* Top Header */}
        {isAuthenticated && (
          <div className="flex items-center justify-between p-4 border-b border-glow-white/20 bg-glow-white/5 backdrop-blur-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-synthetic-gradient rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-glow-white" />
              </div>
              <h1 className="text-xl font-bold text-glow-white">Auras</h1>
            </div>
            <button
              onClick={logout}
              className="text-glow-white/70 hover:text-glow-white transition-colors p-2"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}

        <main className={showBottomNav ? "pb-20" : ""}>
          {children}
        </main>
        
        {/* Bottom Navigation */}
        {showBottomNav && (
          <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-glow-white/10 backdrop-blur-lg border-t border-glow-white/20">
            <div className="flex justify-around py-2">
              <Link 
                to="/browse" 
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  location.pathname === '/browse' ? 'text-glow-white bg-glow-white/20' : 'text-glow-white/70'
                }`}
              >
                <Heart className="w-6 h-6 mb-1" />
                <span className="text-xs">Browse</span>
              </Link>
              <Link 
                to="/chats" 
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  location.pathname === '/chats' ? 'text-glow-white bg-glow-white/20' : 'text-glow-white/70'
                }`}
              >
                <MessageCircle className="w-6 h-6 mb-1" />
                <span className="text-xs">Chats</span>
              </Link>
              <Link 
                to="/profile" 
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  location.pathname === '/profile' ? 'text-glow-white bg-glow-white/20' : 'text-glow-white/70'
                }`}
              >
                <User className="w-6 h-6 mb-1" />
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}