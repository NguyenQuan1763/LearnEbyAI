import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../services/firebaseService';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

// Intro slides data
const INTRO_SLIDES = [
  {
    id: 1,
    icon: '🦄',
    title: 'Học Từ Vựng Siêu Tốc',
    desc: 'Hệ thống Flashcard thông minh giúp bạn ghi nhớ 50 từ mỗi ngày một cách dễ dàng và trực quan.',
    color: 'bg-primary' // #6C5CE7
  },
  {
    id: 2,
    icon: '⚡',
    title: 'Đấu Trí Gamification',
    desc: 'Chế độ kiểm tra (Quiz) tính điểm Combo cực cuốn, leo bảng xếp hạng thành tích mỗi ngày.',
    color: 'bg-secondary' // #00B894
  },
  {
    id: 3,
    icon: '🧠',
    title: 'AI Trợ Lý Cá Nhân',
    desc: 'Sử dụng Gemini AI để tạo bài học không giới hạn theo bất kỳ chủ đề nào bạn yêu thích.',
    color: 'bg-rose-500' // Pink/Red accent
  }
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % INTRO_SLIDES.length);
    }, 4000); // Change every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      let user: User;
      if (isLogin) {
        user = await loginUser(email, password);
      } else {
        user = await registerUser(email, password, name);
      }
      onLogin(user); // Pass successful user up
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSlide = INTRO_SLIDES[currentSlide];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white rounded-[2rem] shadow-2xl flex w-full max-w-5xl overflow-hidden min-h-[650px] relative">
        
        {/* Left Side - Animated Intro Slider */}
        <div className={`
          hidden md:flex w-1/2 flex-col justify-between items-center p-12 text-white transition-colors duration-700 ease-in-out
          ${activeSlide.color}
        `}>
          {/* Spacer for vertical centering */}
          <div className="flex-1"></div>

          {/* Slide Content */}
          <div key={activeSlide.id} className="flex flex-col items-center text-center animate-fadeIn">
            <div className="mb-8 text-9xl drop-shadow-xl transform transition-transform hover:scale-110 duration-500 cursor-default select-none">
              {activeSlide.icon}
            </div>
            <h2 className="text-3xl lg:text-4xl font-black mb-6 leading-tight tracking-tight">
              {activeSlide.title}
            </h2>
            <p className="text-lg opacity-90 max-w-sm mx-auto leading-relaxed font-medium">
              {activeSlide.desc}
            </p>
          </div>

          {/* Bottom Indicators & Spacer */}
          <div className="flex-1 flex items-end w-full justify-center pb-2">
             <div className="flex gap-3 bg-black/10 px-4 py-2 rounded-full backdrop-blur-sm">
               {INTRO_SLIDES.map((slide, idx) => (
                 <button
                   key={slide.id}
                   onClick={() => setCurrentSlide(idx)}
                   className={`h-2 rounded-full transition-all duration-500 ease-out ${
                     idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                   }`}
                   aria-label={`Go to slide ${idx + 1}`}
                 />
               ))}
             </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white">
          
          <div className="text-center mb-8">
             <h1 className="text-3xl font-black text-dark mb-2">
               {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
             </h1>
             <p className="text-gray-400 font-medium">
               {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tham gia cộng đồng học tập ngay hôm nay'}
             </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm font-bold text-center border border-red-100 animate-bounce-sm">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 max-w-sm mx-auto w-full">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">Tên hiển thị</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Minh Trí"
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-dark"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-dark"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-dark"
              />
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary font-bold hover:text-primary/80 transition-colors">
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-4 rounded-xl font-bold text-white text-lg shadow-xl shadow-primary/20 hover:shadow-2xl transition-all transform hover:-translate-y-1 active:translate-y-0
                ${isLogin ? 'bg-primary hover:bg-indigo-600' : 'bg-secondary hover:bg-teal-600'}
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'
              )}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-8 max-w-sm mx-auto w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-medium">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
             <button className="p-3 rounded-full bg-white hover:bg-gray-50 transition-all border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:scale-105">
               <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
             </button>
             <button className="p-3 rounded-full bg-white hover:bg-gray-50 transition-all border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:scale-105">
               <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-6 h-6" alt="Facebook" />
             </button>
             <button className="p-3 rounded-full bg-white hover:bg-gray-50 transition-all border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:scale-105">
               <img src="https://www.svgrepo.com/show/448234/linkedin.svg" className="w-6 h-6" alt="LinkedIn" />
             </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setName('');
                  setEmail('');
                  setPassword('');
                  setErrorMsg('');
                }}
                className="ml-2 text-primary font-bold hover:underline transition-all"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};