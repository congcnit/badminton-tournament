import TeamsClient from '@/components/pages/TeamsClient';
import { getTournamentData } from '@/lib/serverData';

export default async function TeamsPage() {
  const { players, teams, rounds } = await getTournamentData();

  return (
    <TeamsClient initialPlayers={players} initialTeams={teams} initialRounds={rounds} />
  );
}

