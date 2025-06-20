import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X, Loader, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { VoiceCallService } from '../services/voiceCall';
import { useAuth } from '../contexts/AuthContext';

interface VoiceCallModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

type CallState = 'idle' | 'connecting' | 'connected' | 'ended' | 'error';

export default function VoiceCallModal({ user, isOpen, onClose }: VoiceCallModalProps) {
  const { user: currentUser } = useAuth();
  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [voiceService] = useState(new VoiceCallService());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (callState === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callState]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    // Check for validation errors before starting
    const validationError = voiceService.getValidationError();
    if (validationError) {
      setErrorMessage(validationError);
      setCallState('error');
      return;
    }

    setCallState('connecting');
    setCallDuration(0);
    setErrorMessage('');

    // Prepare user profile for the voice call
    const userProfile = currentUser ? {
      name: currentUser.name,
      age: currentUser.age,
      bio: currentUser.bio,
      interests: currentUser.interests,
      personality: currentUser.personality
    } : undefined;

    const signedUrl = await voiceService.startCall(
      user.name,
      user.personality.detailedPrompt,
      user.personality.aiPersona,
      (state) => {
        setCallState(state);
        if (state === 'error') {
          setErrorMessage('Failed to connect to voice service. Please check your API configuration.');
        }
      },
      userProfile
    );

    if (signedUrl && iframeRef.current) {
      iframeRef.current.src = signedUrl;
    }
  };

  const endCall = () => {
    setCallState('ended');
    voiceService.endCall();
    if (iframeRef.current) {
      iframeRef.current.src = '';
    }
    setTimeout(() => {
      onClose();
      setCallState('idle');
      setCallDuration(0);
      setErrorMessage('');
    }, 2000);
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

  const hasApiKey = !!import.meta.env.VITE_ELEVENLABS_API_KEY;
  const hasAgentId = !!import.meta.env.VITE_ELEVENLABS_AGENT_ID;

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
              disabled={!hasApiKey || !hasAgentId}
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all transform ${
                hasApiKey && hasAgentId
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl hover:scale-105'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Phone className="w-8 h-8 text-white" />
            </button>
            <p className="text-white/60 text-sm mt-4">
              {hasApiKey && hasAgentId ? 'Tap to start call' : 'API configuration required'}
            </p>
          </div>
        )}

        {callState === 'connecting' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-white text-lg font-medium mb-2">Connecting...</p>
            <p className="text-white/70 text-sm">Setting up your personalized voice call with {user.name}</p>
          </div>
        )}

        {callState === 'error' && (
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-lg font-medium mb-2">Call Failed</p>
            <p className="text-white/70 text-sm mb-4">
              {errorMessage || 'Unable to connect. Please check your API configuration.'}
            </p>
            <button
              onClick={() => {
                setCallState('idle');
                setErrorMessage('');
              }}
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

        {/* ElevenLabs Conversation Widget */}
        {(callState === 'connecting' || callState === 'connected') && (
          <div className="mb-8">
            <iframe
              ref={iframeRef}
              className="w-full h-64 rounded-2xl border border-white/20"
              allow="microphone"
              style={{ display: callState === 'connected' ? 'block' : 'none' }}
            />
          </div>
        )}

        {/* Call Controls */}
        {callState === 'connected' && (
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={endCall}
              className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all transform hover:scale-105"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isSpeakerOn 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        )}

        {/* API Configuration Notice */}
        {(!hasApiKey || !hasAgentId) && (
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-200 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-200 text-sm">
                <p className="font-medium mb-2">Voice calls require ElevenLabs configuration:</p>
                <ul className="space-y-1 text-xs">
                  {!hasApiKey && <li>• Add VITE_ELEVENLABS_API_KEY to your .env file</li>}
                  {!hasAgentId && <li>• Add VITE_ELEVENLABS_AGENT_ID to your .env file</li>}
                </ul>
                <p className="mt-2 text-xs opacity-80">
                  Get your API key and create an agent at elevenlabs.io
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}