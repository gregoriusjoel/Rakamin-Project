import React, { useEffect } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 py-10">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl w-full max-w-4xl mx-auto overflow-hidden transform transition-all duration-200 border border-gray-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-gray-600 hover:text-gray-800 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 8.586L15.95 2.636a1 1 0 011.414 1.414L11.414 10l5.95 5.95a1 1 0 01-1.414 1.414L10 11.414l-5.95 5.95A1 1 0 012.636 15.95L8.586 10 2.636 4.05A1 1 0 014.05 2.636L10 8.586z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[72vh] overflow-auto bg-white">{children}</div>

    <div className="px-6 py-4 bg-white text-right border-t border-gray-300">
          {footer ? (
            footer
          ) : (
            <button onClick={onClose} className="px-4 py-2 rounded border text-sm">Close</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
