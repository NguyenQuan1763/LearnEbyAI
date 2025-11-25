import React from 'react';
import { VocabularyCard } from '../types';

interface TopicDetailViewProps {
  topicName: string;
  cards: VocabularyCard[];
  onStartFlashcard: () => void;
  onStartQuiz: () => void;
  onBack: () => void;
  onGenerateMore: () => void; // New prop
}

export const TopicDetailView: React.FC<TopicDetailViewProps> = ({ 
  topicName, 
  cards, 
  onStartFlashcard, 
  onStartQuiz, 
  onBack,
  onGenerateMore
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center mb-4 md:mb-0">
          <button 
            onClick={onBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-dark">{topicName}</h1>
            <p className="text-gray-500 font-medium">{cards.length} từ vựng</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onStartFlashcard}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-transform transform hover:-translate-y-1 flex items-center"
          >
            <span className="mr-2">📖</span> Bắt đầu học
          </button>
          <button
            onClick={onStartQuiz}
            className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl shadow-lg shadow-secondary/30 transition-transform transform hover:-translate-y-1 flex items-center"
          >
            <span className="mr-2">⚡</span> Làm bài Test
          </button>
        </div>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border-2 border-gray-50 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary transition-colors">
                {card.word}
              </h3>
              <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {card.type}
              </span>
            </div>
            
            <div className="flex items-center text-indigo-500 text-sm font-serif italic mb-2">
              <span>{card.phonetic}</span>
              <button 
                onClick={() => {
                   const u = new SpeechSynthesisUtterance(card.word);
                   u.lang = 'en-US';
                   window.speechSynthesis.speak(u);
                }}
                className="ml-2 w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center hover:bg-indigo-100"
              >
                🔊
              </button>
            </div>
            
            <p className="text-gray-700 font-medium mb-2 border-t border-gray-100 pt-2">
              {card.vietnamese}
            </p>
            
            <p className="text-xs text-gray-400 italic">
              "{card.example}"
            </p>
          </div>
        ))}

        {/* Generate More Card */}
        <button 
          onClick={onGenerateMore}
          className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all group min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-lg font-bold text-primary">Gen thêm từ vựng</span>
          <span className="text-xs text-gray-500 mt-1">AI sẽ tạo thêm từ mới cho chủ đề này</span>
        </button>
      </div>
    </div>
  );
};