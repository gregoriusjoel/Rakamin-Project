"use client";

import Link from 'next/link';

export default function FirebaseSetupNotice() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Setup Firebase Required
          </h1>
          <p className="text-black mb-6">
            Firebase belum dikonfigurasi. Silakan setup Firebase terlebih dahulu untuk menggunakan fitur authentication.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Langkah Setup Firebase:</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Buka <Link href="https://console.firebase.google.com/" target="_blank" className="underline hover:text-blue-600">Firebase Console</Link></li>
            <li>Buat project baru dengan nama "hiring-management"</li>
            <li>Enable Authentication & Firestore Database</li>
            <li>Setup Web App dan copy config</li>
            <li>Update file <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> dengan config Firebase</li>
          </ol>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-black mb-2">File yang perlu diupdate:</h3>
          <code className="text-sm text-black">
            .env.local
          </code>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Catatan Penting
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Lihat file <strong>FIREBASE_SETUP.md</strong> untuk panduan lengkap setup Firebase dengan screenshot.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Refresh Setelah Setup
          </button>
        </div>
      </div>
    </div>
  );
}