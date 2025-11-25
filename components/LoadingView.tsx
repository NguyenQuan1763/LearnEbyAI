import React from 'react';

export const LoadingView: React.FC<{ topic: string }> = ({ topic }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-8 border-primary rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
          🧠
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Đang tạo bài học...</h2>
      <p className="text-gray-500 max-w-md text-center">
        Gemini AI đang tổng hợp từ vựng hay nhất về chủ đề <span className="text-primary font-bold">"{topic}"</span> cho bạn.
      </p>
    </div>
  );
};