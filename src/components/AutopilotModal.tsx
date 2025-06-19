import React, { useState, useEffect, useRef } from 'react';
import { Zap, X, Loader, Heart, HeartOff, Sparkles, Play, Pause } from 'lucide-react';
import { User, ChatMessage } from '../types';
import { AutopilotService } from '../services/autopilot';

interface AutopilotModalProps {
  user: User;
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (messages: ChatMessage[], isMatch: boolean) => void;
  existingMessages: ChatMessage[];
}

type AutopilotState = 'idle' | 'running' | 'paused' | 'complete' | 'error';

export default function AutopilotModal({ user, currentUser, isOpen, onClose, onComplete, existingMessages }: AutopilotModalProps) {
  const [autopilotState, setAutopilotState] = useState<AutopilotState>('idle');
  const [simulatedMessages, setSimulatedMessages] = useState<ChatMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);
  const [matchReasoning, setMatchReasoning] = useState('');
  const [autopilotService] = useState(new AutopilotService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessageIndex]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setAutopilotState('idle');
      setSimulatedMessages([]);
      setCurrentMessageIndex(0);
      setIsMatch(null);
      setMatchReasoning('');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [isOpen]);

  const startAutopilot = async () => {
    if (!currentUser) return;

    setAutopilotState('running');
    setSimulatedMessages([]);
    setCurrentMessageIndex(0);
    setIsMatch(null);
    setMatchReasoning('');

    try {
      // Generate the conversation simulation
      const result = await autopilotService.simulateConversation(currentUser, user, existingMessages);
      
      if (result.success && result.messages) {
        setSimulatedMessages(result.messages);
        setIsMatch(result.isMatch || false);
        setMatchReasoning(result.reasoning || '');
        
        // Start displaying messages one by one
        let messageIndex = 0;
        intervalRef.current = setInterval(() => {
          setCurrentMessageIndex(messageIndex);
          messageIndex++;
          
          if (messageIndex >= result.messages!.length) {
            clearInterval(intervalRef.current!);
            setAutopilotState('complete');
          }
        }, 2500); // Show a new message every 2.5 seconds
      } else {
        setAutopilotState('error');
      }
    } catch (error) {
      console.error('Autopilot error:', error);
      setAutopilotState('error');
    }
  };

  const pauseAutopilot = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setAutopilotState('paused');
  };

  const resumeAutopilot = () => {
    if (autopilotState === 'paused' && currentMessageIndex < simulatedMessages.length) {
      setAutopilotState('running');
      
      let messageIndex = currentMessageIndex + 1;
      intervalRef.current = setInterval(() => {
        setCurrentMessageIndex(messageIndex);
        messageIndex++;
        
        if (messageIndex >= simulatedMessages.length) {
          clearInterval(intervalRef.current!);
          setAutopilotState('complete');
        }
      }, 2500);
    }
  };

  const handleComplete = () => {
    onComplete(simulatedMessages, isMatch || false);
    onClose();
  };

  const handleClose = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onClose();
  };

  // Check if we have meaningful existing messages (not just AI greeting)
  const meaningfulExistingMessages = existingMessages.filter(msg => 
    !(msg.sender === 'ai' && existingMessages.indexOf(msg) === 0)
  );

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-night-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-glow-white/10 backdrop-blur-lg rounded-3xl border border-glow-white/20 w-full max-w-sm h-[600px] flex flex-col overflow-hidden shadow-2xl">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-10 left-8 w-16 h-16 bg-rizz-pink/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-6 w-12 h-12 bg-aura-violet/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-synthetic-radial opacity-10 rounded-full blur-2xl"></div>
        </div>

        {/* Compact Header */}
        <div className="relative z-10 flex items-center justify-between p-3 border-b border-glow-white/20 flex-shrink-0 bg-glow-white/5 backdrop-blur-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-synthetic-gradient rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-glow-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-glow-white">Autopilot</h3>
              <p className="text-glow-white/70 text-xs">
                {meaningfulExistingMessages.length > 0 
                  ? `Continuing from ${meaningfulExistingMessages.length} messages`
                  : `${currentUser.name} × ${user.name}`
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-glow-white/70 hover:text-glow-white transition-colors p-1 rounded-full hover:bg-glow-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Participants - Ultra Compact */}
        <div className="relative z-10 flex items-center justify-center space-x-4 p-2 border-b border-glow-white/20 flex-shrink-0 bg-glow-white/5 backdrop-blur-lg">
          <div className="text-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mx-auto border border-rizz-pink/50">
              <div className="w-full h-full bg-synthetic-gradient flex items-center justify-center">
                <span className="text-glow-white font-bold text-xs">{currentUser.name.charAt(0)}</span>
              </div>
            </div>
            <p className="text-glow-white text-xs font-medium mt-1">{currentUser.name}</p>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="w-4 h-0.5 bg-gradient-to-r from-rizz-pink to-aura-violet"></div>
            <Heart className="w-3 h-3 text-rizz-pink" />
            <div className="w-4 h-0.5 bg-gradient-to-r from-aura-violet to-vibe-blue"></div>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mx-auto border border-vibe-blue/50">
              <img
                src={user.photos[0]}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-glow-white text-xs font-medium mt-1">{user.name}</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0">
          {autopilotState === 'idle' && (
            <div className="flex-1 flex flex-col justify-center p-4 text-center">
              <div className="w-12 h-12 bg-synthetic-gradient rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Zap className="w-6 h-6 text-glow-white" />
              </div>
              <h4 className="text-lg font-bold text-glow-white mb-2">Ready for Autopilot?</h4>
              <p className="text-glow-white/80 text-sm leading-relaxed">
                {meaningfulExistingMessages.length > 0 
                  ? `Continue your conversation and see if it leads to a match!`
                  : `Watch your AI personas chat and see if you're compatible!`
                }
              </p>
            </div>
          )}

          {autopilotState === 'error' && (
            <div className="flex-1 flex flex-col justify-center p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <X className="w-6 h-6 text-glow-white" />
              </div>
              <h4 className="text-lg font-bold text-glow-white mb-2">Simulation Failed</h4>
              <p className="text-glow-white/80 text-sm">Check your API configuration.</p>
            </div>
          )}

          {(autopilotState === 'running' || autopilotState === 'paused' || autopilotState === 'complete') && (
            <>
              {/* Progress Bar */}
              <div className="p-3 border-b border-glow-white/20 flex-shrink-0 bg-glow-white/5 backdrop-blur-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-glow-white/70 text-xs">
                    {autopilotState === 'complete' ? 'Complete' : 'Progress'}
                  </span>
                  <span className="text-glow-white/70 text-xs">
                    {Math.min(currentMessageIndex + 1, simulatedMessages.length)} / {simulatedMessages.length}
                  </span>
                </div>
                <div className="w-full bg-glow-white/20 rounded-full h-1">
                  <div 
                    className="bg-synthetic-gradient h-1 rounded-full transition-all duration-500 shadow-sm"
                    style={{ 
                      width: `${simulatedMessages.length > 0 ? ((currentMessageIndex + 1) / simulatedMessages.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto bg-glow-white/5 p-2 min-h-0 backdrop-blur-sm">
                <div className="space-y-2">
                  {/* Show existing messages first if any */}
                  {meaningfulExistingMessages.length > 0 && (
                    <>
                      <div className="text-center">
                        <div className="inline-block bg-glow-white/10 rounded-full px-2 py-0.5 text-glow-white/60 text-xs backdrop-blur-sm border border-glow-white/20">
                          Previous conversation
                        </div>
                      </div>
                      {meaningfulExistingMessages.slice(-2).map((message, index) => (
                        <div
                          key={`existing-${index}`}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-2 py-1 rounded-lg opacity-60 text-xs backdrop-blur-sm ${
                              message.sender === 'user'
                                ? 'bg-synthetic-gradient text-glow-white'
                                : 'bg-glow-white/20 text-glow-white border border-glow-white/20'
                            }`}
                          >
                            <p className="leading-relaxed break-words">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="text-center">
                        <div className="inline-block bg-synthetic-gradient rounded-full px-2 py-0.5 text-glow-white text-xs shadow-lg">
                          Autopilot continues...
                        </div>
                      </div>
                    </>
                  )}

                  {/* Show simulated messages */}
                  {simulatedMessages.slice(0, currentMessageIndex + 1).map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[80%] px-2 py-1 rounded-lg text-xs backdrop-blur-sm ${
                          message.sender === 'user'
                            ? 'bg-synthetic-gradient text-glow-white shadow-lg'
                            : 'bg-glow-white/20 text-glow-white border border-glow-white/20'
                        }`}
                      >
                        <p className="leading-relaxed break-words">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {autopilotState === 'running' && currentMessageIndex < simulatedMessages.length && (
                    <div className="flex justify-start">
                      <div className="bg-glow-white/20 text-glow-white max-w-[80%] px-2 py-1 rounded-lg backdrop-blur-sm border border-glow-white/20">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-glow-white/60 rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-glow-white/60 rounded-full animate-bounce delay-100"></div>
                          <div className="w-1 h-1 bg-glow-white/60 rounded-full animate-bounce delay-200"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Controls */}
              <div className="p-2 border-t border-glow-white/20 flex-shrink-0 bg-glow-white/5 backdrop-blur-lg">
                <div className="flex justify-center space-x-2 mb-2">
                  {autopilotState === 'running' && (
                    <button
                      onClick={pauseAutopilot}
                      className="bg-glow-white/20 text-glow-white px-3 py-1 rounded-lg hover:bg-glow-white/30 transition-colors flex items-center space-x-1 text-xs backdrop-blur-sm border border-glow-white/20"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </button>
                  )}
                  
                  {autopilotState === 'paused' && (
                    <button
                      onClick={resumeAutopilot}
                      className="bg-synthetic-gradient text-glow-white px-3 py-1 rounded-lg hover:shadow-lg transition-all flex items-center space-x-1 text-xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>Resume</span>
                    </button>
                  )}

                  {autopilotState === 'complete' && (
                    <div className="text-center">
                      <div className="inline-block bg-gradient-to-r from-emerald-500 to-green-500 rounded-full px-2 py-0.5 text-glow-white text-xs shadow-lg">
                        ✨ Complete!
                      </div>
                    </div>
                  )}
                </div>

                {/* Match Result */}
                {autopilotState === 'complete' && isMatch !== null && (
                  <div className={`bg-glow-white/10 backdrop-blur-lg rounded-lg p-2 border mb-2 ${isMatch ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                    <div className="text-center">
                      <div className={`w-8 h-8 ${isMatch ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} rounded-full flex items-center justify-center mx-auto mb-1 shadow-lg`}>
                        {isMatch ? (
                          <Heart className="w-4 h-4 text-glow-white" />
                        ) : (
                          <HeartOff className="w-4 h-4 text-glow-white" />
                        )}
                      </div>
                      <h4 className={`text-sm font-bold ${isMatch ? 'text-emerald-300' : 'text-red-300'} mb-1`}>
                        {isMatch ? "It's a Match! 🎉" : "Not a Match 💔"}
                      </h4>
                      <p className="text-glow-white/80 text-xs leading-relaxed">
                        {matchReasoning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Seamless Bottom Button */}
        <div className="relative z-10 flex-shrink-0">
          {autopilotState === 'idle' && (
            <button
              onClick={startAutopilot}
              className="w-full bg-synthetic-gradient text-glow-white py-4 font-bold text-base hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-3 rounded-b-3xl border-t border-rizz-pink/30"
            >
              <Play className="w-5 h-5" />
              <span>Start Simulation</span>
            </button>
          )}

          {autopilotState === 'error' && (
            <button
              onClick={() => setAutopilotState('idle')}
              className="w-full bg-glow-white/20 text-glow-white py-3 hover:bg-glow-white/30 transition-colors rounded-b-3xl border-t border-glow-white/20 backdrop-blur-lg"
            >
              Try Again
            </button>
          )}

          {autopilotState === 'complete' && (
            <button
              onClick={handleComplete}
              className="w-full bg-synthetic-gradient text-glow-white py-4 font-semibold hover:shadow-xl transition-all rounded-b-3xl border-t border-rizz-pink/30"
            >
              {isMatch ? 'Add to Chat & Create Match!' : 'Add to Chat History'}
            </button>
          )}
        </div>

        {/* API Key Notice */}
        {!import.meta.env.VITE_OPENROUTER_API_KEY && (
          <div className="relative z-10 p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-t border-yellow-500/30 rounded-b-3xl backdrop-blur-lg">
            <p className="text-yellow-200 text-xs text-center">
              Autopilot requires an OpenRouter API key.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}