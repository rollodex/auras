export interface User {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  bio: string;
  interests: string[];
  personality: PersonalityProfile;
  photos: string[];
  auraColor: string;
  location?: string;
}

export interface PersonalityProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  summary: string;
  aiPersona: string;
  detailedPrompt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'scale' | 'choice' | 'text';
  options?: string[];
  trait: keyof Omit<PersonalityProfile, 'summary' | 'aiPersona' | 'detailedPrompt'>;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'bot' | 'system';
  timestamp: Date;
}

export interface Match {
  id: string;
  user: User;
  compatibility: number;
  chatHistory: ChatMessage[];
  status: 'pending' | 'matched' | 'declined';
}

export interface UserPreferences {
  ageRange: {
    min: number;
    max: number;
  };
  genderPreference: ('male' | 'female' | 'non-binary')[];
  maxDistance: number;
}