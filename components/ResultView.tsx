import React from 'react';
import { QuizResult } from '../types';

interface ResultViewProps {
  result: QuizResult;
  onRetry: () => void;
  onHome: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onRetry, onHome }) => {
  const percentage = Math.round((result.correct / result.total) * 100);
  
  let message = "Cố gắng lên!";
  let emoji = "🤔";
  let bgClass = "bg-yellow-500";

  if (percentage >= 100) { message = "Tuyệt đỉnh!"; emoji = "🏆"; bgClass = "bg-green-500"; }
  else if (percentage >= 80) { message = "Làm tốt lắm!"; emoji = "🌟"; bgClass = "bg-blue-500"; }
  else if (percentage >= 50) { message = "Tạm ổn!"; emoji = "👍"; bgClass = "bg-yellow-500"; }
  else { message = "Cần học thêm!"; emoji = "📚"; bgClass = "bg-red-500"; }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-2xl mx-auto px-4 animate-fadeIn py-10">
      
      {/* Score Card */}
      <div className="bg-white w-full rounded-3xl shadow-xl overflow-hidden mb-8">
        <div className={`${bgClass} p-8 text-center text-white`}>
          <div className="text-7xl mb-4 animate-bounce-sm">{emoji}</div>
          <h2 className="text-4xl font-extrabold mb-2">{message}</h2>
          <p className="opacity-90">Bạn đã hoàn thành bài kiểm tra!</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-3 gap-4 text-center mb-8">
             <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="block text-gray-400 text-xs font-bold uppercase">Điểm số</span>
                <span className="text-2xl font-black text-primary">{result.score}</span>
             </div>
             <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="block text-gray-400 text-xs font-bold uppercase">Đúng</span>
                <span className="text-2xl font-black text-green-500">{result.correct}/{result.total}</span>
             </div>
             <div className="p-4 bg-gray-50 rounded-2xl">
                <span className="block text-gray-400 text-xs font-bold uppercase">Max Combo</span>
                <span className="text-2xl font-black text-orange-500">{result.streakMax} 🔥</span>
             </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-4 mb-8 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${bgClass}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={onRetry}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-1"
            >
              🔄 Học lại bộ này
            </button>
            <button 
              onClick={onHome}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
            >
              🏠 Chọn chủ đề mới
            </button>
          </div>
        </div>
      </div>

      {/* Review Wrong Words */}
      {result.wrongWords.length > 0 && (
        <div className="w-full">
          <div className="flex items-center mb-4">
             <div className="w-1 h-8 bg-red-500 rounded-full mr-3"></div>
             <h3 className="text-xl font-bold text-gray-800">Cần ôn tập lại ({result.wrongWords.length})</h3>
          </div>
          
          <div className="grid gap-3">
            {result.wrongWords.map((word, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-red-200 transition-colors">
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-bold text-lg text-red-600">{word.word}</span>
                    <span className="text-xs text-gray-400 font-mono">{word.phonetic}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{word.vietnamese}</span>
                  <p className="text-xs text-gray-400 mt-1 italic">"{word.example}"</p>
                </div>
                <button 
                  onClick={() => {
                    const u = new SpeechSynthesisUtterance(word.word);
                    u.lang = 'en-US';
                    window.speechSynthesis.speak(u);
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                   🔊
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};