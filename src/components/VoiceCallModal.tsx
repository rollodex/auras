import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, X, AlertCircle, Loader, Mic, MicOff } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface VoiceCallModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

type CallState = 'idle' | 'requesting-mic' | 'connecting' | 'connected' | 'ended' | 'error';

export default function VoiceCallModal({ user, isOpen, onClose }: VoiceCallModalProps) {
  const { user: currentUser } = useAuth();
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [micPermission, setMicPermission] = useState<boolean>(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Conversation connected');
      setCallState('connected');
    },
    onDisconnect: () => {
      console.log('Conversation disconnected');
      setCallState('ended');
    },
    onMessage: (message) => {
      console.log('Message received:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setCallState('error');
      setErrorMessage(error.message || 'An error occurred during the call');
    }
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  useEffect(() => {
    if (!isOpen) {
      setCallState('idle');
      setCallDuration(0);
      setErrorMessage('');
      setConversationId('');
      setMicPermission(false);
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
    }
  }, [isOpen, conversation]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const requestMicrophonePermission = async () => {
    try {
      setCallState('requesting-mic');
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setCallState('error');
      setErrorMessage('Microphone access is required for voice calls. Please allow microphone access and try again.');
      return false;
    }
  };

  const startCall = async () => {
    const agentId = user.agentID;
    
    if (!agentId) {
      setCallState('error');
      setErrorMessage(`${user.name} doesn't have a voice agent configured yet. Voice calls are not available for this profile.`);
      return;
    }

    // Request microphone permission first
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    setCallState('connecting');
    setErrorMessage('');

    try {
      // Start the conversation session with the user's specific agent ID
      const id = await conversation.startSession({ 
        agentId: agentId 
      });
      
      setConversationId(id);
      // State will be updated to 'connected' via onConnect callback
    } catch (error) {
      console.error('Failed to start voice call:', error);
      setCallState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start voice call');
    }
  };

  const endCall = async () => {
    try {
      await conversation.endSession();
      setCallState('ended');
      setTimeout(() => {
        onClose();
        setCallState('idle');
        setCallDuration(0);
      }, 2000);
    } catch (error) {
      console.error('Error ending call:', error);
      // Still close the modal even if there's an error
      onClose();
      setCallState('idle');
      setCallDuration(0);
    }
  };

  const handleClose = () => {
    if (callState === 'connected' || callState === 'connecting') {
      endCall();
    } else {
      onClose();
      setCallState('idle');
      setCallDuration(0);
      setErrorMessage('');
    }
  };

  if (!isOpen) return null;

  const hasAgentId = !!user.agentID;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-lg rounded-3xl p-8 border border-white/20 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-white">Voice Call</h3>
          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="text-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-4 border-white/20">
              <img
                src={user.photos[0]}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            {callState === 'connected' && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
            {conversation.isSpeaking && (
              <div className="absolute -top-2 -right-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </div>
          <h4 className="text-2xl font-bold text-white mb-1">{user.name}</h4>
          <p className="text-white/70 text-sm mb-2">AI Persona Voice Call</p>
          
          {callState === 'connected' && (
            <div className="bg-white/10 rounded-full px-4 py-2 inline-block">
              <span className="text-white text-sm font-mono">{formatDuration(callDuration)}</span>
            </div>
          )}

       
        </div>

        {/* Call States */}
        {callState === 'idle' && (
          <div className="text-center mb-8">
            <p className="text-white/80 mb-6 leading-relaxed">
              Ready to have a voice conversation with {user.name}'s AI persona? 
              {currentUser && ` They'll know about your interests and can chat about ${currentUser.interests[0] || 'your hobbies'}!`}
            </p>
            <button
              onClick={startCall}
              disabled={!hasAgentId}
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all transform ${
                hasAgentId
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl hover:scale-105'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Phone className="w-8 h-8 text-white" />
            </button>
            <p className="text-white/60 text-sm mt-4">
              {hasAgentId ? 'Tap to start call' : `${user.name} doesn't have voice calls enabled`}
            </p>
          </div>
        )}

        {callState === 'requesting-mic' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-medium mb-2">Requesting Microphone</p>
            <p className="text-white/70 text-sm">Please allow microphone access to start the call</p>
          </div>
        )}

        {callState === 'connecting' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-white text-lg font-medium mb-2">Connecting...</p>
            <p className="text-white/70 text-sm">Setting up your voice call with {user.name}</p>
          </div>
        )}

        {callState === 'connected' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-medium mb-2">Connected!</p>
            <p className="text-white/70 text-sm">You're now talking with {user.name}'s AI persona</p>
            
            {/* Speaking Indicator */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                conversation.isSpeaking ? 'bg-blue-500/30 border border-blue-500/50' : 'bg-white/10'
              }`}>
                <Mic className="w-4 h-4 text-white" />
                <span className="text-white text-sm">
                  {conversation.isSpeaking ? 'AI Speaking' : 'Listening'}
                </span>
              </div>
            </div>
          </div>
        )}

        {callState === 'error' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-medium mb-2">Call Failed</p>
            <p className="text-white/70 text-sm mb-4">
              {errorMessage || 'Unable to connect. Please try again.'}
            </p>
            <button
              onClick={() => setCallState('idle')}
              className="bg-white/20 text-white px-6 py-2 rounded-xl hover:bg-white/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {callState === 'ended' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneOff className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-medium mb-2">Call Ended</p>
            <p className="text-white/70 text-sm">
              Duration: {formatDuration(callDuration)}
            </p>
          </div>
        )}

        {/* Call Controls */}
        {callState === 'connected' && (
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={endCall}
              className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-105"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
            
            {/* Volume Control */}
            <button
              onClick={() => conversation.setVolume({ volume: 0.5 })}
              className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all transform hover:scale-105"
              title="Adjust volume"
            >
              <span className="text-white text-sm">🔊</span>
            </button>
          </div>
        )}

        {/* Agent Configuration Notice */}
        {!hasAgentId && (
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-200 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-200 text-sm">
                <p className="font-medium mb-2">Voice calls not available for {user.name}</p>
                <p className="text-xs opacity-80">
                  This profile doesn't have a voice agent configured yet. Each user needs their own ElevenLabs agent ID for personalized voice conversations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
      
          )}
        </div>
      </div>
    </div>
  );
}