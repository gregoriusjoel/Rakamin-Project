"use client";

import React from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

export default function RegisterSuccess() {
  const search = useSearchParams();
  const router = useRouter();
  const email = search?.get('email') || '';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Periksa Email Anda</h1>
          <p className="text-sm text-gray-600 mb-6">Kami sudah mengirimkan link register ke <span className="font-medium text-gray-900">{email}</span> yang berlaku dalam <span className="font-medium">30 menit</span></p>
        </div>

        <div className="flex justify-center">
          <Image src="/assets/verifemail.png" alt="verify email" width={280} height={200} className="object-contain" />
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-5 py-3 rounded-lg bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
          >
            Kembali ke beranda
          </button>
        </div>
      </div>
    </div>
  );
}
