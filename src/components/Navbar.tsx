"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface NavbarProps {
  left?: React.ReactNode;
}

const Navbar: React.FC<NavbarProps> = ({ left }) => {
  const router = useRouter();
  const { logout, user, userProfile } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [companyInitials, setCompanyInitials] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const first = menuRef.current?.querySelector('button[role="menuitem"]') as HTMLElement | null;
    first?.focus();
  }, [menuOpen]);

  useEffect(() => {
    let mounted = true;
    async function loadCompanyLogo() {
      if (!user) {
        setCompanyLogoUrl(null);
        return;
      }
      try {
        const ref = doc(db, 'companies', user.uid);
        const snap = await getDoc(ref);
        if (mounted && snap.exists()) {
          const data = snap.data() as any;
          setCompanyLogoUrl(data.logoUrl || data.logo || null);
          const name = (data.name || data.companyName || '').trim();
          if (name) {
            const parts = name.split(/\s+/).filter(Boolean);
            let initials = '';
            if (parts.length >= 2) {
              initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            } else if (name.length === 1) {
              initials = name[0].toUpperCase();
            } else {
              initials = (name[0] + name[name.length - 1]).toUpperCase();
            }
            setCompanyInitials(initials);
          } else {
            setCompanyInitials(null);
          }
        }
      } catch (err) {
        console.error('Failed to load company logo for navbar', err);
      }
    }

    loadCompanyLogo();
    return () => { mounted = false; };
  }, [user]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {left ?? <div className="text-lg font-semibold text-black">Job List</div>}
          </div>

          <div className="flex items-center space-x-3 relative" ref={menuRef}>
            <button
              aria-haspopup="true"
              aria-expanded={menuOpen}
              type="button"
              onClick={() => setMenuOpen((s) => !s)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold focus:outline-none overflow-hidden"
            >
              {companyLogoUrl ? (
                <img src={companyLogoUrl} alt="Company logo" className="object-cover w-full h-full" />
              ) : (
                <span className="text-sm font-semibold">{companyInitials}</span>
              )}
            </button>

            <div
              className={
                `origin-top-right absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-150 ease-out ` +
                (menuOpen
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 -translate-y-1 scale-95 pointer-events-none')
              }
              style={{ transformOrigin: 'top right' }}
            >
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  
                  {((userProfile as any)?.role === 'admin') ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        router.push('/admin/CompanyProfile');
                      }}
                      className="group w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Company Profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        router.push('/profile');
                      }}
                      className="group w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2"
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-gray-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Account Profile</span>
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      setLoggingOut(true);
                      setMenuOpen(false);
                      try {
                        await logout();
                        router.replace('/login');
                      } catch (err) {
                        console.error('Logout failed', err);
                      } finally {
                        setLoggingOut(false);
                      }
                    }}
                    className="group w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                    role="menuitem"
                    disabled={loggingOut}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.64 7.64a7 7 0 1 0 12.72 0" />
                    </svg>
                    <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
