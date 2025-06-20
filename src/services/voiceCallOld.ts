interface ElevenLabsConversationConfig {
  agent_id: string;
  override_agent_config?: {
    prompt?: {
      prompt: string;
    };
    first_message?: string;
    language?: string;
  };
}

interface ElevenLabsSignedUrl {
  signed_url: string;
}

export class VoiceCallService {
  private apiKey: string;
  private agentId: string;
  private baseUrl = 'https://api.elevenlabs.io/v1/convai/conversations';
  private conversation: any = null;
  private isCallActive = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';
  }

  private validateCredentials(): { isValid: boolean; error?: string } {
    if (!this.apiKey) {
      return {
        isValid: false,
        error: 'ElevenLabs API key is missing. Please add VITE_ELEVENLABS_API_KEY to your .env file.'
      };
    }

    if (!this.agentId) {
      return {
        isValid: false,
        error: 'ElevenLabs Agent ID is missing. Please add VITE_ELEVENLABS_AGENT_ID to your .env file.'
      };
    }

    return { isValid: true };
  }

  async startCall(
    userName: string, 
    personalityPrompt: string, 
    aiPersona: string,
    onCallStateChange?: (state: 'connecting' | 'connected' | 'ended' | 'error') => void,
    userProfile?: {
      name: string;
      age: number;
      bio: string;
      interests: string[];
      personality: {
        openness: number;
        conscientiousness: number;
        extraversion: number;
        agreeableness: number;
        neuroticism: number;
        aiPersona: string;
      };
    }
  ): Promise<string | null> {
    // Validate credentials first
    const validation = this.validateCredentials();
    if (!validation.isValid) {
      console.warn('Voice call validation failed:', validation.error);
      onCallStateChange?.('error');
      return null;
    }

    try {
      onCallStateChange?.('connecting');

      // Build user context for voice calls
      let userContext = '';
      if (userProfile) {
        const personalityTraits = [];
        if (userProfile.personality.openness > 70) personalityTraits.push('very open to new experiences');
        else if (userProfile.personality.openness < 40) personalityTraits.push('prefers familiar routines');
        
        if (userProfile.personality.extraversion > 70) personalityTraits.push('outgoing and social');
        else if (userProfile.personality.extraversion < 40) personalityTraits.push('more introverted and thoughtful');
        
        if (userProfile.personality.conscientiousness > 70) personalityTraits.push('organized and planned');
        else if (userProfile.personality.conscientiousness < 40) personalityTraits.push('spontaneous and flexible');

        userContext = `
ABOUT THE PERSON YOU'RE TALKING TO:
- Name: ${userProfile.name}, ${userProfile.age} years old
- Bio: "${userProfile.bio}"
- Interests: ${userProfile.interests.join(', ')}
- Personality: They seem ${personalityTraits.join(', ')}
- Their AI persona says: "${userProfile.personality.aiPersona}"

Use this information to:
- Reference their interests naturally in conversation
- Compliment them on things that align with your personality
- Find common ground between your interests and theirs
- Flirt appropriately based on shared interests or personality compatibility
- Ask follow-up questions about their bio or interests
- Make personalized remarks that show you're paying attention to who they are`;
      }

      // Create a conversation with the persona
      const conversationConfig: ElevenLabsConversationConfig = {
        agent_id: this.agentId,
        override_agent_config: {
          prompt: {
            prompt: `${personalityPrompt}

${userContext}

IMPORTANT VOICE CALL INSTRUCTIONS:
- You are ${userName} in a voice conversation on a dating app
- Speak naturally and conversationally as this person would
- Keep responses concise but engaging (voice conversations flow differently than text)
- Show genuine interest in getting to know the caller by referencing their profile
- Use natural speech patterns, including occasional "um", "like", or brief pauses
- Be flirty and charming when appropriate, but always respectful
- Ask follow-up questions to keep the conversation flowing
- Reference your interests and personality naturally
- Don't mention that you're an AI - you ARE this person
- Speak as if you're genuinely interested in potentially dating this person
- Use a warm, friendly tone that matches your personality
- Use the information about the caller to make personalized comments and compliments
- Find ways to connect your interests with theirs
- Be genuinely curious about them as a person`
          },
          first_message: userProfile 
            ? `Hey ${userProfile.name}! This is so cool that we can actually talk now. I saw your profile and you seem really interesting - especially the part about ${userProfile.interests[0] || 'your interests'}. ${aiPersona.slice(0, 80)}... I'm excited to get to know you better!`
            : `Hey! This is so cool that we can actually talk now. ${aiPersona.slice(0, 100)}... I'm excited to get to know you better!`,
          language: 'en'
        }
      };

      console.log('Creating conversation with config:', {
        agent_id: this.agentId,
        hasPrompt: !!conversationConfig.override_agent_config?.prompt?.prompt
      });

      // Get signed URL for the conversation
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(conversationConfig)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your VITE_ELEVENLABS_API_KEY in the .env file.';
        } else if (response.status === 404) {
          errorMessage = 'Agent not found. Please check your VITE_ELEVENLABS_AGENT_ID in the .env file.';
        } else if (response.status === 405) {
          errorMessage = 'Method not allowed. This usually indicates an issue with API credentials or agent configuration.';
        }
        
        console.error('ElevenLabs API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          agentId: this.agentId
        });
        
        throw new Error(errorMessage);
      }

      const data: ElevenLabsSignedUrl = await response.json();
      this.isCallActive = true;
      onCallStateChange?.('connected');
      
      return data.signed_url;
    } catch (error) {
      console.error('Voice call error:', error);
      onCallStateChange?.('error');
      return null;
    }
  }

  endCall() {
    this.isCallActive = false;
    this.conversation = null;
  }

  isActive(): boolean {
    return this.isCallActive;
  }

  getValidationError(): string | null {
    const validation = this.validateCredentials();
    return validation.isValid ? null : validation.error || 'Unknown validation error';
  }
}