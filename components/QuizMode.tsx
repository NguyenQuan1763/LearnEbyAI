import React, { useState, useEffect } from 'react';
import { VocabularyCard, QuizResult } from '../types';

interface QuizModeProps {
  cards: VocabularyCard[];
  onFinish: (result: QuizResult) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ cards, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [wrongWords, setWrongWords] = useState<VocabularyCard[]>([]);
  
  const currentCard = cards[currentIndex];

  useEffect(() => {
    generateOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const generateOptions = () => {
    if (!currentCard) return;

    const correct = currentCard.vietnamese;
    const others = cards
      .filter(c => c.word !== currentCard.word)
      .map(c => c.vietnamese)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Ensure we have 4 options even if list is small by duplicating or padding
    while (others.length < 3 && cards.length > 3) {
        others.push("Từ khác...");
    }
    
    setShuffledOptions([correct, ...others].sort(() => 0.5 - Math.random()));
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedOption(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentCard.vietnamese;
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      
      // Bonus points for streak
      const points = 10 + (Math.floor(newStreak / 3) * 5); 
      setScore(prev => prev + points);
    } else {
      setStreak(0);
      setWrongWords(prev => [...prev, currentCard]);
    }

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        onFinish({
          correct: cards.length - wrongWords.length - (isCorrect ? 0 : 1),
          total: cards.length,
          score: isCorrect ? score + (10 + (Math.floor((streak + 1) / 3) * 5)) : score,
          streakMax: isCorrect ? Math.max(maxStreak, streak + 1) : maxStreak,
          wrongWords: isCorrect ? wrongWords : [...wrongWords, currentCard]
        });
      }
    }, 1200);
  };

  if (!currentCard) return <div>Loading...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 min-h-[80vh] flex flex-col justify-center">
      {/* Quiz Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Câu hỏi</span>
          <span className="text-2xl font-black text-gray-700">
            {currentIndex + 1}<span className="text-gray-300 text-lg">/{cards.length}</span>
          </span>
        </div>
        
        {/* Streak Counter */}
        <div className={`flex flex-col items-center transition-all duration-300 ${streak > 2 ? 'scale-110' : ''}`}>
           <span className="text-xs font-bold uppercase text-orange-500 tracking-wider">Combo</span>
           <div className="flex items-center text-orange-500 font-black text-2xl">
             {streak} 🔥
           </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Điểm số</span>
          <span className="text-2xl font-black text-primary">{score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-secondary transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border-2 border-gray-100 p-10 text-center mb-8 animate-fadeIn relative overflow-hidden">
        {isAnswered && (
          <div className={`absolute top-0 left-0 w-full h-1 ${selectedOption === currentCard.vietnamese ? 'bg-green-500' : 'bg-red-500'}`}></div>
        )}
        <h2 className="text-4xl md:text-5xl font-extrabold text-dark mb-4">{currentCard.word}</h2>
        <div className="inline-block px-4 py-1 bg-gray-50 rounded-full text-gray-500 font-serif italic text-lg border border-gray-100">
          {currentCard.phonetic}
        </div>
        <p className="mt-4 text-gray-400 text-sm">Chọn nghĩa đúng nhất</p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shuffledOptions.map((option, idx) => {
          let btnClass = "bg-white border-2 border-gray-100 text-gray-700 hover:border-primary hover:bg-indigo-50 shadow-sm"; // Default
          
          if (isAnswered) {
             if (option === currentCard.vietnamese) {
               btnClass = "bg-green-500 border-green-600 text-white shadow-md scale-[1.02]"; // Correct answer
             } else if (option === selectedOption) {
               btnClass = "bg-red-500 border-red-600 text-white shake-animation"; // Selected wrong answer
             } else {
               btnClass = "bg-gray-50 border-gray-100 text-gray-300 opacity-40"; // Other options faded
             }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              className={`
                p-5 rounded-2xl font-bold text-lg transition-all duration-200 relative overflow-hidden
                ${isAnswered ? '' : 'hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-sm'}
                ${btnClass}
              `}
            >
              <div className="relative z-10">{option}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};