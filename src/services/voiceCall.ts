export class VoiceCallService {
  private isCallActive = false;

  constructor() {
    // Simple service for managing call state
  }

  startCall(): void {
    this.isCallActive = true;
  }

  endCall(): void {
    this.isCallActive = false;
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