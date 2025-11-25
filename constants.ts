import { Topic } from "./types";

export const CATEGORIES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'common', label: 'Thông dụng' },
  { id: 'toeic', label: 'Luyện thi TOEIC' },
  { id: 'ielts', label: 'Luyện thi IELTS' },
  { id: 'business', label: 'Kinh doanh' },
  { id: 'tech', label: 'Công nghệ' },
  { id: 'medical', label: 'Y khoa' },
];

export const DEFAULT_TOPICS: Topic[] = [
  // Common / Daily Life
  { id: 'c1', name: 'Daily Routine', icon: '🏠', description: 'Thói quen sinh hoạt hàng ngày', color: '#00b894', category: 'common' },
  { id: 'c2', name: 'Family & Friends', icon: '👨‍👩‍👧‍👦', description: 'Gia đình và các mối quan hệ', color: '#00b894', category: 'common' },
  { id: 'c3', name: 'Food & Cooking', icon: '🍳', description: 'Ẩm thực, nấu nướng và nhà hàng', color: '#fdcb6e', category: 'common' },
  { id: 'c4', name: 'Travel & Tourism', icon: '✈️', description: 'Du lịch, sân bay và khách sạn', color: '#0984e3', category: 'common' },
  
  // TOEIC (Business & Office)
  { id: 't1', name: 'Office Life', icon: '🖨️', description: 'Văn phòng phẩm, thiết bị, quy trình', color: '#6c5ce7', category: 'toeic' },
  { id: 't2', name: 'Human Resources', icon: '🤝', description: 'Tuyển dụng, phỏng vấn, nhân sự', color: '#6c5ce7', category: 'toeic' },
  { id: 't3', name: 'Marketing', icon: '📢', description: 'Quảng cáo, thị trường, sales', color: '#e17055', category: 'toeic' },
  
  // IELTS (Academic)
  { id: 'i1', name: 'Environment', icon: '🌳', description: 'Môi trường, biến đổi khí hậu', color: '#2ecc71', category: 'ielts' },
  { id: 'i2', name: 'Education', icon: '🎓', description: 'Giáo dục, đại học, nghiên cứu', color: '#a29bfe', category: 'ielts' },
  
  // Tech / IT
  { id: 'te1', name: 'Software Dev', icon: '💻', description: 'Lập trình, phần mềm, coding', color: '#0984e3', category: 'tech' },
  { id: 'te2', name: 'Cyber Security', icon: '🔒', description: 'Bảo mật, hacker, an toàn mạng', color: '#2d3436', category: 'tech' },

  // Medical
  { id: 'm1', name: 'Anatomy', icon: '🦴', description: 'Giải phẫu cơ thể người', color: '#ff7675', category: 'medical' },
  { id: 'm2', name: 'Hospital', icon: '🏥', description: 'Bệnh viện, bác sĩ, dụng cụ y tế', color: '#d63031', category: 'medical' },
];