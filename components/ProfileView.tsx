import React, { useEffect, useState } from 'react';
import { User, LearningProgress, QuizResult } from '../types';
import { fetchUserData } from '../services/firebaseService';

interface ProfileViewProps {
  user: User;
  onBack: () => void;
  onResume: (topicId: string, topicName: string, isCustom: boolean) => void;
  onAddWords: (topicId: string, topicName: string) => void; // New prop
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack, onResume, onAddWords }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'progress' | 'history'>('progress');

  useEffect(() => {
    const loadData = async () => {
      if (user.uid) {
        const data = await fetchUserData(user.uid);
        setUserData(data);
      }
      setLoading(false);
    };
    loadData();
  }, [user.uid]);

  if (loading) {
    return <div className="min-h-[80vh] flex items-center justify-center text-gray-400">Đang tải hồ sơ...</div>;
  }

  // Parse Progress Data
  const progressList: LearningProgress[] = userData?.learningProgress 
    ? Object.values(userData.learningProgress) 
    : [];
  
  // Sort progress by last accessed
  progressList.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());

  // Parse History Data
  const historyList: QuizResult[] = userData?.history || [];
  historyList.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  // Calculate Stats
  const totalScore = historyList.reduce((acc, curr) => acc + curr.score, 0);
  const totalQuizzes = historyList.length;
  // Calculate total words learned across all topics
  const totalWordsLearned = progressList.reduce((acc, curr) => acc + (curr.wordsLearned || 0), 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fadeIn min-h-screen">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-gray-500 hover:text-primary font-bold transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Quay về Trang chủ
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <img 
            src={user.avatar} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100"
          />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-dark mb-2">{user.name}</h1>
            <p className="text-gray-500 font-medium mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <span className="px-4 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold border border-yellow-200">
                 Gold Member
               </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 w-full md:w-auto mt-4 md:mt-0">
             <div className="text-center">
                <div className="text-2xl font-black text-primary">{totalScore}</div>
                <div className="text-xs text-gray-400 uppercase font-bold">Điểm</div>
             </div>
             <div className="text-center">
                <div className="text-2xl font-black text-secondary">{totalQuizzes}</div>
                <div className="text-xs text-gray-400 uppercase font-bold">Bài Test</div>
             </div>
             <div className="text-center">
                <div className="text-2xl font-black text-orange-500">{totalWordsLearned}</div>
                <div className="text-xs text-gray-400 uppercase font-bold">Từ đã thuộc</div>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-6 py-3 rounded-t-xl font-bold transition-all ${activeTab === 'progress' ? 'bg-white text-primary border-b-2 border-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          🚀 Tiến trình học ({progressList.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-t-xl font-bold transition-all ${activeTab === 'history' ? 'bg-white text-primary border-b-2 border-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          📜 Lịch sử kiểm tra ({historyList.length})
        </button>
      </div>

      <div className="space-y-4">
        
        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          progressList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progressList.map((item, idx) => {
                 // Calculate percentage based on actual word counts
                 const percent = item.totalWords > 0 
                    ? Math.round((item.wordsLearned / item.totalWords) * 100) 
                    : 0;

                 return (
                  <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-2">
                        <div>
                           <h3 className="font-bold text-lg text-gray-800">{item.topicName}</h3>
                           <p className="text-xs text-gray-400">
                             Truy cập: {new Date(item.lastAccessed).toLocaleDateString()}
                           </p>
                        </div>
                        {item.isCustom && (
                          <span className="bg-indigo-50 text-indigo-500 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-100">
                             CUSTOM
                          </span>
                        )}
                     </div>

                     <div className="mb-4">
                        <div className="flex justify-between text-sm font-bold text-gray-500 mb-1">
                           <span>Đã thuộc</span>
                           <span>{item.wordsLearned} / {item.totalWords} từ</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${percent >= 100 ? 'bg-green-500' : 'bg-primary'}`} 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                     </div>
                     
                     <div className="flex gap-2">
                        <button 
                           onClick={() => onResume(item.topicId, item.topicName, item.isCustom)}
                           className="flex-1 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-sm transition-colors"
                        >
                           Học tiếp
                        </button>
                        {item.isCustom && (
                           <button 
                             onClick={() => onAddWords(item.topicId, item.topicName)}
                             className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-lg text-sm border border-gray-200 transition-colors"
                             title="Thêm từ mới vào chủ đề này"
                           >
                             + Thêm từ
                           </button>
                        )}
                     </div>
                  </div>
                 );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
               <span className="text-4xl block mb-2">🍃</span>
               <p className="text-gray-500">Bạn chưa học chủ đề nào. Hãy bắt đầu ngay!</p>
            </div>
          )
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
           historyList.length > 0 ? (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="w-full">
                 <thead className="bg-gray-50 border-b border-gray-200">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Chủ đề</th>
                     <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Điểm số</th>
                     <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Kết quả</th>
                     <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Ngày thi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {historyList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-700">{item.topicName || 'Unknown Topic'}</td>
                        <td className="px-6 py-4 text-center font-bold text-primary">{item.score}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                             (item.correct / item.total) >= 0.8 ? 'bg-green-100 text-green-700' : 
                             (item.correct / item.total) >= 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.correct}/{item.total}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                          {new Date(item.date || '').toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                 </tbody>
               </table>
            </div>
           ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
               <span className="text-4xl block mb-2">📜</span>
               <p className="text-gray-500">Chưa có lịch sử làm bài kiểm tra.</p>
            </div>
           )
        )}
      </div>
    </div>
  );
};