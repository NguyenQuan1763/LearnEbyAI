export interface VocabularyCard {
  word: string;
  phonetic: string;
  vietnamese: string;
  example: string;
  type: string; // noun, verb, adjective, etc.
}

export enum AppState {
  HOME = 'HOME',
  LOADING = 'LOADING',
  TOPIC_DETAIL = 'TOPIC_DETAIL', // New state
  FLASHCARD = 'FLASHCARD',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
  PROFILE = 'PROFILE'
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  category: 'common' | 'toeic' | 'ielts' | 'business' | 'tech' | 'medical';
}

export interface QuizResult {
  correct: number;
  total: number;
  score: number;
  streakMax: number;
  wrongWords: VocabularyCard[];
  date?: string;
  topicName?: string;
}

export interface LearningProgress {
  topicId: string;
  topicName: string;
  progress: number; // 0 to 100 (kept for backwards compatibility/visuals)
  wordsLearned: number; // NEW: Actual count
  totalWords: number;   // NEW: Total available in topic
  lastAccessed: string;
  isCustom: boolean;
}

// Interface for Custom Topics stored in Firebase
export interface CustomTopic {
  id: string;
  name: string;
  ownerId: string;
  words: VocabularyCard[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
  uid?: string; 
}