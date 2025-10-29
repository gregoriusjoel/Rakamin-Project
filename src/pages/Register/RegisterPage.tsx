"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { AuthService } from '../../lib/authService';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = ({ onNavigateToLogin }: { onNavigateToLogin?: () => void } = {}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [mode, setMode] = useState<'link' | 'password'>('link');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    if (user) {
      console.log('User logged in:', user);
      if (!onNavigateToLogin) {
        router.push('/dashboard');
      }
    }
  }, [user, router, onNavigateToLogin]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await AuthService.sendLoginLink(email);
      setSuccessEmail(email);
      setShowSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) return setError('Email diperlukan');
    if (!password) return setError('Password diperlukan');
    if (password !== confirmPassword) return setError('Password dan konfirmasi tidak cocok');

    setLoading(true);
    try {
      await AuthService.registerWithEmail({ email, password, name: name || undefined });
      setMessage('Registrasi berhasil. Anda akan diarahkan ke dashboard.');
    } catch (err: any) {
      setError(err.message || 'Gagal registrasi');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await AuthService.loginWithGoogle();
      setMessage('Registrasi dengan Google berhasil!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {showSuccess ? (
        <div className={`max-w-md w-full bg-white rounded-2xl shadow-lg p-10 transition-all duration-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">Periksa Email Anda</h1>
            <p className="text-sm text-gray-600 mb-6">Kami sudah mengirimkan link register ke <span className="font-medium text-gray-900">{successEmail}</span> yang berlaku dalam <span className="font-medium">30 menit</span></p>
          </div>

          <div className="flex justify-center">
            <img src="/assets/verifemail.png" alt="verify email" width={280} height={200} className="object-contain" />
          </div>

          
        </div>
      ) : (
        <div className={`max-w-md w-full bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
  <div className="text-left mb-8">
          <Image
            src="/rakamin-logo.png"
            alt="Rakamin Logo"
            width={120}
            height={40}
            className="mb-8"
            style={{ width: 'auto', height: 'auto' }}
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bergabung dengan Rakamin
          </h1>
          <p className="text-black">
            Sudah punya akun?{' '}
            {onNavigateToLogin ? (
              <button 
                onClick={onNavigateToLogin}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Masuk
              </button>
            ) : (
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Masuk
              </Link>
            )}
          </p>
        </div>

        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        
        <div className="space-y-6">
          <div className="relative mb-2 rounded border bg-white overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full w-1/2 bg-yellow-400 transition-transform duration-300 pointer-events-none ${mode === 'password' ? 'translate-x-full' : 'translate-x-0'}`}
            />

            <div className="relative flex">
              <button
                onClick={() => setMode('link')}
                aria-pressed={mode === 'link'}
                className={`flex-1 py-2 text-center z-10 focus:outline-none transition-colors duration-200 ${mode === 'link' ? 'text-black' : 'text-gray-500'}`}
                disabled={loading}
              >
                Daftar dengan link
              </button>

              <button
                onClick={() => setMode('password')}
                aria-pressed={mode === 'password'}
                className={`flex-1 py-2 text-center z-10 focus:outline-none transition-colors duration-200 ${mode === 'password' ? 'text-black' : 'text-gray-500'}`}
                disabled={loading}
              >
                Daftar dengan kata sandi
              </button>
            </div>
          </div>

          <div>
            <form
              onSubmit={handleEmailSubmit}
              className="space-y-6 overflow-hidden"
              aria-hidden={mode !== 'link'}
              style={{
                maxHeight: mode === 'link' ? 800 : 0,
                opacity: mode === 'link' ? 1 : 0,
                transform: mode === 'link' ? 'translateY(0)' : 'translateY(-6px)',
                transition: 'all 260ms cubic-bezier(.2,.8,.2,1)'
              }}
            >
              <div>
                <label htmlFor="email-link" className="block text-sm font-medium text-black mb-2">
                  Alamat email
                </label>
                <input
                  type="email"
                  id="email-link"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-black placeholder-gray-400"
                  placeholder="Masukkan email Anda"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Mengirim...' : 'Daftar dengan email'}
              </button>
            </form>

            <form
              onSubmit={handlePasswordRegister}
              className="space-y-4 overflow-hidden"
              aria-hidden={mode !== 'password'}
              style={{
                maxHeight: mode === 'password' ? 1000 : 0,
                opacity: mode === 'password' ? 1 : 0,
                transform: mode === 'password' ? 'translateY(0)' : 'translateY(-6px)',
                transition: 'all 360ms cubic-bezier(.2,.8,.2,1)'
              }}
            >
              <div style={{ transition: 'all 320ms', transitionDelay: mode === 'password' ? '80ms' : '0ms', opacity: mode === 'password' ? 1 : 0, transform: mode === 'password' ? 'translateY(0)' : 'translateY(-6px)' }}>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-2">Nama (opsional)</label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-black placeholder-gray-400"
                  placeholder="Nama lengkap"
                  disabled={loading}
                />
              </div>

              <div style={{ transition: 'all 320ms', transitionDelay: mode === 'password' ? '140ms' : '0ms', opacity: mode === 'password' ? 1 : 0, transform: mode === 'password' ? 'translateY(0)' : 'translateY(-6px)' }}>
                <label htmlFor="email-password" className="block text-sm font-medium text-black mb-2">Alamat email</label>
                <input
                  type="email"
                  id="email-password"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-black placeholder-gray-400"
                  placeholder="Masukkan email Anda"
                  required
                  disabled={loading}
                />
              </div>

              <div style={{ transition: 'all 320ms', transitionDelay: mode === 'password' ? '200ms' : '0ms', opacity: mode === 'password' ? 1 : 0, transform: mode === 'password' ? 'translateY(0)' : 'translateY(-6px)' }}>
                <label htmlFor="password" className="block text-sm font-medium text-black mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-black placeholder-gray-400"
                  placeholder="Buat password"
                  required
                  disabled={loading}
                />
              </div>

              <div style={{ transition: 'all 320ms', transitionDelay: mode === 'password' ? '260ms' : '0ms', opacity: mode === 'password' ? 1 : 0, transform: mode === 'password' ? 'translateY(0)' : 'translateY(-6px)' }}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 text-black placeholder-gray-400"
                  placeholder="Konfirmasi password"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar dengan kata sandi'}
              </button>
            </form>
          </div>
        </div>

        
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-black text-sm">atau</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        
        <button
          onClick={handleGoogleRegister}
          disabled={loading}
    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 text-black font-medium py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <FcGoogle size={20} />
          Daftar dengan Google
        </button>
      </div>
    )}
    </div>
  );
};

export default RegisterPage;
