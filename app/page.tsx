import StandingsClient from '@/components/pages/StandingsClient';
import { getTournamentData } from '@/lib/serverData';

export default async function HomePage() {
  const { players, teams, rounds } = await getTournamentData();

  return (
    <StandingsClient initialPlayers={players} initialTeams={teams} initialRounds={rounds} />
  );
}

