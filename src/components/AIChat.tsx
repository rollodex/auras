import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Heart, Sparkles, Loader, Phone, Zap, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, ChatMessage } from '../types';
import { AIChatService } from '../services/aiChat';
import { DataService } from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';
import VoiceCallModal from './VoiceCallModal';
import AutopilotModal from './AutopilotModal';

export default function AIChat() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiService] = useState(new AIChatService());
  const [dataService] = useState(DataService.getInstance());
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [showAutopilot, setShowAutopilot] = useState(false);
  const [isRealChat, setIsRealChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentChatUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Check if this is a real chat (from matches)
      const realChatKey = `real_chat_${userData.id}`;
      const isRealChatStored = localStorage.getItem(realChatKey) === 'true';
      setIsRealChat(isRealChatStored);
      
      // Load existing chat messages
      const existingMessages = dataService.getChatMessages(userData.id);
      
      if (existingMessages.length > 0) {
        setMessages(existingMessages);
      } else if (!isRealChatStored) {
        // Initialize with AI greeting that references the current user (only for AI chats)
        const greeting: ChatMessage = {
          id: '1',
          content: currentUser 
            ? `Hey ${currentUser.name}! I'm ${userData.name}'s AI persona. ${userData.personality.aiPersona.slice(0, 100)}... I saw your profile and you seem really interesting! What would you like to know about me?`
            : `Hey! I'm ${userData.name}'s AI persona. ${userData.personality.aiPersona.slice(0, 100)}... What would you like to know about me?`,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages([greeting]);
        dataService.saveChatMessages(userData.id, [greeting]);
      }
    }
  }, [dataService, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    dataService.saveChatMessages(user.id, newMessages);
    
    const currentInput = inputValue;
    setInputValue('');

    // If it's a real chat, don't generate AI response
    if (isRealChat) {
      return;
    }

    setIsTyping(true);

    try {
      // Prepare user profile for the AI
      const userProfile = currentUser ? {
        name: currentUser.name,
        age: currentUser.age,
        bio: currentUser.bio,
        interests: currentUser.interests,
        personality: currentUser.personality
      } : undefined;

      // Generate AI response using the detailed prompt, user context, and full chat history
      const aiResponse = await aiService.generateResponse(
        currentInput,
        user.personality.detailedPrompt,
        user.name,
        userProfile,
        newMessages // Pass the full chat history including the new user message
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      dataService.saveChatMessages(user.id, updatedMessages);
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback message
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. What would you like to know about me?",
        sender: 'ai',
        timestamp: new Date()
      };
      const updatedMessages = [...newMessages, fallbackMessage];
      setMessages(updatedMessages);
      dataService.saveChatMessages(user.id, updatedMessages);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRequestMatch = () => {
    if (!user) return;
    
    // Create match request
    const matchRequest = {
      id: `match_${user.id}_${Date.now()}`,
      user,
      compatibility: 85 + Math.floor(Math.random() * 15),
      chatHistory: messages,
      status: 'pending' as const
    };
    
    dataService.addMatch(matchRequest);
    navigate('/chats');
  };

  const handleStartRealChat = () => {
    if (!user) return;
    
    // Mark this chat as real
    const realChatKey = `real_chat_${user.id}`;
    localStorage.setItem(realChatKey, 'true');
    setIsRealChat(true);
    
    // Add separator message
    const separatorMessage: ChatMessage = {
      id: `separator_${Date.now()}`,
      content: `Now chatting with ${user.name}`,
      sender: 'system',
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, separatorMessage];
    setMessages(updatedMessages);
    dataService.saveChatMessages(user.id, updatedMessages);
  };

  const handleAutopilotComplete = (simulatedMessages: ChatMessage[], isMatch: boolean) => {
    // Add the simulated messages to the chat history
    const updatedMessages = [...messages, ...simulatedMessages];
    setMessages(updatedMessages);
    dataService.saveChatMessages(user!.id, updatedMessages);
    
    // If it's a match, automatically create the match
    if (isMatch && user) {
      const matchRequest = {
        id: `match_${user.id}_${Date.now()}`,
        user,
        compatibility: 90 + Math.floor(Math.random() * 10),
        chatHistory: updatedMessages,
        status: 'pending' as const
      };
      dataService.addMatch(matchRequest);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-night-black flex items-center justify-center">
        <div className="text-glow-white text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-black">
      <div className="max-w-md mx-auto bg-glow-white/5 backdrop-blur-lg min-h-screen flex flex-col border-x border-glow-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glow-white/20 bg-glow-white/5 backdrop-blur-lg">
          <button
            onClick={() => navigate('/browse')}
            className="text-glow-white/70 hover:text-glow-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={user.photos[0]}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-glow-white font-semibold">
                {isRealChat ? user.name : `${user.name}'s AI`}
              </h2>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 ${isRealChat ? 'bg-vibe-blue' : 'bg-aura-violet'} rounded-full animate-pulse`}></div>
                <span className="text-glow-white/70 text-xs">
                  {isRealChat ? 'Real Chat' : 'AI Online'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isRealChat && (
              <>
                <button
                  onClick={() => setShowAutopilot(true)}
                  className="text-rizz-pink hover:text-rizz-pink/80 transition-colors p-2 bg-glow-white/10 rounded-full backdrop-blur-sm"
                  title="Autopilot chat simulation"
                >
                  <Zap className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowVoiceCall(true)}
                  className="text-glow-white hover:text-vibe-blue transition-colors p-2 bg-glow-white/10 rounded-full backdrop-blur-sm"
                  title="Start voice call"
                >
                  <Phone className="w-5 h-5" />
                </button>
                <button
                  onClick={handleRequestMatch}
                  className="text-rizz-pink hover:text-rizz-pink/80 transition-colors"
                >
                  <Heart className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => {
            // System messages (separators)
            if (message.sender === 'system') {
              return (
                <div key={message.id} className="text-center my-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-glow-white/30"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <div className="bg-synthetic-gradient text-glow-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        💬 {message.content}
                      </div>
                    </div>
                  </div>
                  <p className="text-glow-white/60 text-xs mt-2">
                    All previous messages were with {user.name}'s AI persona
                  </p>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl break-words ${
                    message.sender === 'user'
                      ? 'bg-synthetic-gradient text-glow-white shadow-lg'
                      : 'bg-glow-white/10 text-glow-white backdrop-blur-sm border border-glow-white/20'
                  }`}
                >
                  {message.sender === 'ai' && !isRealChat && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Sparkles className="w-3 h-3 text-aura-violet" />
                      <span className="text-xs text-aura-violet">AI Persona</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          
          {isTyping && !isRealChat && (
            <div className="flex justify-start">
              <div className="bg-glow-white/10 text-glow-white max-w-[85%] px-4 py-3 rounded-2xl backdrop-blur-sm border border-glow-white/20">
                <div className="flex items-center space-x-1 mb-1">
                  <Sparkles className="w-3 h-3 text-aura-violet" />
                  <span className="text-xs text-aura-violet">AI Persona</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-glow-white/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-glow-white/60 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-glow-white/60 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-glow-white/20 bg-glow-white/5 backdrop-blur-lg">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isRealChat ? `Message ${user.name}...` : "Message their AI persona..."}
              className="flex-1 bg-glow-white/10 border border-glow-white/20 rounded-2xl px-4 py-3 text-glow-white placeholder-glow-white/50 focus:outline-none focus:ring-2 focus:ring-rizz-pink backdrop-blur-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="w-12 h-12 bg-synthetic-gradient rounded-full flex items-center justify-center disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {isTyping ? (
                <Loader className="w-5 h-5 text-glow-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-glow-white" />
              )}
            </button>
          </div>
          
          {!isRealChat && (
            <div className="mt-3 flex justify-center space-x-4">
              <button
                onClick={() => setShowAutopilot(true)}
                className="bg-gradient-to-r from-rizz-pink to-aura-violet text-glow-white px-6 py-2 rounded-full text-sm hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Autopilot</span>
              </button>
              <button
                onClick={() => setShowVoiceCall(true)}
                className="bg-gradient-to-r from-vibe-blue to-aura-violet text-glow-white px-6 py-2 rounded-full text-sm hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Voice Call</span>
              </button>
              <button
                onClick={handleRequestMatch}
                className="bg-glow-white/10 text-glow-white px-6 py-2 rounded-full text-sm hover:bg-glow-white/20 transition-colors backdrop-blur-sm"
              >
                💫 Request Real Match
              </button>
            </div>
          )}
          
          <p className="text-glow-white/40 text-xs text-center mt-2">
            {isRealChat 
              ? `Real conversation with ${user.name} • Messages are persistent`
              : 'Powered by AI • Try Autopilot to see how you two would vibe!'
            }
          </p>
        </div>
      </div>

      {/* Voice Call Modal - only show for AI chats */}
      {!isRealChat && (
        <VoiceCallModal
          user={user}
          isOpen={showVoiceCall}
          onClose={() => setShowVoiceCall(false)}
        />
      )}

      {/* Autopilot Modal - only show for AI chats */}
      {!isRealChat && (
        <AutopilotModal
          user={user}
          currentUser={currentUser}
          isOpen={showAutopilot}
          onClose={() => setShowAutopilot(false)}
          onComplete={handleAutopilotComplete}
          existingMessages={messages}
        />
      )}
    </div>
  );
}