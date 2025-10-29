"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '../../../lib/authService';
import Image from 'next/image';

export default function EmailVerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const verifyEmailLink = async () => {
      try {
        if (AuthService.isSignInWithEmailLink(window.location.href)) {
          let email = localStorage.getItem('emailForSignIn');
          
          if (!email) {
            email = window.prompt('Masukkan email Anda untuk menyelesaikan proses login:');
          }

          if (!email) {
            setStatus('error');
            setMessage('Email diperlukan untuk menyelesaikan proses login.');
            return;
          }

          await AuthService.completeEmailLinkSignIn(email, window.location.href);
          
          setStatus('success');
          setMessage('Login berhasil! Anda akan diarahkan ke dashboard...');
        
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
          
        } else {
          setStatus('error');
          setMessage('Link tidak valid atau sudah kadaluarsa.');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(error.message || 'Terjadi kesalahan saat memverifikasi email. Silakan coba lagi.');
      }
    };

    verifyEmailLink();
  }, [router]);

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleRequestNewLink = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        
        <div className="text-center mb-8">
          <Image
            src="/rakamin-logo.png"
            alt="Rakamin Logo"
            width={120}
            height={40}
            className="mx-auto mb-6"
            style={{ width: 'auto', height: 'auto' }}
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifikasi Email
          </h1>
        </div>

        
        <div className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-black">Memverifikasi email Anda...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">{message}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">{message}</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleBackToLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                >
                  Kembali ke Login
                </button>
                <button
                  onClick={handleRequestNewLink}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Minta Link Baru
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}