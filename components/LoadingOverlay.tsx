'use client';

import { useAuthStore } from '@/store/authStore';
import { useTournamentStore } from '@/store/tournamentStore';

export default function LoadingOverlay() {
  const { isLoading: authLoading } = useAuthStore();
  const { isLoading: tournamentLoading } = useTournamentStore();

  if (!authLoading && !tournamentLoading) {
    return null;
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-[100]">
      <div className="h-1 w-full overflow-hidden bg-gray-800/80">
        <div className="h-full w-1/2 animate-loading-bar bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400" />
      </div>
    </div>
  );
}
