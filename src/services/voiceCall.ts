import { ElevenLabsClient } from 'elevenlabs/client';

export class VoiceCallService {
  private client: ElevenLabsClient;
  private conversation: any = null;
  private isCallActive = false;

  constructor() {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    if (apiKey) {
      this.client = new ElevenLabsClient({ apiKey });
    }
  }

  async startCall(agentId: string): Promise<any> {
    if (!this.client) {
      throw new Error('ElevenLabs client not initialized. Please check your API key.');
    }

    if (!agentId) {
      throw new Error('Agent ID is required to start a conversation.');
    }

    try {
      // Use the correct API from @elevenlabs/client
      const conversation = await this.client.conversationalAi.createConversation({
        agentId: agentId,
      });

      this.conversation = conversation;
      this.isCallActive = true;
      return conversation;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }

  endCall(): void {
    this.isCallActive = false;
    this.conversation = null;
  }

  isActive(): boolean {
    return this.isCallActive;
  }

  hasRequiredConfig(): boolean {
    return !!(import.meta.env.VITE_ELEVENLABS_API_KEY && import.meta.env.VITE_ELEVENLABS_AGENT_ID);
  }

  getConfigError(): string | null {
    if (!import.meta.env.VITE_ELEVENLABS_API_KEY) {
      return 'ElevenLabs API key is missing. Please add VITE_ELEVENLABS_API_KEY to your .env file.';
    }
    if (!import.meta.env.VITE_ELEVENLABS_AGENT_ID) {
      return 'ElevenLabs Agent ID is missing. Please add VITE_ELEVENLABS_AGENT_ID to your .env file.';
    }
    return null;
  }
}