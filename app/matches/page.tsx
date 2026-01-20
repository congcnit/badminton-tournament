import RoundsClient from '@/components/pages/RoundsClient';
import { getTournamentData } from '@/lib/serverData';

export default async function MatchesPage() {
  const { players, teams, rounds } = await getTournamentData();

  return (
    <RoundsClient initialPlayers={players} initialTeams={teams} initialRounds={rounds} />
  );
}
