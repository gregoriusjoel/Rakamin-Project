"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { MdEmail, MdVisibilityOff, MdVisibility } from 'react-icons/md';
import { FiAlertTriangle } from 'react-icons/fi';
import { AuthService } from '../../lib/authService';
import { useAuth } from '../../hooks/useAuth';


const LoginPage = ({ onNavigateToRegister }: { onNavigateToRegister?: () => void } = {}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'link' | 'password'>('link');
  
  const [contentMode, setContentMode] = useState<typeof mode>(mode);
  const [isSwitching, setIsSwitching] = useState(false);
  const [emailEmpty, setEmailEmpty] = useState(false);
  const [emailNotRegistered, setEmailNotRegistered] = useState(false);
  const [mounted, setMounted] = useState(false);

  
  const isEmailEmptyError = emailEmpty || Boolean(
    error && (
      /alamat email tidak boleh kosong/i.test(error) ||
      /masukkan email terlebih dahulu/i.test(error) ||
      (/email.*(kosong|tidak boleh)/i.test(error)) ||
      /please fill out/i.test(error)
    )
  );

  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const emailInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (user) {
      if (!onNavigateToRegister) {
        router.push('/dashboard');
      }
    }
  }, [user, router, onNavigateToRegister]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Alamat email tidak boleh kosong');
      setEmailEmpty(true);
      setTimeout(() => emailInputRef.current?.focus(), 0);
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await AuthService.loginWithEmail({ email, password });
      setMessage('Login berhasil!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value ?? '';
    setEmail(v);
    if (v.trim() !== '') {
      if (isEmailEmptyError) setError('');
      if (emailEmpty) setEmailEmpty(false);
      if (message) setMessage('');
      if (emailNotRegistered) setEmailNotRegistered(false);
    }
  };

  const switchMode = (m: 'link' | 'password') => {
    if (m === mode || isSwitching) return;
    setIsSwitching(true);
    setError('');
    setMessage('');
    setEmailEmpty(false);
    setTimeout(() => {
      setContentMode(m);
      setMode(m);
      setTimeout(() => setIsSwitching(false), 10);
    }, 200);
  };

  const handleEmailLogin = async () => {
    if (!email) {
      setError('Alamat email tidak boleh kosong');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const exists = await AuthService.isEmailRegistered(email);
      if (!exists) {
        setEmailNotRegistered(true);
        setLoading(false);
        return;
      }

      await AuthService.sendLoginLink(email);
      setMessage('Link login telah dikirim ke email Anda. Periksa inbox dan spam folder.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await AuthService.loginWithGoogle();
      setMessage('Login dengan Google berhasil!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Alamat email tidak boleh kosong');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await AuthService.resetPassword(email);
      setMessage('Link reset password telah dikirim ke email Anda.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    
    setError('');
    setMessage('');
    setEmailEmpty(false);
  }, [pathname]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  const EmailLinkLogin = () => (
    <>
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
          Masuk ke Rakamin
        </h1>
  <p className="text-black">
          Belum punya akun?{' '}
          {onNavigateToRegister ? (
            <button 
              onClick={onNavigateToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Daftar menggunakan email
            </button>
          ) : (
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Daftar menggunakan email
            </Link>
          )}
        </p>
      </div>

      
      {!isEmailEmptyError && error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {emailNotRegistered && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            Email ini belum terdaftar sebagai akun di Rakamin Academy.{' '}
            <button
              type="button"
              onClick={() => { setEmailNotRegistered(false); router.push('/register'); }}
              className="text-blue-600 underline font-medium ml-1"
            >
              Daftar
            </button>
          </p>
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
            Alamat email
          </label>
          <input
            ref={emailInputRef}
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            aria-invalid={isEmailEmptyError}
            className={`w-full px-4 py-3 rounded-lg outline-none transition duration-200 text-black placeholder-gray-400 border ${isEmailEmptyError ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
            placeholder=""
            disabled={loading}
          />
          {isEmailEmptyError && (
            <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
              <FiAlertTriangle className="mt-0.5" />
              <p>Alamat email tidak boleh kosong</p>
            </div>
          )}
        </div>
        <button
          onClick={handleEmailLogin}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Mengirim link...' : 'Kirim link'}
        </button>
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-black text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>
        <button
          onClick={() => switchMode('password')}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 text-black font-medium py-3 px-4 rounded-lg transition duration-200"
        >
          <MdEmail size={20} className="text-black" />
          Masuk dengan kata sandi
        </button>
        <div className="mt-3" />
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 text-black font-medium py-3 px-4 rounded-lg transition duration-200"
        >
          <FcGoogle size={20} />
          Masuk dengan Google
        </button>
      </div>
    </>
  );

  const PasswordLogin = () => (
    <>
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
          Masuk ke Rakamin
        </h1>
        <p className="text-gray-600">
          Belum punya akun?{' '}
          {onNavigateToRegister ? (
            <button 
              onClick={onNavigateToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Daftar menggunakan email
            </button>
          ) : (
            <Link 
              href="/register" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Daftar menggunakan email
            </Link>
          )}
        </p>
      </div>

      {!isEmailEmptyError && error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Alamat email
          </label>
          <input
            ref={emailInputRef}
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            aria-invalid={isEmailEmptyError}
            className={`w-full px-4 py-3 rounded-lg outline-none transition duration-200 text-black placeholder-gray-400 border ${isEmailEmptyError ? 'border-red-500 focus:ring-2 focus:ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
            placeholder=""
            disabled={loading}
          />
          {isEmailEmptyError && (
            <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
              <FiAlertTriangle className="mt-0.5" />
              <p>Alamat email tidak boleh kosong</p>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Kata sandi
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 pr-12 text-black placeholder-gray-400"
              placeholder=""
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black"
              disabled={loading}
            >
              {showPassword ? <MdVisibility size={20} /> : <MdVisibilityOff size={20} />}
            </button>
          </div>
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
              disabled={loading}
            >
              Lupa kata sandi?
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'Sedang masuk...' : 'Masuk'}
        </button>
      </form>
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">or</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>
        <button
          onClick={() => switchMode('link')}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 text-black font-medium py-3 px-4 rounded-lg transition duration-200"
        >
          <MdEmail size={20} className="text-black" />
          Login dengan link email
        </button>
      <div className="mt-3" />
      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
      >
        <FcGoogle size={20} />
        Masuk dengan Google
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div
        className={`max-w-md w-full bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      >
        <div className={`transition-all duration-200 ease-out ${isSwitching ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}>
          {contentMode === 'link' ? EmailLinkLogin() : PasswordLogin()}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;