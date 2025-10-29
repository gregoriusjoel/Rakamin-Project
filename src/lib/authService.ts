import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  signOut,
  User,
  UserCredential,
  AuthError
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, limit } from "firebase/firestore";
import { auth, googleProvider, db, isConfigured } from "./firebase";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  createdAt: any;
  lastLoginAt: any;
  role?: 'user' | 'admin';
}

export class AuthService {
  private static checkFirebaseConfig(): void {
    if (!isConfigured) {
      throw new Error("Firebase belum dikonfigurasi. Silakan setup Firebase terlebih dahulu sesuai panduan di FIREBASE_SETUP.md");
    }
  }

  static async loginWithEmail({ email, password }: LoginCredentials): Promise<UserCredential> {
    this.checkFirebaseConfig();
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.updateUserProfile(userCredential.user.uid, {
        lastLoginAt: serverTimestamp()
      });

      try {
        const idToken = await userCredential.user.getIdToken();
        await fetch('/api/sessionLogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
      } catch (err) {
        console.warn('Failed to create session cookie', err);
      }
      
      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async registerWithEmail({ email, password, name }: RegisterData): Promise<UserCredential> {
    this.checkFirebaseConfig();
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await this.createUserProfile(userCredential.user, { name });
      
      return userCredential;
    } catch (error) {
      console.error("Registration error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async loginWithGoogle(): Promise<UserCredential> {
    this.checkFirebaseConfig();
    
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      const userProfileExists = await this.checkUserProfileExists(userCredential.user.uid);
      
      if (!userProfileExists) {
        await this.createUserProfile(userCredential.user, {
          name: userCredential.user.displayName || undefined
        });
      } else {
        await this.updateUserProfile(userCredential.user.uid, {
          lastLoginAt: serverTimestamp()
        });
      }
      try {
        const idToken = await userCredential.user.getIdToken();
        await fetch('/api/sessionLogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
      } catch (err) {
        console.warn('Failed to create session cookie', err);
      }

      return userCredential;
    } catch (error) {
      console.error("Google login error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async sendLoginLink(email: string): Promise<void> {
    this.checkFirebaseConfig();
    
    const actionCodeSettings = {
      url: `${window.location.origin}/login/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem('emailForSignIn', email);
    } catch (error) {
      console.error("Send login link error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async completeEmailLinkSignIn(email: string, emailLink: string): Promise<UserCredential> {
    this.checkFirebaseConfig();
    
    try {
      if (!isSignInWithEmailLink(auth, emailLink)) {
        throw new Error("Link tidak valid untuk sign-in");
      }

      const userCredential = await signInWithEmailLink(auth, email, emailLink);
      const userProfileExists = await this.checkUserProfileExists(userCredential.user.uid);
      
      if (!userProfileExists) {
        await this.createUserProfile(userCredential.user, {
          name: userCredential.user.displayName || ''
        });
      } else {
        await this.updateUserProfile(userCredential.user.uid, {
          lastLoginAt: serverTimestamp()
        });
      }

      localStorage.removeItem('emailForSignIn');
      try {
        const idToken = await userCredential.user.getIdToken();
        await fetch('/api/sessionLogin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        });
      } catch (err) {
        console.warn('Failed to create session cookie', err);
      }
      
      return userCredential;
    } catch (error) {
      console.error("Complete email link sign-in error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static isSignInWithEmailLink(url: string): boolean {
    return isSignInWithEmailLink(auth, url);
  }

  static async resetPassword(email: string): Promise<void> {
    this.checkFirebaseConfig();
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset password error:", error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  static async logout(): Promise<void> {
    try {
      try {
        await fetch('/api/sessionLogout', { method: 'POST' });
      } catch (err) {
        console.warn('Failed to call sessionLogout', err);
      }

      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  private static async createUserProfile(user: User, additionalData?: { name?: string }): Promise<void> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      name: additionalData?.name || user.displayName || '',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      role: 'user'
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
  }

  private static async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  }

  private static async checkUserProfileExists(uid: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists();
  }

  static async isEmailRegistered(email: string): Promise<boolean> {
    this.checkFirebaseConfig();
    try {
      const q = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (err) {
      console.error('isEmailRegistered error:', err);
      return false;
    }
  }

  // Get user profile
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Get user profile error:", error);
      return null;
    }
  }

  // Handle Firebase Auth errors
  private static handleAuthError(error: AuthError): Error {
    let message = "Terjadi kesalahan yang tidak diketahui";

    switch (error.code) {
      case 'auth/user-not-found':
        message = "Email tidak ditemukan";
        break;
      case 'auth/wrong-password':
        message = "Password salah";
        break;
      case 'auth/email-already-in-use':
        message = "Email sudah digunakan";
        break;
      case 'auth/weak-password':
        message = "Password terlalu lemah";
        break;
      case 'auth/invalid-email':
        message = "Format email tidak valid";
        break;
      case 'auth/too-many-requests':
        message = "Terlalu banyak percobaan. Coba lagi nanti";
        break;
      case 'auth/network-request-failed':
        message = "Masalah koneksi internet";
        break;
      case 'auth/popup-closed-by-user':
        message = "Login dibatalkan";
        break;
      default:
        message = error.message;
    }

    return new Error(message);
  }
}