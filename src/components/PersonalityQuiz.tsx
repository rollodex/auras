import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { quizQuestions } from '../data/quizQuestions';
import { PersonalityProfile } from '../types';

export default function PersonalityQuiz() {
  const navigate = useNavigate();
  const { updateUserPersonality } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [question.trait]: (answers[question.trait] || 0) + value };
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500);
    } else {
      // Quiz complete, calculate personality profile
      setTimeout(() => {
        setIsComplete(true);
        const profile = calculatePersonality(newAnswers);
        updateUserPersonality(profile);
      }, 500);
    }
  };

  const calculatePersonality = (answers: Record<string, number>): PersonalityProfile => {
    const normalize = (value: number, max: number) => Math.min(100, Math.max(0, (value / max) * 100));
    
    const openness = normalize(answers.openness || 0, 2);
    const conscientiousness = normalize(answers.conscientiousness || 0, 2);
    const extraversion = normalize(answers.extraversion || 0, 2);
    const agreeableness = normalize(answers.agreeableness || 0, 2);
    const neuroticism = 100 - normalize(answers.neuroticism || 0, 2); // Invert for emotional stability

    // Generate AI persona based on personality traits
    const generateAIPersona = () => {
      let persona = "I'm someone who ";
      
      if (openness > 70) persona += "loves exploring new ideas and experiences, ";
      else if (openness < 40) persona += "appreciates familiar routines and proven approaches, ";
      else persona += "enjoys a good balance of new experiences and comfortable traditions, ";

      if (extraversion > 70) persona += "thrives in social settings and energizes around people, ";
      else if (extraversion < 40) persona += "values deep one-on-one conversations and quiet moments, ";
      else persona += "enjoys both social gatherings and peaceful alone time, ";

      if (conscientiousness > 70) persona += "believes in planning ahead and staying organized, ";
      else if (conscientiousness < 40) persona += "goes with the flow and embraces spontaneity, ";
      else persona += "likes having some structure while staying flexible, ";

      if (agreeableness > 70) persona += "deeply cares about others and seeks harmony in relationships.";
      else if (agreeableness < 40) persona += "values honesty and direct communication above all.";
      else persona += "balances empathy with authentic self-expression.";

      return persona;
    };

    // Generate detailed prompt for AI conversations
    const generateDetailedPrompt = () => {
      return `You are a person with the following personality traits (scored 0-100):
- Openness: ${Math.round(openness)}/100 (${openness > 70 ? 'very creative and open to new experiences' : openness > 40 ? 'moderately open to new ideas' : 'prefers familiar and proven approaches'})
- Conscientiousness: ${Math.round(conscientiousness)}/100 (${conscientiousness > 70 ? 'highly organized and planned' : conscientiousness > 40 ? 'moderately structured' : 'spontaneous and flexible'})
- Extraversion: ${Math.round(extraversion)}/100 (${extraversion > 70 ? 'very outgoing and social' : extraversion > 40 ? 'ambivert - social but also enjoys alone time' : 'introverted and prefers intimate settings'})
- Agreeableness: ${Math.round(agreeableness)}/100 (${agreeableness > 70 ? 'very empathetic and cooperative' : agreeableness > 40 ? 'balanced between empathy and directness' : 'direct and honest in communication'})
- Emotional Stability: ${Math.round(neuroticism)}/100 (${neuroticism > 70 ? 'very emotionally stable and calm' : neuroticism > 40 ? 'moderately emotionally stable' : 'more sensitive and emotionally reactive'})

Your personality summary: ${generateAIPersona()}`;
    };

    return {
      openness,
      conscientiousness,
      extraversion,
      agreeableness,
      neuroticism,
      summary: 'A unique blend of traits that makes you, you!',
      aiPersona: generateAIPersona(),
      detailedPrompt: generateDetailedPrompt()
    };
  };

  const getScaleLabels = (trait: string) => {
    const labels = {
      openness: ['Prefer routine', 'Love new experiences'],
      extraversion: ['Quiet & intimate', 'Outgoing & social'],
      conscientiousness: ['Go with the flow', 'Love planning ahead'],
      neuroticism: ['Very calm', 'More sensitive'],
      agreeableness: ['Direct approach', 'Very empathetic']
    };
    return labels[trait as keyof typeof labels] || ['Less', 'More'];
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Aura is Ready! ✨</h2>
            <p className="text-white/80 mb-8 leading-relaxed">
              Amazing! I've analyzed your personality and created your unique digital aura. 
              Time to set up your profile and start meeting people who vibe with your energy!
            </p>
            <button
              onClick={() => navigate('/profile-setup')}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Create Your Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Link to="/" className="text-white/70">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="text-white text-sm font-medium">
            {currentQuestion + 1} of {quizQuestions.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-pink-300 mb-2">Aurora</p>
              <p className="text-white leading-relaxed">{question.question}</p>
            </div>
          </div>

          {question.type === 'scale' && (
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-white/60 px-2">
                <span>{getScaleLabels(question.trait)[0]}</span>
                <span>{getScaleLabels(question.trait)[1]}</span>
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value - 3)} // Scale from -2 to +2
                    className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {question.type === 'choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index - 1.5)} // Scale based on choice position
                  className="w-full p-4 bg-white/10 rounded-xl text-white text-left hover:bg-white/20 transition-colors"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}