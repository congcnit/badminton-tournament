'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/', label: 'Standings' },
  { href: '/players', label: 'Players' },
  { href: '/teams', label: 'Teams' },
  { href: '/matches', label: 'Matches' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { role, isAuthenticated, logout, _hasHydrated, checkAuth } = useAuthStore();

  // Check auth status from server on mount
  useEffect(() => {
    if (!_hasHydrated) {
      checkAuth();
    }
  }, [_hasHydrated, checkAuth]);

  return (
    <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Sioux Badminton Tournament
            </h1>
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && role === 'admin' && (
              <>
                <span className="text-xs text-purple-400 font-semibold">Admin Mode</span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

