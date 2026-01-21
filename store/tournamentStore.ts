import { create } from 'zustand';
import { Player, Team, Round, TournamentState } from '@/types';
import { validateGameScore } from '@/utils/gameScoreValidation';

interface TournamentStore extends TournamentState {
  // Loading states
  isLoading: boolean;
  error: string | null;
  pendingRequests: number;
  hasHydrated: boolean;
  hydrate: (data: TournamentState) => void;
  
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
  stopMatch: (roundId: string, matchId: string) => Promise<void>;
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
  subRounds: doc.subRounds || [],
});

export const useTournamentStore = create<TournamentStore>((set, get) => {
  const startRequest = () => {
    set((state) => ({
      pendingRequests: state.pendingRequests + 1,
      isLoading: true,
      error: null,
    }));
  };

  const finishRequest = () => {
    set((state) => {
      const pendingRequests = Math.max(0, state.pendingRequests - 1);
      return { pendingRequests, isLoading: pendingRequests > 0 };
    });
  };

  return ({
  players: [],
  teams: [],
  rounds: [],
  isLoading: false,
  error: null,
  pendingRequests: 0,
  hasHydrated: false,

  hydrate: (data) => {
    set((state) => {
      if (state.hasHydrated) {
        return state;
      }
      return {
        ...state,
        players: data.players,
        teams: data.teams,
        rounds: data.rounds,
        hasHydrated: true,
      };
    });
  },

  fetchPlayers: async () => {
    startRequest();
    try {
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      const players = data.map(normalizePlayer);
      set({ players });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch players' });
    } finally {
      finishRequest();
    }
  },

  fetchTeams: async () => {
    startRequest();
    try {
      const { players } = get();
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      const teams = data.map((doc: any) => normalizeTeam(doc, players));
      set({ teams });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch teams' });
    } finally {
      finishRequest();
    }
  },

  fetchRounds: async () => {
    startRequest();
    try {
      const response = await fetch('/api/rounds');
      if (!response.ok) throw new Error('Failed to fetch rounds');
      const data = await response.json();
      const rounds = data.map(normalizeRound);
      set({ rounds });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch rounds' });
    } finally {
      finishRequest();
    }
  },

  fetchAll: async () => {
    await Promise.all([get().fetchPlayers(), get().fetchTeams(), get().fetchRounds()]);
  },

  addPlayer: async (playerData) => {
    const playerId = `p${Date.now()}`;
    const newPlayer: Player = {
      id: playerId,
      ...playerData,
    };

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  updatePlayer: async (playerId, playerData) => {
    startRequest();
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
        teams: state.teams.map((team) => ({
          ...team,
          players: team.players.map((player) =>
            player.id === playerId ? { ...player, ...playerData } : player
          ),
        })),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update player' });
      throw error;
    } finally {
      finishRequest();
    }
  },

  deletePlayer: async (playerId) => {
    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  createTeam: async (name) => {
    const teamId = `team-${Date.now()}`;
    const newTeam: Team = {
      id: teamId,
      name,
      players: [],
    };

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  updateTeamName: async (teamId, name) => {
    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  deleteTeam: async (teamId) => {
    startRequest();
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
    } finally {
      finishRequest();
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

    startRequest();
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
    } finally {
      finishRequest();
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

    startRequest();
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
    } finally {
      finishRequest();
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

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  updateTeam: async (team) => {
    startRequest();
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
    } finally {
      finishRequest();
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
      subRounds: [],
    };

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  deleteRound: async (roundId) => {
    startRequest();
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
    } finally {
      finishRequest();
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

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  addMatchToRound: async (roundId, match) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const updatedRound: Round = {
      ...round,
      matches: [...round.matches, match],
      subRounds: [],
    };

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  removeMatchFromRound: async (roundId, matchId) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const updatedRound: Round = {
      ...round,
      matches: round.matches.filter((m) => m.id !== matchId),
      subRounds: [],
    };

    startRequest();
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
    } finally {
      finishRequest();
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
      subRounds: [],
    };

    startRequest();
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
    } finally {
      finishRequest();
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

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  startMatch: async (roundId, matchId) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const match = round.matches.find((m) => m.id === matchId);
    if (!match) return;

    const hasUnassignedMatch = round.matches.some(
      (item) => item.team1Players.length < 2 || item.team2Players.length < 2
    );
    if (hasUnassignedMatch) {
      const errorMsg = 'Assign players for all matches before starting any match';
      set({ error: errorMsg });
      alert(errorMsg);
      return;
    }

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

    const subRounds = round.subRounds || [];
    if (subRounds.length === 2) {
      const activeSubRoundIndex = subRounds.findIndex((group) =>
        group.some((id) => {
          const groupedMatch = round.matches.find((m) => m.id === id);
          return groupedMatch?.startedAt && !groupedMatch?.completedAt;
        })
      );
      if (activeSubRoundIndex !== -1) {
        const matchSubRoundIndex = subRounds.findIndex((group) => group.includes(matchId));
        if (matchSubRoundIndex !== -1 && matchSubRoundIndex !== activeSubRoundIndex) {
          const errorMsg = 'Cannot start match: another sub-round is already in progress';
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

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  stopMatch: async (roundId, matchId) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const match = round.matches.find((m) => m.id === matchId);
    if (!match) return;

    const updatedRound: Round = {
      ...round,
      matches: round.matches.map((m) =>
        m.id === matchId
          ? { ...m, startedAt: undefined, completedAt: undefined, winner: undefined, games: [] }
          : m
      ),
    };

    startRequest();
    try {
      const response = await fetch('/api/rounds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roundId,
          matches: updatedRound.matches,
        }),
      });
      if (!response.ok) throw new Error('Failed to stop match');
      set({ rounds: rounds.map((r) => (r.id === roundId ? updatedRound : r)) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to stop match' });
    } finally {
      finishRequest();
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

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  completeRound: async (roundId) => {
    const { rounds } = get();
    const round = rounds.find((r) => r.id === roundId);
    if (!round) return;

    const updatedRound: Round = { ...round, completed: true };

    startRequest();
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
    } finally {
      finishRequest();
    }
  },

  updateRound: async (round) => {
    startRequest();
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
          subRounds: round.subRounds || [],
        }),
      });
      if (!response.ok) throw new Error('Failed to update round');
      set((state) => ({
        rounds: state.rounds.map((r) => (r.id === round.id ? round : r)),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update round' });
    } finally {
      finishRequest();
    }
  },
  });
});
