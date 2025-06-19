import React, { useState } from 'react';
import { ArrowLeft, Camera, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    age: '',
    gender: 'non-binary' as 'male' | 'female' | 'non-binary',
    bio: '',
    interests: [] as string[]
  });
  const [newInterest, setNewInterest] = useState('');

  const popularInterests = [
    'Travel', 'Photography', 'Music', 'Fitness', 'Reading', 'Cooking',
    'Art', 'Movies', 'Hiking', 'Gaming', 'Dancing', 'Coffee'
  ];

  const addInterest = (interest: string) => {
    if (!formData.interests.includes(interest) && formData.interests.length < 6) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addCustomInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      addInterest(newInterest.trim());
      setNewInterest('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.age && formData.bio && formData.interests.length > 0) {
      const profileData = {
        ...formData,
        age: parseInt(formData.age),
        photos: ['https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'], // Default photo
        auraColor: 'from-purple-400 to-pink-500'
      };
      updateUserProfile(profileData);
      navigate('/browse');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Link to="/quiz" className="text-white/70">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Create Profile</h1>
          <div className="w-6"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Add Photos</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-square bg-white/10 rounded-2xl border-2 border-dashed border-white/30 flex items-center justify-center">
                <Camera className="w-8 h-8 text-white/50" />
              </div>
              <div className="aspect-square bg-white/5 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white/30" />
              </div>
              <div className="aspect-square bg-white/5 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-white/30" />
              </div>
            </div>
            <p className="text-white/60 text-xs mt-2">Demo uses placeholder photos</p>
          </div>

          {/* Basic Info */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="25"
                min="18"
                max="100"
                required
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                rows={3}
                placeholder="Tell people what makes you unique..."
                required
              />
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Your Interests</h3>
            
            {/* Selected Interests */}
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.interests.map((interest) => (
                <div key={interest} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                  <span>{interest}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Popular Interests */}
            <div className="flex flex-wrap gap-2 mb-4">
              {popularInterests
                .filter(interest => !formData.interests.includes(interest))
                .map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => addInterest(interest)}
                  className="bg-white/10 text-white px-3 py-1 rounded-full text-sm hover:bg-white/20 transition-colors"
                  disabled={formData.interests.length >= 6}
                >
                  {interest}
                </button>
              ))}
            </div>

            {/* Custom Interest Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Add custom interest"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
              />
              <button
                type="button"
                onClick={addCustomInterest}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/60 text-xs mt-2">Add up to 6 interests ({formData.interests.length}/6)</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
}