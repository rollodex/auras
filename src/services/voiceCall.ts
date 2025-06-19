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
  private baseUrl = 'https://api.elevenlabs.io/v1/convai/conversations';
  private conversation: any = null;
  private isCallActive = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
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
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found. Voice calls require an API key.');
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
        agent_id: import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'default',
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
        throw new Error(`Failed to create conversation: ${response.status}`);
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
}