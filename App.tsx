import React, { useState, useEffect } from 'react';
import { AppState, VocabularyCard, QuizResult, User, CustomTopic } from './types';
import { fetchVocabulary, generateWithAI } from './services/geminiService';
import { 
  logoutUser, 
  saveQuizResultToDb, 
  mapFirebaseUser, 
  saveLearningProgress,
  getCustomTopic,
  createCustomTopic,
  addWordsToCustomTopic
} from './services/firebaseService';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";

import { TopicGrid } from './components/TopicGrid';
import { FlashcardMode } from './components/FlashcardMode';
import { QuizMode } from './components/QuizMode';
import { ResultView } from './components/ResultView';
import { LoadingView } from './components/LoadingView';
import { AuthScreen } from './components/AuthScreen';
import { ProfileView } from './components/ProfileView';
import { TopicDetailView } from './components/TopicDetailView';
import { DEFAULT_TOPICS } from './constants';
import { STATIC_VOCABULARY } from './data/staticData';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentTopicId, setCurrentTopicId] = useState<string>('');
  const [vocabulary, setVocabulary] = useState<VocabularyCard[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(mapFirebaseUser(firebaseUser));
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await logoutUser();
    resetToHome();
  };

  // Helper to generate a safe ID for custom topics
  const getSafeId = (name: string) => name.replace(/\s+/g, '_').toLowerCase();

  const startSession = async (topicId: string, topicName: string, mode: 'learn' | 'test') => {
    setCurrentTopic(topicName);
    setCurrentTopicId(topicId);
    setIsTestMode(mode === 'test');
    setAppState(AppState.LOADING);
    
    let wordsToUse: VocabularyCard[] = [];
    const isCustom = topicId === 'custom' || !STATIC_VOCABULARY[topicId];
    // IMPORTANT: Even if it's a static topic like 'c1' (Daily Routine), 
    // we use the safe name ID for checking/saving custom extensions on Firebase
    const safeCustomId = getSafeId(topicName); 
    const finalTopicId = isCustom ? safeCustomId : topicId;

    // 1. Always check Firestore first to see if user has an extended version of this topic
    // This allows "Static" topics to be "Upgraded" to Custom ones seamlessly
    if (user?.uid) {
        const extendedTopic = await getCustomTopic(user.uid, safeCustomId);
        if (extendedTopic) {
           console.log(`[App] Found extended/custom version for ${topicName}`);
           wordsToUse = extendedTopic.words;
        }
    }

    // 2. If no extended version found...
    if (wordsToUse.length === 0) {
        if (!isCustom && STATIC_VOCABULARY[topicId]) {
           // Load from Static DB
           console.log(`[App] Loading static default for ${topicName}`);
           const result = await fetchVocabulary(topicId, topicName, 20);
           wordsToUse = result.words;
        } else {
           // Generate New via AI (Fresh Custom Topic)
           if (user?.uid) {
             console.log("Generating new custom topic:", topicName);
             wordsToUse = await generateWithAI(topicName, 15);
             
             // Save to Firestore
             const newTopic: CustomTopic = {
               id: safeCustomId,
               name: topicName,
               ownerId: user.uid,
               words: wordsToUse,
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString()
             };
             await createCustomTopic(user.uid, newTopic);
           }
        }
    }

    // Filter for Test Mode (Subset) or Use All
    let sessionWords: VocabularyCard[] = [];
    if (mode === 'test') {
      const shuffled = [...wordsToUse].sort(() => 0.5 - Math.random());
      sessionWords = shuffled.slice(0, 20); 
    } else {
      sessionWords = wordsToUse; 
    }

    setVocabulary(sessionWords);

    // Save initial progress tracking for "Learn" mode
    if (user && user.uid) {
       saveLearningProgress(user.uid, {
         topicId: finalTopicId,
         topicName: topicName,
         progress: 0, 
         wordsLearned: 0, 
         totalWords: wordsToUse.length,
         lastAccessed: new Date().toISOString(),
         isCustom: true // Treat everything tracked as custom/dynamic for simplicity
       });
    }
    
    // NAVIGATION LOGIC
    if (mode === 'test') {
      setAppState(AppState.QUIZ);
    } else {
      // If "Learn" mode, show details first
      setAppState(AppState.TOPIC_DETAIL);
    }
  };

  // Handler for "Generate More" button in Topic Detail View
  const handleGenerateMoreFromDetail = async () => {
    if (!user?.uid) return;
    
    // Show Loading
    setAppState(AppState.LOADING);
    
    // Use safe ID for database operations
    const safeTopicId = getSafeId(currentTopic);
    
    // 1. Calculate words to exclude (current vocabulary)
    const excludeList = vocabulary.map(w => w.word);
    console.log(`[App] Generating more words for ${currentTopic}, excluding ${excludeList.length} words.`);

    // 2. Generate new words
    const newWords = await generateWithAI(currentTopic, 10, excludeList);

    if (newWords.length > 0) {
      // 3. Save to Firebase
      const existingTopic = await getCustomTopic(user.uid, safeTopicId);
      
      if (existingTopic) {
         // Scenario A: It's already a custom topic -> Append
         await addWordsToCustomTopic(user.uid, safeTopicId, newWords);
      } else {
         // Scenario B: It was a static topic (e.g. Daily Routine) being extended for the first time
         // We must create a CustomTopic record that includes OLD + NEW words
         const fullList = [...vocabulary, ...newWords];
         const newTopicRecord: CustomTopic = {
            id: safeTopicId,
            name: currentTopic,
            ownerId: user.uid,
            words: fullList,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
         };
         await createCustomTopic(user.uid, newTopicRecord);
      }

      // 4. Update Local State
      const updatedVocabulary = [...vocabulary, ...newWords];
      setVocabulary(updatedVocabulary);

      // 5. Update Progress
      await saveLearningProgress(user.uid, {
         topicId: safeTopicId,
         topicName: currentTopic,
         progress: 0, 
         wordsLearned: 0, // Reset learned count? Or keep it? keeping 0 implies restart for simplicity, or we could pass learned count.
         totalWords: updatedVocabulary.length,
         lastAccessed: new Date().toISOString(),
         isCustom: true
      });

      // 6. Return to Detail View
      setAppState(AppState.TOPIC_DETAIL);
    } else {
      // Fallback
      setAppState(AppState.TOPIC_DETAIL);
    }
  };

  // Handler for "Add More Words" button in Profile
  const handleAddMoreWords = async (topicId: string, topicName: string) => {
    // Re-use logic or redirect to startSession then trigger gen?
    // For now, simpler to reuse the flow:
    await startSession(topicId, topicName, 'learn');
    // Note: This takes them to TopicDetailView, where they can click "Gen More"
  };

  // UPDATED: Handle when Flashcard session ends (either complete or user exit)
  const handleFlashcardsSessionEnd = (learnedCount: number) => {
    
    // Save progress based on actual memorized words
    if (user && user.uid && learnedCount > 0) {
       const isCustom = currentTopicId === 'custom' || !STATIC_VOCABULARY[currentTopicId];
       const finalTopicId = isCustom ? getSafeId(currentTopic) : currentTopicId;
       
       saveLearningProgress(user.uid, {
         topicId: finalTopicId,
         topicName: currentTopic,
         progress: 50, // Arbitrary visual
         wordsLearned: learnedCount, 
         totalWords: vocabulary.length, 
         lastAccessed: new Date().toISOString(),
         isCustom: true
       });
    }

    // If exited early with 0 learned, just go home
    if (learnedCount === 0 && vocabulary.length > 0) {
        resetToHome();
        return;
    }

    // Go to Quiz for reinforcement
    setAppState(AppState.QUIZ);
  };

  const handleQuizFinished = async (result: QuizResult) => {
    setQuizResult(result);
    setAppState(AppState.RESULT);
    const isCustom = currentTopicId === 'custom' || !STATIC_VOCABULARY[currentTopicId];
    
    if (user && auth.currentUser) {
      await saveQuizResultToDb(auth.currentUser.uid, result, currentTopic, isCustom);
    }
  };

  const resetToHome = () => {
    setAppState(AppState.HOME);
    setVocabulary([]);
    setQuizResult(null);
    setIsTestMode(false);
  };

  const navigateToProfile = () => {
    setAppState(AppState.PROFILE);
  };

  const retryCurrentSet = () => {
    if (isTestMode) {
      setAppState(AppState.QUIZ);
    } else {
      setAppState(AppState.FLASHCARD);
    }
    setQuizResult(null);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Đang tải dữ liệu...</div>;
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-primary selection:text-white">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer group" onClick={resetToHome}>
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                 <span className="text-2xl">🦄</span>
              </div>
              <span className="text-xl font-black text-dark tracking-tight">VocaMaster<span className="text-primary">.AI</span></span>
            </div>
            
            <div className="flex items-center space-x-4">
              {appState !== AppState.HOME && appState !== AppState.PROFILE && (
                 <span className={`hidden md:inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border ${isTestMode ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {isTestMode ? '🔥 Testing: ' : '📖 Learning: '} {currentTopic}
                 </span>
              )}

              {/* User Profile Trigger & Logout */}
              <div className="flex items-center pl-4 border-l border-gray-200">
                <div 
                  className="flex items-center mr-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  onClick={navigateToProfile}
                  title="Xem hồ sơ cá nhân"
                >
                  <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-gray-100 mr-2 border border-gray-200" />
                  <span className="hidden md:block font-bold text-gray-700 text-sm truncate max-w-[100px]">{user.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Đăng xuất"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-8 pb-12">
        {appState === AppState.HOME && (
          <TopicGrid 
            topics={DEFAULT_TOPICS} 
            onSelectTopic={(topicId, topicName, mode) => startSession(topicId, topicName, mode)}
            onCustomTopic={(topicName) => startSession('custom', topicName, 'learn')}
          />
        )}

        {appState === AppState.PROFILE && user && (
          <ProfileView 
            user={user} 
            onBack={resetToHome}
            onResume={(topicId, topicName, isCustom) => startSession(isCustom ? 'custom' : topicId, topicName, 'learn')}
            onAddWords={handleAddMoreWords}
          />
        )}

        {appState === AppState.LOADING && (
          <LoadingView topic={currentTopic} />
        )}

        {/* TOPIC DETAIL VIEW */}
        {appState === AppState.TOPIC_DETAIL && vocabulary.length > 0 && (
          <TopicDetailView 
            topicName={currentTopic}
            cards={vocabulary}
            onStartFlashcard={() => setAppState(AppState.FLASHCARD)}
            onStartQuiz={() => setAppState(AppState.QUIZ)}
            onBack={resetToHome}
            onGenerateMore={handleGenerateMoreFromDetail}
          />
        )}

        {appState === AppState.FLASHCARD && vocabulary.length > 0 && (
          <FlashcardMode 
            cards={vocabulary}
            onComplete={handleFlashcardsSessionEnd}
            onExit={handleFlashcardsSessionEnd}
          />
        )}

        {appState === AppState.QUIZ && vocabulary.length > 0 && (
          <QuizMode 
            cards={vocabulary}
            onFinish={handleQuizFinished}
          />
        )}

        {appState === AppState.RESULT && quizResult && (
          <ResultView 
            result={quizResult}
            onRetry={retryCurrentSet}
            onHome={resetToHome}
          />
        )}
      </main>
      
      {/* Simple Footer */}
      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-sm border-t border-gray-200 py-3 text-center text-xs text-gray-400 z-40">
        Powered by Gemini AI • 5000+ Words Database
      </footer>
    </div>
  );
};

export default App;