import React, { useEffect } from 'react';

type Props = {
  message: string;
  visible: boolean;
  duration?: number;
  onClose?: () => void;
};

const Toast: React.FC<Props> = ({ message, visible, duration = 4000, onClose }) => {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed z-50 bottom-8 left-8">
      <div className="relative max-w-md">
  <div className="absolute left-0 top-0 bottom-0 w-2 bg-teal-400 rounded-l-xl" />

        <div className="bg-white border border-gray-100 rounded-xl pl-6 pr-4 py-3 shadow-2xl flex items-center gap-4" role="status" aria-live="polite">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          </div>

          <div className="flex-1 text-sm text-gray-800 font-medium">{message}</div>

          <button
            onClick={() => onClose && onClose()}
            className="text-gray-400 hover:text-gray-600 p-2 rounded focus:outline-none"
            aria-label="Close notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
