'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface AdminTokenModalProps {
  onClose?: () => void;
}

export default function AdminTokenModal({ onClose }: AdminTokenModalProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(token);
    if (success) {
      if (onClose) {
        onClose();
      } else {
        router.push('/admin');
      }
    } else {
      setError('Invalid admin token. Please try again.');
      setToken('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Admin Access</h2>
        <p className="text-gray-400 mb-6">Please enter the admin token to access admin features.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
              placeholder="Enter admin token"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              Login
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
