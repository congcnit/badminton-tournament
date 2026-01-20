import DashboardClient from '@/components/pages/DashboardClient';
import { getTournamentData } from '@/lib/serverData';

export default async function Dashboard() {
  const { players, teams, rounds } = await getTournamentData();

  return (
    <DashboardClient initialPlayers={players} initialTeams={teams} initialRounds={rounds} />
  );
}

