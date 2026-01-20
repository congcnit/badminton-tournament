import PlayersClient from '@/components/pages/PlayersClient';
import { getTournamentData } from '@/lib/serverData';

export default async function PlayersPage() {
  const { players, teams, rounds } = await getTournamentData();

  return (
    <PlayersClient initialPlayers={players} initialTeams={teams} initialRounds={rounds} />
  );
}

