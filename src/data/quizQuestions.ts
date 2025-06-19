import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: "Hey there! I'm Aurora, your personality guide. Let's start simple - how do you feel about trying new experiences?",
    type: 'scale',
    trait: 'openness'
  },
  {
    id: '2',
    question: "When you're at a party, do you tend to be the life of the party or prefer intimate conversations?",
    type: 'scale',
    trait: 'extraversion'
  },
  {
    id: '3',
    question: "How important is it for you to stick to schedules and plans?",
    type: 'scale',
    trait: 'conscientiousness'
  },
  {
    id: '4',
    question: "When someone is upset, your first instinct is usually to:",
    type: 'choice',
    options: [
      "Listen and offer emotional support",
      "Give practical advice to solve the problem", 
      "Give them space to figure it out",
      "Try to cheer them up with humor"
    ],
    trait: 'agreeableness'
  },
  {
    id: '5',
    question: "How do you typically handle stress or pressure?",
    type: 'scale',
    trait: 'neuroticism'
  },
  {
    id: '6',
    question: "Would you rather spend your ideal weekend exploring a new city or relaxing at home with a good book?",
    type: 'choice',
    options: [
      "Definitely exploring a new city",
      "Probably exploring, but with some downtime",
      "Probably at home, but open to short adventures",
      "Definitely relaxing at home"
    ],
    trait: 'openness'
  },
  {
    id: '7',
    question: "In group projects, you usually:",
    type: 'choice',
    options: [
      "Take charge and organize everything",
      "Contribute ideas and help coordinate",
      "Do your part and support others",
      "Prefer to work on specific tasks independently"
    ],
    trait: 'extraversion'
  },
  {
    id: '8',
    question: "How do you feel about making detailed plans for the future?",
    type: 'scale',
    trait: 'conscientiousness'
  }
];