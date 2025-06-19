import React, { useState, useEffect } from 'react';
import { Edit3, Settings, Sparkles, Brain, Heart, User } from 'lucide-react';
import { PersonalityProfile } from '../types';

export default function Profile() {
  const [personality, setPersonality] = useState<PersonalityProfile | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const storedPersonality = localStorage.getItem('userPersonality');
    const storedProfile = localStorage.getItem('userProfile');
    
    if (storedPersonality) {
      setPersonality(JSON.parse(storedPersonality));
    }
    
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, []);

  const getTraitDescription = (trait: string, value: number) => {
    const descriptions = {
      openness: value > 70 ? 'Very Creative & Open' : value > 40 ? 'Moderately Open' : 'Prefers Routine',
      conscientiousness: value > 70 ? 'Very Organized' : value > 40 ? 'Moderately Planned' : 'Spontaneous',
      extraversion: value > 70 ? 'Very Outgoing' : value > 40 ? 'Ambivert' : 'Introverted',
      agreeableness: value > 70 ? 'Very Empathetic' : value > 40 ? 'Balanced' : 'Direct',
      neuroticism: value > 70 ? 'Emotionally Stable' : value > 40 ? 'Moderately Calm' : 'Sensitive'
    };
    return descriptions[trait as keyof typeof descriptions] || '';
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

      <div className="relative z-10 max-w-md mx-auto pt-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-synthetic-gradient rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-glow-white" />
            </div>
            <h1 className="text-xl font-bold text-glow-white">Your Aura</h1>
          </div>
          <button className="text-glow-white/70 hover:text-glow-white transition-colors p-2 rounded-full hover:bg-glow-white/10 backdrop-blur-sm">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Card - Vibe Blue */}
        <div className="bg-gradient-to-br from-vibe-blue/20 to-vibe-blue/10 backdrop-blur-lg rounded-3xl p-6 border border-vibe-blue/30 mb-6 shadow-2xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-synthetic-gradient rounded-full flex items-center justify-center shadow-lg border-2 border-glow-white/20">
              {profile?.photos && profile.photos.length > 0 ? (
                <img
                  src={profile.photos[0]}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-glow-white">
                  {profile?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-glow-white mb-1">
                {profile?.name || 'Your Name'}, {profile?.age || '25'}
              </h2>
              <div className="flex items-center space-x-1 bg-synthetic-gradient px-3 py-1 rounded-full shadow-lg">
                <Sparkles className="w-4 h-4 text-glow-white" />
                <span className="text-glow-white text-sm font-medium">Active Aura</span>
              </div>
            </div>
            <button className="text-glow-white/70 hover:text-glow-white transition-colors p-2 rounded-full hover:bg-glow-white/10 backdrop-blur-sm">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          <p className="text-glow-white/90 leading-relaxed mb-4">
            {profile?.bio || 'Your bio will appear here once you complete your profile.'}
          </p>

          {profile?.interests && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="bg-glow-white/20 text-glow-white px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-glow-white/20"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Personality Section - Rizz Pink */}
        {personality && (
          <div className="bg-gradient-to-br from-rizz-pink/20 to-rizz-pink/10 backdrop-blur-lg rounded-3xl p-6 border border-rizz-pink/30 mb-6 shadow-2xl">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-rizz-pink to-aura-violet rounded-full flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-glow-white" />
              </div>
              <h3 className="text-lg font-semibold text-glow-white">Your Personality Aura</h3>
            </div>

            <div className="space-y-4 mb-6">
              {Object.entries(personality).map(([trait, value]) => {
                if (trait === 'summary' || trait === 'aiPersona' || trait === 'detailedPrompt') return null;
                const numValue = value as number;
                
                return (
                  <div key={trait}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-glow-white capitalize text-sm font-medium">
                        {trait === 'neuroticism' ? 'Emotional Stability' : trait}
                      </span>
                      <span className="text-glow-white/70 text-sm">
                        {getTraitDescription(trait, numValue)}
                      </span>
                    </div>
                    <div className="w-full bg-glow-white/20 rounded-full h-2 backdrop-blur-sm">
                      <div
                        className="bg-synthetic-gradient h-2 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${numValue}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-glow-white/10 rounded-2xl p-4 backdrop-blur-sm border border-glow-white/20">
              <h4 className="text-glow-white font-medium mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-aura-violet" />
                Your AI Persona Says:
              </h4>
              <p className="text-glow-white/80 text-sm italic leading-relaxed">
                "{personality.aiPersona}"
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Matches Card - Vibe Blue */}
          <div className="bg-gradient-to-br from-vibe-blue/20 to-vibe-blue/10 backdrop-blur-lg rounded-2xl p-4 border border-vibe-blue/30 text-center shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-vibe-blue to-aura-violet rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Heart className="w-6 h-6 text-glow-white" />
            </div>
            <p className="text-2xl font-bold text-glow-white mb-1">0</p>
            <p className="text-glow-white/70 text-sm">Matches</p>
          </div>

          {/* Aura Power Card - Rizz Pink */}
          <div className="bg-gradient-to-br from-rizz-pink/20 to-rizz-pink/10 backdrop-blur-lg rounded-2xl p-4 border border-rizz-pink/30 text-center shadow-xl">
            <div className="w-12 h-12 bg-gradient-to-r from-rizz-pink to-aura-violet rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Sparkles className="w-6 h-6 text-glow-white" />
            </div>
            <p className="text-2xl font-bold text-glow-white mb-1">100%</p>
            <p className="text-glow-white/70 text-sm">Aura Power</p>
          </div>
        </div>

        {/* Additional Profile Actions */}
        <div className="mt-6 space-y-3">
          <button className="w-full bg-glow-white/10 backdrop-blur-lg text-glow-white py-3 rounded-2xl font-medium hover:bg-glow-white/20 transition-all border border-glow-white/20 flex items-center justify-center space-x-2">
            <User className="w-5 h-5" />
            <span>Edit Profile</span>
          </button>
          
          <button className="w-full bg-synthetic-gradient text-glow-white py-3 rounded-2xl font-medium hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Retake Personality Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
}