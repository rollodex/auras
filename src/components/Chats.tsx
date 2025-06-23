import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Clock, Sparkles, Bot, Users, ArrowRight, Edit3, Trash2 } from 'lucide-react';
import { Match, User } from '../types';
import { DataService } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import { sampleUsers } from '../data/sampleUsers';

export default function Chats() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Match[]>([]);
  const [dataService] = useState(DataService.getInstance());
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadAllChats();
  }, [dataService]);

  const loadAllChats = () => {
    // Get existing matches/chats - only show matched ones (not pending)
    const existingMatches = dataService.getMatches().filter(match => match.status === 'matched');
    const allChats: Match[] = [...existingMatches];
    
    // Get all chat histories and create chat entries for users not in matches
    const keys = Object.keys(localStorage);
    const chatKeys = keys.filter(key => key.startsWith('chat_'));
    
    chatKeys.forEach(key => {
      const userId = key.replace('chat_', '');
      const messages = dataService.getChatMessages(userId);
      
      // Only include if there are meaningful messages (more than just AI greeting)
      const meaningfulMessages = messages.filter(msg => 
        !(msg.sender === 'ai' && messages.indexOf(msg) === 0)
      );
      
      if (meaningfulMessages.length > 0) {
        // Check if this user is already in matches
        const existingMatch = allChats.find(match => match.user.id === userId);
        
        if (!existingMatch) {
          // Find the user data
          const userData = sampleUsers.find(user => user.id === userId);
          
          if (userData) {
            // Determine status based on whether it's a real chat or not
            const isReal = isRealChat(userId);
            const status = isReal ? 'matched' : 'pending'; // AI chats are pending until matched
            
            // Only show matched chats here (pending ones go to match requests)
            if (status === 'matched') {
              const chatEntry: Match = {
                id: `chat_${userId}_${Date.now()}`,
                user: userData,
                compatibility: 75 + Math.floor(Math.random() * 25), // Random compatibility
                chatHistory: messages,
                status: status as const
              };
              
              allChats.push(chatEntry);
            }
          }
        }
      }
    });
    
    // Sort by most recent activity
    allChats.sort((a, b) => {
      const aLastMessage = getLastMessage(a.user.id);
      const bLastMessage = getLastMessage(b.user.id);
      
      if (!aLastMessage && !bLastMessage) return 0;
      if (!aLastMessage) return 1;
      if (!bLastMessage) return -1;
      
      return bLastMessage.timestamp.getTime() - aLastMessage.timestamp.getTime();
    });
    
    setChats(allChats);
  };

  const handleChatClick = (chat: Match) => {
    if (isEditMode) return; // Don't navigate in edit mode
    
    // Simply set the current chat user and navigate - don't change chat type
    localStorage.setItem('currentChatUser', JSON.stringify(chat.user));
    navigate('/chat');
  };

  const handleDeleteChat = (chat: Match) => {
    const userId = chat.user.id;
    
    // Remove from matches if it exists
    const matches = dataService.getMatches();
    const updatedMatches = matches.filter(match => match.user.id !== userId);
    dataService.saveMatches(updatedMatches);
    
    // Clear chat messages
    localStorage.removeItem(`chat_${userId}`);
    
    // Clear real chat status
    localStorage.removeItem(`real_chat_${userId}`);
    
    // Remove from current chats list
    setChats(prev => prev.filter(c => c.user.id !== userId));
    
    // Exit edit mode if no chats left
    const remainingChats = chats.filter(c => c.user.id !== userId);
    if (remainingChats.length === 0) {
      setIsEditMode(false);
    }
  };

  const isRealChat = (userId: string) => {
    return localStorage.getItem(`real_chat_${userId}`) === 'true';
  };

  const getLastMessage = (userId: string) => {
    const messages = dataService.getChatMessages(userId);
    if (messages.length === 0) return null;
    
    // Get the last non-system message
    const lastMessage = messages.filter(msg => msg.sender !== 'system').pop();
    return lastMessage;
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

  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const getChatTypeInfo = (chat: Match) => {
    const isReal = isRealChat(chat.user.id);
    
    if (isReal) {
      return {
        type: 'real',
        label: 'Real',
        icon: Users,
        bgColor: 'bg-emerald-500/20',
        textColor: 'text-emerald-300',
        borderColor: 'border-emerald-500/30'
      };
    } else {
      return {
        type: 'ai',
        label: 'AI',
        icon: Bot,
        bgColor: 'bg-aura-violet/20',
        textColor: 'text-aura-violet',
        borderColor: 'border-aura-violet/30'
      };
    }
  };

  // Filter out declined chats for display (only show matched chats)
  const visibleChats = chats.filter(chat => chat.status === 'matched');

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
            <div className="w-8 h-8 bg-synthetic-gradient rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 text-glow-white" />
            </div>
            <h1 className="text-xl font-bold text-glow-white">Chats</h1>
          </div>
          
          {/* Edit Button */}
          {visibleChats.length > 0 && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all ${
                isEditMode 
                  ? 'bg-synthetic-gradient text-glow-white shadow-lg' 
                  : 'bg-glow-white/10 text-glow-white/70 hover:text-glow-white hover:bg-glow-white/20'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">{isEditMode ? 'Done' : 'Edit'}</span>
            </button>
          )}
        </div>

        {visibleChats.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-20 h-20 bg-glow-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-lg border border-glow-white/20">
              <MessageCircle className="w-10 h-10 text-glow-white/50" />
            </div>
            <h3 className="text-glow-white text-lg font-semibold mb-2">No active chats</h3>
            <p className="text-glow-white/70 mb-6">
              Start chatting with AI personas and accept match requests to see conversations here!
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => navigate('/browse')}
                className="bg-synthetic-gradient text-glow-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Start Browsing
              </button>
              <button
                onClick={() => navigate('/match-requests')}
                className="bg-glow-white/10 text-glow-white px-6 py-3 rounded-xl font-medium hover:bg-glow-white/20 transition-all border border-glow-white/20"
              >
                Check Match Requests
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-glow-white/10">
            {visibleChats.map((chat) => {
              const lastMessage = getLastMessage(chat.user.id);
              const chatTypeInfo = getChatTypeInfo(chat);
              
              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className={`flex items-center p-4 transition-colors ${
                    isEditMode 
                      ? 'cursor-default' 
                      : 'hover:bg-glow-white/5 cursor-pointer active:bg-glow-white/10'
                  }`}
                >
                  {/* Profile Picture with Indicator */}
                  <div className="relative mr-3 flex-shrink-0">
                    <img
                      src={chat.user.photos[0]}
                      alt={chat.user.name}
                      className="w-14 h-14 rounded-full object-cover border border-glow-white/20"
                    />
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${chat.user.auraColor} opacity-20`}></div>
                    
                    {/* Chat Type Indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-night-black ${
                      chatTypeInfo.type === 'real' 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                        : 'bg-gradient-to-r from-aura-violet to-rizz-pink'
                    }`}>
                      <chatTypeInfo.icon className="w-2.5 h-2.5 text-glow-white" />
                    </div>
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Match Percentage */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-glow-white font-semibold text-base truncate">
                          {chat.user.name}
                        </h3>
                        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${
                          chat.user.auraColor.includes('pink') 
                            ? 'bg-rizz-pink/20 text-rizz-pink border border-rizz-pink/30'
                            : chat.user.auraColor.includes('blue')
                              ? 'bg-vibe-blue/20 text-vibe-blue border border-vibe-blue/30'
                              : 'bg-aura-violet/20 text-aura-violet border border-aura-violet/30'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{chat.compatibility}%</span>
                        </div>
                      </div>
                      
                      {/* Time and Status or Delete Button */}
                      <div className="flex items-center space-x-1">
                        {isEditMode ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat);
                            }}
                            className="flex items-center justify-center w-8 h-8 bg-night-black rounded-full hover:bg-gray-800 transition-all transform hover:scale-110 active:scale-95 border border-glow-white/20"
                            title="Delete chat"
                          >
                            <span className="text-glow-white text-sm">💔</span>
                          </button>
                        ) : (
                          <>
                            {lastMessage && (
                              <span className="text-glow-white/50 text-xs">
                                {formatTimeAgo(lastMessage.timestamp)}
                              </span>
                            )}
                            <ArrowRight className="w-4 h-4 text-glow-white/30" />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Last Message or Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {lastMessage ? (
                          <div className="flex items-center space-x-1">
                            <span className="text-glow-white/60 text-sm">
                              {lastMessage.sender === 'user' ? 'You: ' : ''}
                            </span>
                            <span className="text-glow-white/80 text-sm truncate">
                              {truncateMessage(lastMessage.content)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-glow-white/60 text-sm">Start chatting...</span>
                        )}
                      </div>

                      {/* Chat Type Badge */}
                      {!isEditMode && (
                        <div className={`ml-2 flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${chatTypeInfo.bgColor} ${chatTypeInfo.textColor} border ${chatTypeInfo.borderColor}`}>
                          <chatTypeInfo.icon className="w-2.5 h-2.5" />
                          <span>{chatTypeInfo.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Mode Instructions */}
        {isEditMode && visibleChats.length > 0 && (
          <div className="p-4 border-t border-glow-white/10 bg-glow-white/5 backdrop-blur-lg">
            <div className="flex items-center justify-center space-x-2 text-glow-white/70 text-sm">
              <span className="text-lg">💔</span>
              <span>Tap the broken heart to delete chats</span>
            </div>
            <p className="text-center text-glow-white/50 text-xs mt-1">
              Deleted profiles will appear in Browse again
            </p>
          </div>
        )}
      </div>
    </div>
  );
}