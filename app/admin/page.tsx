'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import AdminTokenModal from '@/components/AdminTokenModal';
import { useAuthStore } from '@/store/authStore';

export default function AdminPage() {
  const { role, isAuthenticated, _hasHydrated, checkAuth } = useAuthStore();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) {
      checkAuth();
    }
  }, [_hasHydrated, checkAuth]);

  useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || role !== 'admin')) {
      setShowModal(true);
    }
  }, [_hasHydrated, isAuthenticated, role]);

  const handleModalClose = () => {
    if (!isAuthenticated || role !== 'admin') {
      router.push('/');
    } else {
      setShowModal(false);
    }
  };

  if (!isAuthenticated || role !== 'admin') {
    return (
      <>
        {showModal && <AdminTokenModal onClose={handleModalClose} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Administrative controls and settings</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Admin Features</h2>
          <p className="text-gray-400">
            You are logged in as an administrator. All pages are now editable.
          </p>
        </div>
      </main>
    </div>
  );
}
