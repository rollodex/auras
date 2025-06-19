import { Match, ChatMessage } from '../types';

export class DataService {
  private static instance: DataService;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Matches
  getMatches(): Match[] {
    const stored = localStorage.getItem('userMatches');
    return stored ? JSON.parse(stored) : [];
  }

  saveMatches(matches: Match[]): void {
    localStorage.setItem('userMatches', JSON.stringify(matches));
  }

  addMatch(match: Match): void {
    const matches = this.getMatches();
    const existingIndex = matches.findIndex(m => m.id === match.id);
    
    if (existingIndex >= 0) {
      matches[existingIndex] = match;
    } else {
      matches.push(match);
    }
    
    this.saveMatches(matches);
  }

  updateMatchStatus(matchId: string, status: Match['status']): void {
    const matches = this.getMatches();
    const matchIndex = matches.findIndex(m => m.id === matchId);
    
    if (matchIndex >= 0) {
      matches[matchIndex].status = status;
      this.saveMatches(matches);
    }
  }

  // Chat Messages
  getChatMessages(userId: string): ChatMessage[] {
    const stored = localStorage.getItem(`chat_${userId}`);
    return stored ? JSON.parse(stored).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })) : [];
  }

  saveChatMessages(userId: string, messages: ChatMessage[]): void {
    localStorage.setItem(`chat_${userId}`, JSON.stringify(messages));
  }

  addChatMessage(userId: string, message: ChatMessage): void {
    const messages = this.getChatMessages(userId);
    messages.push(message);
    this.saveChatMessages(userId, messages);
  }

  // User Preferences
  getUserPreferences() {
    const stored = localStorage.getItem('userPreferences');
    return stored ? JSON.parse(stored) : {
      ageRange: { min: 18, max: 35 },
      genderPreference: ['male', 'female', 'non-binary'],
      maxDistance: 50
    };
  }

  saveUserPreferences(preferences: any): void {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }

  // Clear all user data
  clearUserData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('chat_') || key.startsWith('user')) {
        localStorage.removeItem(key);
      }
    });
  }
}