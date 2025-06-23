import React, { useState, useEffect } from 'react';
import { Heart, X, Clock, Sparkles, User, Check, MessageCircle } from 'lucide-react';
import { Match } from '../types';
import { DataService } from '../services/dataService';
import { useNavigate } from 'react-router-dom';

export default function MatchRequests() {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<Match[]>([]);
  const [dataService] = useState(DataService.getInstance());

  useEffect(() => {
    loadPendingRequests();
  }, [dataService]);

  const loadPendingRequests = () => {
    const allMatches = dataService.getMatches();
    const pending = allMatches.filter(match => match.status === 'pending');
    
    // Sort by most recent activity
    pending.sort((a, b) => {
      const aLastMessage = getLastMessage(a.user.id);
      const bLastMessage = getLastMessage(b.user.id);
      
      if (!aLastMessage && !bLastMessage) return 0;
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;
      
      return bLastMessage.timestamp.getTime() - aLastMessage.timestamp.getTime();
    });
    
    setPendingRequests(pending);
  };

  const getLastMessage = (userId: string) => {
    const messages = dataService.getChatMessages(userId);
    if (messages.length === 0) return null;
    
    // Get the last non-system message
    const lastMessage = messages.filter(msg => msg.sender !== 'system').pop();
    return lastMessage;
  };

  const handleAcceptMatch = (matchId: string, user: any) => {
    // Update match status to accepted
    dataService.updateMatchStatus(matchId, 'matched');
    
    // Mark as real chat
    const realChatKey = `real_chat_${user.id}`;
    localStorage.setItem(realChatKey, 'true');
    
    // Add separator message to chat history
    const messages = dataService.getChatMessages(user.id);
    const separatorMessage = {
      id: `separator_${Date.now()}`,
      content: `Now chatting with ${user.name}`,
      sender: 'system' as const,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, separatorMessage];
    dataService.saveChatMessages(user.id, updatedMessages);
    
    // Remove from pending requests
    setPendingRequests(prev => prev.filter(request => request.id !== matchId));
    
    // Navigate to chat
    localStorage.setItem('currentChatUser', JSON.stringify(user));
    navigate('/chat');
  };

  const handleDeclineMatch = (matchId: string) => {
    dataService.updateMatchStatus(matchId, 'declined');
    setPendingRequests(prev => prev.filter(request => request.id !== matchId));
  };

  const handleViewChat = (user: any) => {
    localStorage.setItem('currentChatUser', JSON.stringify(user));
    navigate('/chat');
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
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

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glow-white/10 bg-glow-white/5 backdrop-blur-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-rizz-pink to-aura-violet rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-5 h-5 text-glow-white" />
            </div>
            <h1 className="text-xl font-bold text-glow-white">Match Requests</h1>
          </div>
          
          {pendingRequests.length > 0 && (
            <div className="bg-rizz-pink/20 border border-rizz-pink/30 rounded-full px-3 py-1">
              <span className="text-rizz-pink text-sm font-medium">{pendingRequests.length}</span>
            </div>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 bg-glow-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-lg border border-glow-white/20">
              <Heart className="w-10 h-10 text-glow-white/50" />
            </div>
            <h3 className="text-glow-white text-lg font-semibold mb-2">No pending requests</h3>
            <p className="text-glow-white/70 mb-6">
              When someone wants to match with you after chatting with your AI, their requests will appear here.
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="bg-synthetic-gradient text-glow-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Start Browsing
            </button>
          </div>
        ) : (
          <div className="divide-y divide-glow-white/10">
            {pendingRequests.map((request) => {
              const lastMessage = getLastMessage(request.user.id);
              
              return (
                <div
                  key={request.id}
                  className="p-4 hover:bg-glow-white/5 transition-colors"
                >
                  {/* User Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative">
                      <img
                        src={request.user.photos[0]}
                        alt={request.user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-glow-white/20"
                      />
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${request.user.auraColor} opacity-20`}></div>
                      
                      {/* Match indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-rizz-pink to-aura-violet rounded-full flex items-center justify-center border-2 border-night-black shadow-lg">
                        <Heart className="w-3 h-3 text-glow-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-glow-white font-semibold text-lg">
                          {request.user.name}, {request.user.age}
                        </h3>
                        {lastMessage && (
                          <span className="text-glow-white/50 text-xs">
                            {formatTimeAgo(lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${
                          request.user.auraColor.includes('pink') 
                            ? 'bg-rizz-pink/20 text-rizz-pink border border-rizz-pink/30'
                            : request.user.auraColor.includes('blue')
                              ? 'bg-vibe-blue/20 text-vibe-blue border border-vibe-blue/30'
                              : 'bg-aura-violet/20 text-aura-violet border border-aura-violet/30'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{request.compatibility}% match</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          <Clock className="w-2.5 h-2.5" />
                          <span>Pending</span>
                        </div>
                      </div>

                      <p className="text-glow-white/80 text-sm mb-2">
                        Wants to match after chatting with your AI!
                      </p>

                      {lastMessage && (
                        <div className="bg-glow-white/10 rounded-lg p-2 mb-3 backdrop-blur-sm border border-glow-white/20">
                          <p className="text-glow-white/70 text-xs mb-1">Last message:</p>
                          <p className="text-glow-white/90 text-sm">
                            "{truncateMessage(lastMessage.content)}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDeclineMatch(request.id)}
                      className="flex-1 bg-glow-white/10 text-glow-white py-3 rounded-xl font-medium hover:bg-glow-white/20 transition-all border border-glow-white/20 flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                    
                    <button
                      onClick={() => handleViewChat(request.user)}
                      className="flex-1 bg-vibe-blue/20 text-vibe-blue py-3 rounded-xl font-medium hover:bg-vibe-blue/30 transition-all border border-vibe-blue/30 flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>View Chat</span>
                    </button>
                    
                    <button
                      onClick={() => handleAcceptMatch(request.id, request.user)}
                      className="flex-1 bg-synthetic-gradient text-glow-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                  </div>

                  {/* User Preview */}
                  <div className="mt-4 bg-glow-white/5 rounded-xl p-3 backdrop-blur-sm border border-glow-white/10">
                    <p className="text-glow-white/80 text-sm mb-2 leading-relaxed">
                      "{request.user.bio}"
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {request.user.interests.slice(0, 3).map((interest) => (
                        <span
                          key={interest}
                          className="bg-glow-white/20 text-glow-white px-2 py-0.5 rounded-full text-xs backdrop-blur-sm border border-glow-white/20"
                        >
                          {interest}
                        </span>
                      ))}
                      {request.user.interests.length > 3 && (
                        <span className="bg-glow-white/20 text-glow-white px-2 py-0.5 rounded-full text-xs backdrop-blur-sm border border-glow-white/20">
                          +{request.user.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Instructions */}
        {pendingRequests.length > 0 && (
          <div className="p-4 border-t border-glow-white/10 bg-glow-white/5 backdrop-blur-lg">
            <div className="text-center text-glow-white/70 text-sm">
              <p className="mb-1">💫 These people want to match with you!</p>
              <p className="text-glow-white/50 text-xs">
                Accept to start a real conversation, or decline to pass
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}