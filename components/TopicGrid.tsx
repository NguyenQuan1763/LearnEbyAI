import React, { useState } from 'react';
import { Topic } from '../types';
import { CATEGORIES } from '../constants';

interface TopicGridProps {
  topics: Topic[];
  onSelectTopic: (topicId: string, topicName: string, mode: 'learn' | 'test') => void;
  onCustomTopic: (topic: string) => void;
}

export const TopicGrid: React.FC<TopicGridProps> = ({ topics, onSelectTopic, onCustomTopic }) => {
  const [customInput, setCustomInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onCustomTopic(customInput.trim());
    }
  };

  const filteredTopics = selectedCategory === 'all' 
    ? topics 
    : topics.filter(t => t.category === selectedCategory);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
          VocaMaster AI
        </h1>
        <p className="text-gray-600 text-lg">
          Kho từ vựng 5000+ từ theo chủ đề & Luyện thi thông minh
        </p>
      </div>

      {/* Custom Topic Input */}
      <form onSubmit={handleCustomSubmit} className="max-w-xl mx-auto mb-10 relative z-10">
        <div className="relative flex items-center shadow-lg rounded-full">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="🔍 Nhập chủ đề bất kỳ (VD: Space, Pirates...)"
            className="w-full px-6 py-4 rounded-full border-2 border-transparent bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none text-lg transition-all"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="absolute right-2 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tạo bài
          </button>
        </div>
      </form>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 sticky top-20 z-40 bg-gray-50/90 backdrop-blur-sm p-4 rounded-xl">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-bold transition-all
              ${selectedCategory === cat.id 
                ? 'bg-dark text-white shadow-md scale-105' 
                : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}
            `}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Pre-defined Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className={`
              relative flex flex-col group rounded-3xl p-6 bg-white border-2 border-gray-100 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-1
            `}
            style={{ borderBottomColor: topic.color, borderBottomWidth: '6px' }}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{topic.icon}</span>
              <div 
                className="px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide"
                style={{ backgroundColor: topic.color }}
              >
                {CATEGORIES.find(c => c.id === topic.category)?.label || 'General'}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {topic.name}
            </h3>
            <p className="text-sm text-gray-500 mb-6 flex-grow">
              {topic.description}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-auto">
              <button
                onClick={() => onSelectTopic(topic.id, topic.name, 'learn')}
                className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors flex items-center justify-center"
              >
                <span className="mr-1">📖</span> Học từ
              </button>
              <button
                onClick={() => onSelectTopic(topic.id, topic.name, 'test')}
                className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-colors shadow-md flex items-center justify-center"
              >
                <span className="mr-1">⚡</span> Test
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};