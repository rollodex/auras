import React, { useState, useEffect } from 'react';
import { Heart, X, MessageCircle, Sparkles, Filter, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sampleUsers } from '../data/sampleUsers';
import { User, UserPreferences } from '../types';
import { DataService } from '../services/dataService';

export default function BrowseProfiles() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(sampleUsers);
  const [dataService] = useState(DataService.getInstance());
  const [preferences, setPreferences] = useState<UserPreferences>({
    ageRange: { min: 18, max: 35 },
    genderPreference: ['male', 'female', 'non-binary'],
    maxDistance: 50
  });

  useEffect(() => {
    // Load saved preferences
    const savedPrefs = dataService.getUserPreferences();
    setPreferences(savedPrefs);
  }, [dataService]);

  useEffect(() => {
    // Get list of users already interacted with
    const interactedUserIds = getInteractedUserIds();
    
    // Filter users based on preferences and exclude already interacted users
    const filtered = sampleUsers.filter(user => {
      const ageMatch = user.age >= preferences.ageRange.min && user.age <= preferences.ageRange.max;
      const genderMatch = preferences.genderPreference.includes(user.gender);
      const notInteracted = !interactedUserIds.includes(user.id);
      return ageMatch && genderMatch && notInteracted;
    });
    
    setFilteredUsers(filtered);
    setCurrentIndex(0);
  }, [preferences]);

  const getInteractedUserIds = (): string[] => {
    const interactedIds: string[] = [];
    
    // Get users from matches/chats
    const matches = dataService.getMatches();
    matches.forEach(match => {
      if (!interactedIds.includes(match.user.id)) {
        interactedIds.push(match.user.id);
      }
    });
    
    // Get users from chat history (anyone we've chatted with)
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chat_')) {
        const userId = key.replace('chat_', '');
        const messages = dataService.getChatMessages(userId);
        if (messages.length > 1) { // More than just the initial AI greeting
          if (!interactedIds.includes(userId)) {
            interactedIds.push(userId);
          }
        }
      }
    });
    
    return interactedIds;
  };

  const user = filteredUsers[currentIndex];

  const handleAction = (action: 'pass' | 'chat') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (action === 'chat') {
      localStorage.setItem('currentChatUser', JSON.stringify(user));
      navigate('/chat');
    } else {
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredUsers.length);
        setIsAnimating(false);
      }, 300);
    }
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    dataService.saveUserPreferences(updated);
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="min-h-screen bg-night-black relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-rizz-pink/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-aura-violet/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-20 w-40 h-40 bg-vibe-blue/20 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-synthetic-radial opacity-10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-20 h-20 bg-glow-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-glow-white/20">
              <Heart className="w-10 h-10 text-glow-white/50" />
            </div>
            <h3 className="text-glow-white text-lg font-semibold mb-2">No new profiles</h3>
            <p className="text-glow-white/70 mb-6">
              You've seen all available profiles! Try adjusting your filters or check back later for new people.
            </p>
            <button
              onClick={() => setShowFilters(true)}
              className="bg-synthetic-gradient text-glow-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Adjust Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
            <h1 className="text-xl font-bold text-glow-white">Discover Auras</h1>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="text-glow-white/70 hover:text-glow-white transition-colors p-2 rounded-full hover:bg-glow-white/10 backdrop-blur-sm"
          >
            <Filter className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Card */}
        <div className={`transition-all duration-300 ${isAnimating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
          <div className="bg-glow-white/10 backdrop-blur-lg rounded-3xl overflow-hidden border border-glow-white/20 shadow-2xl">
            {/* Photo */}
            <div className="relative h-96">
              <img
                src={user.photos[0]}
                alt={user.name}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${user.auraColor} opacity-20`}></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-glow-white mb-1">
                  {user.name}, {user.age}
                </h2>
                <div className="flex items-center justify-between">
                  <div className={`inline-flex items-center space-x-1 bg-gradient-to-r ${user.auraColor} px-3 py-1 rounded-full shadow-lg`}>
                    <Sparkles className="w-4 h-4 text-glow-white" />
                    <span className="text-glow-white text-sm font-medium">Aura Match</span>
                  </div>
                  {user.location && (
                    <span className="text-glow-white/80 text-sm">{user.location}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio and Interests */}
            <div className="p-6">
              <p className="text-glow-white/90 leading-relaxed mb-4">{user.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {user.interests.slice(0, 4).map((interest) => (
                  <span
                    key={interest}
                    className="bg-glow-white/20 text-glow-white px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-glow-white/20"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 4 && (
                  <span className="bg-glow-white/20 text-glow-white px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-glow-white/20">
                    +{user.interests.length - 4} more
                  </span>
                )}
              </div>

              {/* Personality Preview */}
              <div className="bg-glow-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-glow-white/20">
                <h3 className="text-glow-white font-semibold mb-2 flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Personality Preview
                </h3>
                <p className="text-glow-white/80 text-sm italic">
                  "{user.personality.aiPersona.slice(0, 120)}..."
                </p>
                <p className="text-aura-violet text-xs mt-2">Chat with their AI to learn more!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6 mt-8">
          <button
            onClick={() => handleAction('pass')}
            className="w-16 h-16 bg-glow-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-glow-white/30 hover:bg-glow-white/30 transition-all transform hover:scale-110 shadow-lg"
            disabled={isAnimating}
          >
            <X className="w-8 h-8 text-glow-white" />
          </button>
          
          <button
            onClick={() => handleAction('chat')}
            className="w-16 h-16 bg-synthetic-gradient rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
            disabled={isAnimating}
          >
            <MessageCircle className="w-8 h-8 text-glow-white" />
          </button>
        </div>

        {/* Hints */}
        <div className="text-center mt-6">
          <p className="text-glow-white/60 text-sm">
            Chat with their AI persona to see if you vibe! 💫
          </p>
          <p className="text-glow-white/40 text-xs mt-1">
            Showing {currentIndex + 1} of {filteredUsers.length} new profiles
          </p>
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-night-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-glow-white/10 backdrop-blur-lg rounded-3xl p-6 border border-glow-white/20 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-glow-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-glow-white/70 hover:text-glow-white p-2 rounded-full hover:bg-glow-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Age Range */}
              <div>
                <label className="block text-glow-white text-sm font-medium mb-3">
                  Age Range: {preferences.ageRange.min} - {preferences.ageRange.max}
                </label>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="18"
                      max="50"
                      value={preferences.ageRange.min}
                      onChange={(e) => updatePreferences({
                        ageRange: { ...preferences.ageRange, min: parseInt(e.target.value) }
                      })}
                      className="w-full accent-rizz-pink"
                    />
                    <span className="text-glow-white/70 text-xs">Min: {preferences.ageRange.min}</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="18"
                      max="50"
                      value={preferences.ageRange.max}
                      onChange={(e) => updatePreferences({
                        ageRange: { ...preferences.ageRange, max: parseInt(e.target.value) }
                      })}
                      className="w-full accent-rizz-pink"
                    />
                    <span className="text-glow-white/70 text-xs">Max: {preferences.ageRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Gender Preferences */}
              <div>
                <label className="block text-glow-white text-sm font-medium mb-3">Show me</label>
                <div className="space-y-2">
                  {(['male', 'female', 'non-binary'] as const).map((gender) => (
                    <label key={gender} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={preferences.genderPreference.includes(gender)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updatePreferences({
                              genderPreference: [...preferences.genderPreference, gender]
                            });
                          } else {
                            updatePreferences({
                              genderPreference: preferences.genderPreference.filter(g => g !== gender)
                            });
                          }
                        }}
                        className="w-4 h-4 text-rizz-pink bg-glow-white/10 border-glow-white/30 rounded focus:ring-rizz-pink accent-rizz-pink"
                      />
                      <span className="text-glow-white capitalize">{gender === 'non-binary' ? 'Non-binary' : gender}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-glow-white text-sm font-medium mb-3">
                  Maximum Distance: {preferences.maxDistance} miles
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={preferences.maxDistance}
                  onChange={(e) => updatePreferences({
                    maxDistance: parseInt(e.target.value)
                  })}
                  className="w-full accent-rizz-pink"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="w-full bg-synthetic-gradient text-glow-white py-3 rounded-xl font-medium mt-6 hover:shadow-lg transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}