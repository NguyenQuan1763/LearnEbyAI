import React, { useState, useEffect } from 'react';
import { VocabularyCard } from '../types';

interface FlashcardModeProps {
  cards: VocabularyCard[];
  onComplete: (learnedCount: number) => void;
  onExit: (learnedCount: number) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({ cards, onComplete, onExit }) => {
  // Queue of cards to study
  const [queue, setQueue] = useState<VocabularyCard[]>([]);
  const [initialCount, setInitialCount] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [animating, setAnimating] = useState(false); // For swipe animation

  // Initialize queue
  useEffect(() => {
    if (cards && cards.length > 0) {
      setQueue([...cards]);
      setInitialCount(cards.length);
    }
  }, [cards]);

  // SAFETY GUARD
  if (!cards || cards.length === 0) {
    return <div className="text-center p-10 text-gray-500">Đang tải dữ liệu...</div>;
  }

  // If queue is empty, we are done!
  if (queue.length === 0 && initialCount > 0) {
    // Small delay to show empty state briefly or just trigger complete
    setTimeout(() => onComplete(learnedCount), 100);
    return null;
  }

  const currentCard = queue[0];

  // Prevent crash
  if (!currentCard) return null;

  const progress = Math.round((learnedCount / initialCount) * 100);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // User marked as "Memorized"
  const handleMemorized = () => {
    if (animating) return;
    setAnimating(true);
    
    // Logic: Remove from queue, increment score
    setTimeout(() => {
      setLearnedCount(prev => prev + 1);
      setQueue(prev => prev.slice(1)); // Remove first element
      setIsFlipped(false);
      setAnimating(false);
    }, 300); // Wait for animation
  };

  // User marked as "Not Memorized" (Review again) -> Button label: "Từ tiếp tục"
  const handleReview = () => {
    if (animating) return;
    setAnimating(true);

    // Logic: Move current card to the end of the queue
    setTimeout(() => {
      setQueue(prev => {
        const [first, ...rest] = prev;
        return [...rest, first]; // Put first at the end
      });
      setIsFlipped(false);
      setAnimating(false);
    }, 300);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full max-w-4xl mx-auto px-4 overflow-hidden">
      {/* Header / Progress */}
      <div className="w-full flex items-center justify-between mb-6">
        <button 
          onClick={() => onExit(learnedCount)} 
          className="text-gray-500 hover:text-dark font-medium flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Dừng học
        </button>
        
        <div className="flex flex-col items-end">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Đã thuộc</span>
           <div className="flex items-center space-x-2">
              <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-bold text-green-600">{learnedCount}/{initialCount}</span>
           </div>
        </div>
      </div>

      {/* Card Container */}
      <div 
        className={`relative w-full max-w-md h-[420px] perspective-1000 cursor-pointer transition-all duration-300 ${animating ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100'}`}
        onClick={handleFlip}
      >
        <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front Face (English) */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl shadow-xl border-2 border-gray-100 flex flex-col items-center justify-center p-8 select-none">
            <div className="absolute top-6 right-6">
               <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full uppercase">{currentCard.type}</span>
            </div>

            <h2 className="text-5xl font-extrabold text-dark mb-4 mt-4">{currentCard.word}</h2>
            
            <div 
              className="flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-full mt-2 cursor-pointer transition-colors" 
              onClick={(e) => { e.stopPropagation(); speak(currentCard.word); }}
            >
              <span className="text-indigo-600 font-serif italic text-lg">{currentCard.phonetic}</span>
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            </div>
            
            <p className="absolute bottom-6 text-gray-400 text-sm font-medium animate-bounce-sm">Chạm để xem nghĩa</p>
          </div>

          {/* Back Face (Vietnamese) */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-3xl shadow-xl border-4 border-primary flex flex-col items-center justify-center p-8 text-dark select-none">
            <h3 className="text-3xl font-bold mb-6 text-primary">{currentCard.vietnamese}</h3>
            
            <div className="bg-gray-50 rounded-xl p-6 w-full border border-gray-100 relative">
              <span className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-gray-400">Ví dụ</span>
              <p className="text-gray-600 italic text-lg leading-relaxed">"{currentCard.example}"</p>
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons - SWAPPED POSITIONS */}
      <div className="flex items-center justify-center space-x-4 mt-8 w-full max-w-md">
        
        <button 
          onClick={handleMemorized}
          className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-green-200 border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center"
        >
          <span>😎 Đã nhớ!</span>
          <span className="text-xs font-normal opacity-80">+1 Tiến độ</span>
        </button>

        <button 
          onClick={handleReview}
          className="flex-1 py-4 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-lg shadow-sm border-b-4 border-orange-200 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center"
        >
          <span>➡️ Từ tiếp tục</span>
          <span className="text-xs font-normal opacity-70">Học lại sau</span>
        </button>

      </div>
      
      <p className="mt-6 text-gray-400 text-xs text-center max-w-xs">
        Mẹo: Nút "Từ tiếp tục" sẽ giữ từ này lại trong danh sách để ôn tập sau.
      </p>
    </div>
  );
};