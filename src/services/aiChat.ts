interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class AIChatService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    // In a real app, this would be stored securely
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  async generateResponse(
    userMessage: string, 
    aiPersonaPrompt: string, 
    userName: string,
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
    },
    chatHistory: Array<{
      content: string;
      sender: 'user' | 'ai';
      timestamp: Date;
    }> = []
  ): Promise<string> {
    if (!this.apiKey) {
      // Fallback to simulated responses if no API key
      return this.generateFallbackResponse(userMessage, aiPersonaPrompt, userProfile);
    }

    try {
      // Build user context for the AI persona
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
ABOUT THE PERSON YOU'RE CHATTING WITH:
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

      const systemPrompt = `${aiPersonaPrompt}

${userContext}

IMPORTANT INSTRUCTIONS:
- You are roleplaying as this person in a dating app conversation
- Respond naturally and authentically as this character would
- Keep responses conversational and engaging (1-3 sentences typically)
- Show genuine interest in the other person by referencing their profile
- Stay true to your personality traits and interests
- Don't break character or mention that you're an AI
- Be flirty and charming when appropriate, but respectful
- Ask follow-up questions to keep the conversation flowing
- Reference your interests and personality naturally in responses
- Use the information about the user to make personalized comments and compliments
- Find ways to connect your interests with theirs
- Be genuinely curious about them as a person
- Remember and reference things from earlier in the conversation to show you're paying attention`;

      // Build the conversation history for the API
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];

      // Add the chat history to provide context
      chatHistory.forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      // Add the current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Auras Dating App'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: messages,
          temperature: 0.8,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      return data.choices[0]?.message?.content || this.generateFallbackResponse(userMessage, aiPersonaPrompt, userProfile);
    } catch (error) {
      console.error('AI Chat API Error:', error);
      return this.generateFallbackResponse(userMessage, aiPersonaPrompt, userProfile);
    }
  }

  private generateFallbackResponse(userMessage: string, aiPersonaPrompt: string, userProfile?: any): string {
    // Extract key traits from the persona prompt for fallback responses
    const isAdventurous = aiPersonaPrompt.includes('adventure') || aiPersonaPrompt.includes('travel');
    const isCreative = aiPersonaPrompt.includes('creative') || aiPersonaPrompt.includes('art') || aiPersonaPrompt.includes('music');
    const isFitnessOriented = aiPersonaPrompt.includes('fitness') || aiPersonaPrompt.includes('gym');
    const isIntellectual = aiPersonaPrompt.includes('book') || aiPersonaPrompt.includes('deep') || aiPersonaPrompt.includes('psychology');

    const responses = [];

    // Personalized responses based on user profile
    if (userProfile) {
      const userInterests = userProfile.interests || [];
      const userName = userProfile.name || 'you';
      
      // Find common interests
      const commonInterests = [];
      if (isAdventurous && (userInterests.includes('Travel') || userInterests.includes('Hiking'))) {
        commonInterests.push('adventure');
      }
      if (isCreative && (userInterests.includes('Art') || userInterests.includes('Music') || userInterests.includes('Photography'))) {
        commonInterests.push('creativity');
      }
      if (isFitnessOriented && (userInterests.includes('Fitness') || userInterests.includes('Running'))) {
        commonInterests.push('fitness');
      }

      if (commonInterests.length > 0) {
        responses.push(
          `${userName}, I love that we both are into ${commonInterests[0]}! What got you started with that?`,
          `It's so cool that you're into ${userInterests[0]} - I can already tell we'd have amazing conversations about that!`,
          `I noticed you mentioned ${userInterests[0]} in your profile, ${userName}. That's actually something I'm really passionate about too!`
        );
      }

      // Compliments based on bio or interests
      if (userProfile.bio) {
        responses.push(
          `Your bio really caught my attention, ${userName}. You seem like such a genuine person!`,
          `I love your perspective on life, ${userName}. There's something really attractive about someone who knows what they want.`,
          `${userName}, you have such interesting hobbies! I'd love to hear more about what drives your passions.`
        );
      }

      // Flirty responses based on personality compatibility
      if (userProfile.personality) {
        if (userProfile.personality.openness > 70 && isAdventurous) {
          responses.push(
            `${userName}, I can tell you're someone who's up for anything - that's exactly the kind of energy I'm drawn to!`,
            `You seem like the type who'd say yes to a spontaneous adventure, ${userName}. I find that incredibly attractive.`
          );
        }
        if (userProfile.personality.extraversion > 70 && aiPersonaPrompt.includes('social')) {
          responses.push(
            `${userName}, I love how outgoing you seem! I bet you're the life of the party.`,
            `You have such great social energy, ${userName}. I can already imagine us having the best time together.`
          );
        }
      }
    }

    // General persona-based responses
    if (isAdventurous) {
      responses.push(
        "That sounds amazing! I'm always up for new experiences. What's the most spontaneous thing you've done recently?",
        "I love that energy! Speaking of adventures, have you ever done anything that completely pushed you out of your comfort zone?",
        "You seem like someone who'd be fun to explore new places with! What's on your travel bucket list?"
      );
    }

    if (isCreative) {
      responses.push(
        "That's so interesting! I'm really drawn to creative people. What inspires you most in your daily life?",
        "I love how you think! There's something beautiful about finding creativity in unexpected places, don't you think?",
        "You have such a unique perspective! I'd love to hear more about what you're passionate about."
      );
    }

    if (isFitnessOriented) {
      responses.push(
        "That's awesome! I'm all about that growth mindset. What goals are you working toward right now?",
        "I love meeting people who are driven! There's something attractive about someone who pushes themselves to be better.",
        "You sound like someone who knows what they want! What motivates you to keep pushing forward?"
      );
    }

    if (isIntellectual) {
      responses.push(
        "That's such a thoughtful way to look at it. I find myself drawn to people who think deeply about things.",
        "I really appreciate conversations like this. What's something you've been pondering lately?",
        "You have such an interesting mind! I'd love to know what books or ideas have shaped your perspective recently."
      );
    }

    // General fallback responses
    responses.push(
      "That's really cool! Tell me more about that.",
      "I love your perspective on that! What drew you to feel that way?",
      "You seem like such a genuine person. What's something that always makes you smile?",
      "That's fascinating! I feel like we could have some really great conversations.",
      "I'm really enjoying getting to know you! What's something you're excited about lately?"
    );

    return responses[Math.floor(Math.random() * responses.length)];
  }
}