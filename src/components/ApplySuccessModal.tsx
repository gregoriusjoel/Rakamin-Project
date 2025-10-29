"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type Props = {
  open: boolean;
  onClose?: () => void;
};

export default function ApplySuccessModal({ open, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    const enter = setTimeout(() => setVisible(true), 20);
    const auto = setTimeout(() => {
      if (onClose) onClose();
    }, 5000);

    return () => {
      clearTimeout(enter);
      clearTimeout(auto);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
        className={
          `max-w-lg w-full bg-white rounded-2xl p-8 shadow-2xl text-center transform transition-all duration-500 ease-out ` +
          (visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-3')
        }
      >
        <div className="flex justify-center mb-4">
          <img src="/assets/succesapply.png" alt="success" className="w-48 h-auto" />
        </div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">🎉 Your application was sent!</h2>
        <p className="text-sm text-gray-600 mb-1">Congratulations! You've taken the first step towards a rewarding career at Rakamin.</p>
        <p className="text-sm text-gray-600">We look forward to learning more about you during the application process.</p>
      </div>
    </div>
  );
}
