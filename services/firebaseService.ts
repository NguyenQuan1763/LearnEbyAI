import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  collection 
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { User, QuizResult, LearningProgress, CustomTopic, VocabularyCard } from "../types";

// Map Firebase User to App User
export const mapFirebaseUser = (fbUser: FirebaseUser, displayName?: string): User => {
  return {
    uid: fbUser.uid,
    name: displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || '',
    avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=${fbUser.email}`
  };
};

// Sign Up
export const registerUser = async (email: string, pass: string, name: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const fbUser = userCredential.user;

    // Update Display Name
    await updateProfile(fbUser, {
      displayName: name,
      photoURL: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}`
    });

    // Create User Document in Firestore
    await setDoc(doc(db, "users", fbUser.uid), {
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
      score: 0,
      quizzesTaken: 0,
      learningProgress: {} 
    });

    return mapFirebaseUser(fbUser, name);
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// Login
export const loginUser = async (email: string, pass: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return mapFirebaseUser(userCredential.user);
  } catch (error: any) {
    throw new Error(getErrorMessage(error.code));
  }
};

// Logout
export const logoutUser = async () => {
  await signOut(auth);
};

// --- CUSTOM TOPIC MANAGEMENT ---

// Get a custom topic from Firestore (if exists)
export const getCustomTopic = async (userId: string, topicId: string): Promise<CustomTopic | null> => {
  try {
    // We store custom topics in a subcollection 'customTopics' under the user
    const topicRef = doc(db, "users", userId, "customTopics", topicId);
    const docSnap = await getDoc(topicRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as CustomTopic;
    }
    return null;
  } catch (e) {
    console.error("Error fetching custom topic:", e);
    return null;
  }
};

// Create a NEW custom topic (or overwrite/upgrade an existing one)
export const createCustomTopic = async (userId: string, topic: CustomTopic) => {
  try {
    const topicRef = doc(db, "users", userId, "customTopics", topic.id);
    await setDoc(topicRef, topic, { merge: true });
  } catch (e) {
    console.error("Error creating custom topic:", e);
  }
};

// Append new words to an EXISTING custom topic
export const addWordsToCustomTopic = async (userId: string, topicId: string, newWords: VocabularyCard[]) => {
  try {
    const topicRef = doc(db, "users", userId, "customTopics", topicId);
    await updateDoc(topicRef, {
      words: arrayUnion(...newWords),
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Error appending words:", e);
  }
};

// --- HISTORY & PROGRESS ---

// Save Quiz Result (History)
export const saveQuizResultToDb = async (userId: string, result: QuizResult, topicName: string, isCustom: boolean) => {
  if (!auth.currentUser) return;
  
  const userRef = doc(db, "users", userId);
  
  try {
    await updateDoc(userRef, {
      history: arrayUnion({
        topicName: topicName,
        score: result.score,
        correct: result.correct,
        total: result.total,
        date: new Date().toISOString()
      })
    });
  } catch (e) {
    console.error("Error saving score", e);
  }
};

// Save or Update Learning Progress
export const saveLearningProgress = async (userId: string, progressData: LearningProgress) => {
  const userRef = doc(db, "users", userId);
  const key = `learningProgress.${progressData.topicId}`; 

  try {
    await updateDoc(userRef, {
      [key]: progressData
    });
  } catch (e) {
    console.error("Error saving progress", e);
  }
};

// Fetch Full User Profile Data
export const fetchUserData = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

// Helper for Vietnamese Error Messages
const getErrorMessage = (code: string) => {
  switch (code) {
    case 'auth/email-already-in-use': return 'Email này đã được đăng ký.';
    case 'auth/invalid-email': return 'Email không hợp lệ.';
    case 'auth/user-not-found': return 'Tài khoản không tồn tại.';
    case 'auth/wrong-password': return 'Sai mật khẩu.';
    case 'auth/weak-password': return 'Mật khẩu quá yếu (cần > 6 ký tự).';
    default: return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }
};