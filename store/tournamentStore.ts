import { create } from 'zustand';
import { Player, Team, Round, TournamentState } from '@/types';
import { validateGameScore } from '@/utils/gameScoreValidation';

interface TournamentStore extends TournamentState {
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Teams
  createTeam: (name: string) => Promise<void>;
  updateTeamName: (teamId: string, name: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  addPlayerToTeam: (teamId: string, playerId: string) => Promise<void>;
  removePlayerFromTeam: (teamId: string, playerId: string) => Promise<void>;
  movePlayer: (playerId: string, fromTeamId: string | null, toTeamId: string) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  
  // Rounds
  createRound: (name: string, team1Id: string, team2Id: string) => Promise<void>;
  deleteRound: (roundId: string) => Promise<void>;
  updateRoundLineup: (roundId: string, team: 'team1' | 'team2', playerIds: string[]) => Promise<void>;
  addMatchToRound: (roundId: string, match: Round['matches'][0]) => Promise<void>;
  removeMatchFromRound: (roundId: string, matchId: string) => Promise<void>;
  updateMatchPlayers: (roundId: string, matchId: string, team: 'team1' | 'team2', playerIds: string[]) => Promise<void>;
  updateGameScore: (roundId: string, matchId: string, gameIndex: number, team1Score: number, team2Score: number) => Promise<void>;
  startMatch: (roundId: string, matchId: string) => Promise<void>;
  completeMatch: (roundId: string, matchId: string) => Promise<void>;
  completeRound: (roundId: string) => Promise<void>;
  updateRound: (round: Round) => Promise<void>;
  
  // Players
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>;
  updatePlayer: (playerId: string, playerData: Partial<Player>) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  
  // Data fetching
  fetchPlayers: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchRounds: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

// Helper function to convert MongoDB document to app format
const normalizePlayer = (doc: any): Player => ({
  id: doc.id,
  name: doc.name,
  gender: doc.gender,
  level: doc.level,
});

const normalizeTeam = (doc: any, allPlayers: Player[]): Team => ({
  id: doc.id,
  name: doc.name,
  players: doc.players
    .map((playerId: string) => allPlayers.find((p: Player) => p.id === playerId))
    .filter((p: Player | undefined): p is Player => p !== undefined),
});

const normalizeRound = (doc: any): Round => ({
  id: doc.id,
  name: doc.name,
  team1Id: doc.team1Id,
  team2Id: doc.team2Id,
  team1Lineup: doc.team1Lineup || [],
  team2Lineup: doc.team2Lineup || [],
  matches: (doc.matches || []).map((match: any) => ({
    ...match,
    games: match.games || [],
  })),
  completed: doc.completed || false,
});

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  players: [],
  teams: [],
  rounds: [],
  isLoading: false,
  error: null,

  fetchPlayers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      const players = data.map(normalizePlayer);
      set({ players, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch players', isLoading: false });
    }
  },

  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const { players } = get();
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      const teams = data.map((doc: any) => normalizeTeam(doc, players));
      set({ teams, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch teams', isLoading: false });
    }
  },

  fetchRounds: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/rounds');
      if (!response.ok) throw new Error('Failed to fetch rounds');
      const data = await response.json();
      const rounds = data.map(normalizeRound);
      set({ rounds, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch rounds', isLoading: false });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await get().fetchPlayers();
      await get().fetchTeams();
      await get().fetchRounds();
      set({ isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch data', isLoading: false });
    }
  },

  addPlayer: async (playerData) => {
    const playerId = `p${Date.now()}`;
    const newPlayer: Player = {
      id: playerId,
      ...playerData,
    };

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer),
      });
      if (!response.ok) throw new Error('Failed to add player');
      set((state) => ({ players: [...state.players, newPlayer] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add player' });
      throw error;
    }
  },

  updatePlayer: async (playerId, playerData) => {
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      if (!response.ok) throw new Error('Failed to update player');
      
      set((state) => ({
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, ...playerData } : p
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update player' });
      throw error;
    }
  },

  deletePlayer: async (playerId) => {
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete player');
      set((state) => ({
        players: state.players.filter((p) => p.id !== playerId),
        teams: state.teams.map((team) => ({
          ...team,
          players: team.players.filter((p) => p.id !== playerId),
        })),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete player' });
      throw error;
    }
  },

  createTeam: async (name) => {
    const teamId = `team-${Date.now()}`;
    const newTeam: Team = {
      id: teamId,
      name,
      players: [],
    };

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: teamId, name, players: [] }),
      });
      if (!response.ok) throw new Error('Failed to create team');
      set((state) => ({ teams: [...state.teams, newTeam] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create team' });
    }
  },

  updateTeamName: async (teamId, name) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: teamId, name }),
      });
      if (!response.ok) throw new Error('Failed to update team');
      set((state) => ({
        teams: state.teams.map((team) => (team.id === teamId ? { ...team, name } : team)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update team' });
    }
  },

  deleteTeam: async (teamId) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete team');
      set((state) => ({
        teams: state.teams.filter((team) => team.id !== teamId),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete team' });
      throw error;
    }
  },

  addPlayerToTeam: async (teamId, playerId) => {
    const { players, teams } = get();
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const updatedTeam: Team = {
      ...team,
      players: [...team.players, player],
    };

    try {
      const response = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: teamId,
          players: updatedTeam.players.map((p) => p.id),
        }),
      });
      if (!response.ok) throw new Error('Failed to update team');
      set({ teams: teams.map((t) => (t.id === teamId ? updatedTeam : t)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update team' });
    }
  },

  removePlayerFromTeam: async (teamId, playerId) => {
    const { teams } = get();
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    const updatedTeam: Team = {
      ...team,
      players: team.players.filter((p) => p.id !== playerId),
    };

    try {
      const response = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: teamId,
          players: updatedTeam.players.map((p) => p.id),
        }),
      });
      if (!response.ok) throw new Error('Failed to update team');
      set({ teams: teams.map((t) => (t.id === teamId ? updatedTeam : t)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update team' });
    }
  },

  movePlayer: async (playerId, fromTeamId, toTeamId) => {
    const { players, teams } = get();
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    let updatedTeams = teams.map((team) => {
      if (team.id === fromTeamId) {
        return { ...team, players: team.players.filter((p) => p.id !== playerId) };
      }
      if (team.id === toTeamId && !team.players.find((p) => p.id === playerId)) {
        return { ...team, players: [...team.players, player] };
      }
      return team;
    });

    try {
      // Update both teams
      const fromTeam = updatedTeams.find((t) => t.id === fromTeamId);
      const toTeam = updatedTeams.find((t) => t.id === toTeamId);

      if (fromTeam) {
        await fetch('/api/teams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: fromTeamId,
            players: fromTeam.players.map((p) => p.id),
          }),
        });
      }

      if (toTeam) {
        await fetch('/api/teams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: toTeamId,
            players: toTeam.players.map((p) => p.id),
          }),
        });
      }

      set({ teams: updatedTeams });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to move player' });
    }
  },

  updateTeam: async (team) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: team.id,
          name: team.name,
          players: team.players.map((p) => p.id),
        }),
      });
      if (!response.ok) throw new Error('Failed to update team');
      set((state) => ({
        teams: state.teams.map((t) => (t.id === team.id ? team : t)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update team' });
    }
  },

  createRound: async (name, team1Id, team2Id) => {
    const roundId = `round-${Date.now()}`;
    const { teams } = get();
    const team1 = teams.find((t) => t.id === team1Id);
    const team2 = teams.find((t) => t.id === team2Id);
    
    const newRound: Round = {
      id: roundId,
      name,
      team1Id,
      team2Id,
      team1Lineup: team1 ? team1.players.map((p) => p.id) : [],
      team2Lineup: team2 ? team2.players.map((p) => p.id) : [],
      matches: [],
      completed: false,
    };

    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRound),
      });
      if (!response.ok) throw new Error('Failed to create round');
      set((state) => ({ rounds: [...state.rounds, newRound] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create round' });
    }
  },

  deleteRound: async (roundId) => {
    try {
      const response = await fetch(`/api/rounds/${roundId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete round');
      set((state) => ({
        rounds: state.rounds.filter((round) => round.id !== roundId),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete round' });
      throw error;
    }
  },

  updateRoundLineup: async (roundId, team, playerIds) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const updatedRound: Round = {
      ...round,
      [`${team}Lineup`]: playerIds,
    };

    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          team1Lineup: updatedRound.team1Lineup,
          team2Lineup: updatedRound.team2Lineup,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update round' });
    }
  },

  addMatchToRound: async (roundId, match) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const updatedRound: Round = {
      ...round,
      matches: [...round.matches, match],
    };

    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          matches: updatedRound.matches,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update round' });
    }
  },

  removeMatchFromRound: async (roundId, matchId) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const updatedRound: Round = {
      ...round,
      matches: round.matches.filter((m) => m.id !== matchId),
    };

    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          matches: updatedRound.matches,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update round' });
    }
  },

  updateMatchPlayers: async (roundId, matchId, team, playerIds) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const updatedRound: Round = {
      ...round,
      matches: round.matches.map((match) =>
        match.id === matchId
          ? { ...match, [`${team}Players`]: playerIds }
          : match
      ),
    };

    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          matches: updatedRound.matches,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update round' });
    }
  },

  updateGameScore: async (roundId, matchId, gameIndex, team1Score, team2Score) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const match = round.matches.find((m) => m.id === matchId);
    if (!match) return;

    // Normalize scores (handle NaN, undefined, null, empty string)
    const normalizedScore1 = Number(team1Score) || 0;
    const normalizedScore2 = Number(team2Score) || 0;

    // Validate game score (0 is allowed as a valid score for clearing)
    const validation = validateGameScore(normalizedScore1, normalizedScore2);
    if (!validation.isValid) {
      const errorMsg = validation.errorMessage || 'Invalid game score';
      set({ error: errorMsg });
      alert(errorMsg);
      return;
    }

    // Ensure games array exists and has enough games
    const games = [...(match.games || [])];
    while (games.length <= gameIndex) {
      games.push({ team1Score: 0, team2Score: 0 });
    }
    
    games[gameIndex] = {
      team1Score: normalizedScore1,
      team2Score: normalizedScore2,
      winner: validation.winner,
    };

    // Calculate overall match winner (best of 3)
    const team1Wins = games.filter((g) => g.winner === 'team1').length;
    const team2Wins = games.filter((g) => g.winner === 'team2').length;
    const matchWinner = team1Wins >= 2 ? 'team1' : team2Wins >= 2 ? 'team2' : undefined;

    const updatedRound: Round = {
      ...round,
      matches: round.matches.map((m) =>
        m.id === matchId
          ? { ...m, games, winner: matchWinner }
          : m
      ),
    };

    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          matches: updatedRound.matches,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update round' });
    }
  },

  startMatch: async (roundId, matchId) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const match = round.matches.find((m) => m.id === matchId);
    if (!match) return;

    // Check if match has players assigned
    if (match.team1Players.length === 0 || match.team2Players.length === 0) {
      const errorMsg = 'Both teams must have at least one player to start the match';
      set({ error: errorMsg });
      alert(errorMsg);
      return;
    }

    // Check if any player in this match is already in another started (but not completed) match
    const allPlayerIds = [...match.team1Players, ...match.team2Players];
    for (const otherMatch of round.matches) {
      if (otherMatch.id === matchId) continue;
      
      const otherMatchStarted = !!otherMatch.startedAt;
      const otherMatchCompleted = !!otherMatch.completedAt;
      
      if (otherMatchStarted && !otherMatchCompleted) {
        const otherMatchPlayerIds = [...otherMatch.team1Players, ...otherMatch.team2Players];
        const hasConflict = allPlayerIds.some((playerId) => otherMatchPlayerIds.includes(playerId));
        
        if (hasConflict) {
          const errorMsg = 'Cannot start match: One or more players are already participating in another active match';
          set({ error: errorMsg });
          alert(errorMsg);
          return;
        }
      }
    }

    const startedAt = new Date().toISOString();

    const updatedRound: Round = {
      ...round,
      matches: round.matches.map((m) =>
        m.id === matchId
          ? { ...m, startedAt }
          : m
      ),
    };

    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          matches: updatedRound.matches,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to start match' });
    }
  },

  completeMatch: async (roundId, matchId) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const match = round.matches.find((m) => m.id === matchId);
    if (!match) return;

    if (!match.winner) {
      const errorMsg = 'Match must have a winner before it can be completed';
      set({ error: errorMsg });
      alert(errorMsg);
      return;
    }

    const completedAt = new Date().toISOString();

    const updatedRound: Round = {
      ...round,
      matches: round.matches.map((m) =>
        m.id === matchId
          ? { ...m, completedAt }
          : m
      ),
    };

    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          matches: updatedRound.matches,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to complete match' });
    }
  },

  completeRound: async (roundId) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const updatedRound: Round = { ...round, completed: true };

    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          completed: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update round' });
    }
  },

  updateRound: async (round) => {
    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: round.id,
          name: round.name,
          team1Id: round.team1Id,
          team2Id: round.team2Id,
          team1Lineup: round.team1Lineup,
          team2Lineup: round.team2Lineup,
          matches: round.matches,
          completed: round.completed,
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set((state) => ({
        rounds: state.rounds.map((r) => (r.id === round.id ? round : r)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update round' });
    }
  },
}));
