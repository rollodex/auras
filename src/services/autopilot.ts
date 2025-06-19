interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AutopilotResult {
  success: boolean;
  messages?: Array<{
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
  }>;
  isMatch?: boolean;
  reasoning?: string;
}

export class AutopilotService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  }

  async simulateConversation(user1: any, user2: any): Promise<AutopilotResult> {
    if (!this.apiKey) {
      return this.generateFallbackSimulation(user1, user2);
    }

    try {
      // First, generate the conversation
      const conversationResult = await this.generateConversation(user1, user2);
      
      if (!conversationResult.success || !conversationResult.messages) {
        return this.generateFallbackSimulation(user1, user2);
      }

      // Then, analyze if it's a match
      const matchResult = await this.analyzeMatch(user1, user2, conversationResult.messages);

      return {
        success: true,
        messages: conversationResult.messages,
        isMatch: matchResult.isMatch,
        reasoning: matchResult.reasoning
      };
    } catch (error) {
      console.error('Autopilot simulation error:', error);
      return this.generateFallbackSimulation(user1, user2);
    }
  }

  private async generateConversation(user1: any, user2: any): Promise<AutopilotResult> {
    const conversationPrompt = `You are simulating a dating app conversation between two people. Generate a realistic 8-10 message conversation (alternating between them) that shows their personalities and compatibility.

PERSON 1 (${user1.name}):
- Age: ${user1.age}
- Bio: "${user1.bio}"
- Interests: ${user1.interests.join(', ')}
- Personality: ${user1.personality.aiPersona}

PERSON 2 (${user2.name}):
- Age: ${user2.age}
- Bio: "${user2.bio}"
- Interests: ${user2.interests.join(', ')}
- Personality: ${user2.personality.aiPersona}

INSTRUCTIONS:
- Start with ${user1.name} sending the first message
- Alternate between them naturally
- Keep messages realistic and conversational (1-3 sentences each)
- Show their personalities through their communication style
- Reference their interests and bios naturally
- Include some flirting and getting-to-know-you questions
- Make it feel like a real dating app conversation
- Generate exactly 8-10 messages total

Format your response as a JSON array like this:
[
  {"sender": "${user1.name}", "content": "Hey! I saw your profile and..."},
  {"sender": "${user2.name}", "content": "Hi! Thanks for reaching out..."},
  ...
]

IMPORTANT: Only return the JSON array, no other text.`;

    try {
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
          messages: [
            {
              role: 'user',
              content: conversationPrompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in response');
      }

      // Parse the JSON response
      const conversationData = JSON.parse(content);
      
      // Convert to our message format
      const messages = conversationData.map((msg: any, index: number) => ({
        id: `autopilot_${index}`,
        content: msg.content,
        sender: msg.sender === user1.name ? 'user' : 'ai',
        timestamp: new Date(Date.now() + index * 1000) // Stagger timestamps
      }));

      return {
        success: true,
        messages
      };
    } catch (error) {
      console.error('Conversation generation error:', error);
      return { success: false };
    }
  }

  private async analyzeMatch(user1: any, user2: any, messages: any[]): Promise<{isMatch: boolean, reasoning: string}> {
    const analysisPrompt = `Analyze this dating app conversation and determine if these two people would be a good match.

PERSON 1 (${user1.name}):
- Age: ${user1.age}
- Bio: "${user1.bio}"
- Interests: ${user1.interests.join(', ')}
- Personality traits: Openness ${user1.personality.openness}/100, Extraversion ${user1.personality.extraversion}/100, Conscientiousness ${user1.personality.conscientiousness}/100, Agreeableness ${user1.personality.agreeableness}/100, Emotional Stability ${100 - user1.personality.neuroticism}/100

PERSON 2 (${user2.name}):
- Age: ${user2.age}
- Bio: "${user2.bio}"
- Interests: ${user2.interests.join(', ')}
- Personality traits: Openness ${user2.personality.openness}/100, Extraversion ${user2.personality.extraversion}/100, Conscientiousness ${user2.personality.conscientiousness}/100, Agreeableness ${user2.personality.agreeableness}/100, Emotional Stability ${100 - user2.personality.neuroticism}/100

CONVERSATION:
${messages.map(msg => `${msg.sender === 'user' ? user1.name : user2.name}: ${msg.content}`).join('\n')}

ANALYSIS CRITERIA:
- Shared interests and values
- Personality compatibility
- Communication style compatibility
- Mutual interest and engagement in the conversation
- Overall chemistry and connection

Respond with a JSON object in this exact format:
{
  "isMatch": true/false,
  "reasoning": "A 2-3 sentence explanation of why they are or aren't a match based on the conversation and their profiles"
}

IMPORTANT: Only return the JSON object, no other text.`;

    try {
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
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in response');
      }

      const analysisResult = JSON.parse(content);
      return {
        isMatch: analysisResult.isMatch,
        reasoning: analysisResult.reasoning
      };
    } catch (error) {
      console.error('Match analysis error:', error);
      // Fallback to random decision with basic reasoning
      const isMatch = Math.random() > 0.4; // 60% chance of match
      return {
        isMatch,
        reasoning: isMatch 
          ? "Based on your shared interests and compatible personalities, you two seem like you'd have great chemistry together!"
          : "While you both seem like great people, your communication styles and interests don't quite align for a romantic connection."
      };
    }
  }

  private generateFallbackSimulation(user1: any, user2: any): AutopilotResult {
    // Generate a simple fallback conversation
    const messages = [
      {
        id: 'fallback_1',
        content: `Hey ${user2.name}! I saw your profile and loved that you're into ${user2.interests[0] || 'interesting things'}. What got you started with that?`,
        sender: 'user' as const,
        timestamp: new Date(Date.now())
      },
      {
        id: 'fallback_2',
        content: `Hi ${user1.name}! Thanks for reaching out! I've been into ${user2.interests[0] || 'that'} for a while now. I noticed you're into ${user1.interests[0] || 'cool stuff'} too - that's awesome!`,
        sender: 'ai' as const,
        timestamp: new Date(Date.now() + 1000)
      },
      {
        id: 'fallback_3',
        content: `Yeah! I love how it ${user1.interests[0]?.includes('Travel') ? 'lets me explore new places' : 'keeps me active'}. Your bio mentioned ${user2.bio.split(' ').slice(0, 3).join(' ')}... - that really resonates with me!`,
        sender: 'user' as const,
        timestamp: new Date(Date.now() + 2000)
      },
      {
        id: 'fallback_4',
        content: `That's so sweet of you to say! I really believe in ${user2.bio.includes('adventure') ? 'living life to the fullest' : 'being authentic'}. What's something you're really passionate about lately?`,
        sender: 'ai' as const,
        timestamp: new Date(Date.now() + 3000)
      },
      {
        id: 'fallback_5',
        content: `Honestly, I've been really into ${user1.interests[1] || 'exploring new things'} recently. There's something about it that just makes me feel alive, you know?`,
        sender: 'user' as const,
        timestamp: new Date(Date.now() + 4000)
      },
      {
        id: 'fallback_6',
        content: `I totally get that! You seem like someone who really goes after what they want. I find that really attractive in a person. 😊`,
        sender: 'ai' as const,
        timestamp: new Date(Date.now() + 5000)
      }
    ];

    // Simple compatibility check based on shared interests
    const sharedInterests = user1.interests.filter((interest: string) => 
      user2.interests.includes(interest)
    );
    
    const personalityCompatibility = Math.abs(user1.personality.extraversion - user2.personality.extraversion) < 40;
    const isMatch = sharedInterests.length > 0 || personalityCompatibility || Math.random() > 0.3;

    const reasoning = isMatch
      ? sharedInterests.length > 0
        ? `You both share a love for ${sharedInterests[0]} and seem to have great chemistry in your conversation. Your personalities complement each other well!`
        : "Even though you have different interests, your conversation flows naturally and you both seem genuinely interested in getting to know each other better."
      : "While you're both interesting people, your conversation suggests you might be looking for different things or have different communication styles.";

    return {
      success: true,
      messages,
      isMatch,
      reasoning
    };
  }
}