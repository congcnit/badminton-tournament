import { Round, Match, Player } from '@/types';

export interface RoundValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates round player assignments according to rules:
 * - Each player must play at least 1 match
 * - Max 2 matches per player
 * - The same pair of players cannot be used in more than 1 match
 * - Each player can play only 1 Mixed Doubles match
 */
export function validateRoundPlayerAssignments(
  round: Round,
  team1PlayerIds: string[],
  team2PlayerIds: string[],
  allPlayers: Player[] = []
): RoundValidationResult {
  const errors: string[] = [];
  
  // Helper function to get player name
  const getPlayerName = (playerId: string): string => {
    const player = allPlayers.find((p) => p.id === playerId);
    return player ? player.name : playerId;
  };
  
  // Get all players from both teams
  const allPlayerIds = [...team1PlayerIds, ...team2PlayerIds];
  
  // Track player match counts
  const playerMatchCounts = new Map<string, number>();
  const playerMixedDoublesCounts = new Map<string, number>();
  
  // Track player pairs to detect duplicates
  const playerPairs = new Set<string>();
  
  // Initialize counts
  allPlayerIds.forEach((playerId) => {
    playerMatchCounts.set(playerId, 0);
    playerMixedDoublesCounts.set(playerId, 0);
  });
  
  // Process each match
  round.matches.forEach((match) => {
    // Get all players in this match
    const matchPlayers = [...match.team1Players, ...match.team2Players];
    
    // Count matches per player
    matchPlayers.forEach((playerId) => {
      const currentCount = playerMatchCounts.get(playerId) || 0;
      playerMatchCounts.set(playerId, currentCount + 1);
      
      // Count Mixed Doubles matches per player
      if (match.type === "Mixed Doubles") {
        const currentMixedCount = playerMixedDoublesCounts.get(playerId) || 0;
        playerMixedDoublesCounts.set(playerId, currentMixedCount + 1);
      }
    });
    
    // Check for duplicate player pairs
    if (match.team1Players.length === 2 && match.team2Players.length === 2) {
      // For doubles matches, check both teams
      const team1Pair = [...match.team1Players].sort().join('-');
      const team2Pair = [...match.team2Players].sort().join('-');
      
      if (playerPairs.has(team1Pair)) {
        const player1Name = getPlayerName(match.team1Players[0]);
        const player2Name = getPlayerName(match.team1Players[1]);
        errors.push(`The pair of players (${player1Name}, ${player2Name}) is used in more than one match`);
      } else {
        playerPairs.add(team1Pair);
      }
      
      if (playerPairs.has(team2Pair)) {
        const player1Name = getPlayerName(match.team2Players[0]);
        const player2Name = getPlayerName(match.team2Players[1]);
        errors.push(`The pair of players (${player1Name}, ${player2Name}) is used in more than one match`);
      } else {
        playerPairs.add(team2Pair);
      }
    }
  });
  
  // Check: Each player must play at least 1 match
  allPlayerIds.forEach((playerId) => {
    const matchCount = playerMatchCounts.get(playerId) || 0;
    if (matchCount === 0) {
      errors.push(`${getPlayerName(playerId)} must play at least 1 match`);
    }
  });
  
  // Check: Max 2 matches per player
  allPlayerIds.forEach((playerId) => {
    const matchCount = playerMatchCounts.get(playerId) || 0;
    if (matchCount > 2) {
      errors.push(`${getPlayerName(playerId)} is playing in ${matchCount} matches (maximum is 2)`);
    }
  });
  
  // Check: Each player can play only 1 Mixed Doubles match
  allPlayerIds.forEach((playerId) => {
    const mixedCount = playerMixedDoublesCounts.get(playerId) || 0;
    if (mixedCount > 1) {
      errors.push(`${getPlayerName(playerId)} is playing in ${mixedCount} Mixed Doubles matches (maximum is 1)`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates if a player can be added to a match based on round rules
 */
export function validatePlayerAdditionToMatch(
  round: Round,
  matchId: string,
  team: 'team1' | 'team2',
  playerId: string,
  team1PlayerIds: string[],
  team2PlayerIds: string[]
): { isValid: boolean; errorMessage?: string } {
  const match = round.matches.find((m) => m.id === matchId);
  if (!match) {
    return { isValid: false, errorMessage: 'Match not found' };
  }
  
  // Get current players in the match
  const currentPlayers = team === 'team1' ? match.team1Players : match.team2Players;
  const newPlayers = [...currentPlayers, playerId];
  
  // Check: Max 2 matches per player
  const allPlayerIds = [...team1PlayerIds, ...team2PlayerIds];
  let playerMatchCount = 0;
  round.matches.forEach((m) => {
    const allMatchPlayers = [...m.team1Players, ...m.team2Players];
    if (allMatchPlayers.includes(playerId)) {
      playerMatchCount++;
    }
  });
  
  // If adding this player would exceed 2 matches
  if (!currentPlayers.includes(playerId) && playerMatchCount >= 2) {
    return {
      isValid: false,
      errorMessage: 'Player is already playing in 2 matches (maximum is 2)',
    };
  }
  
  // Check: Each player can play only 1 Mixed Doubles match
  if (match.type === "Mixed Doubles") {
    let mixedDoublesCount = 0;
    round.matches.forEach((m) => {
      if (m.type === "Mixed Doubles") {
        const allMatchPlayers = [...m.team1Players, ...m.team2Players];
        if (allMatchPlayers.includes(playerId)) {
          mixedDoublesCount++;
        }
      }
    });
    
    if (!currentPlayers.includes(playerId) && mixedDoublesCount >= 1) {
      return {
        isValid: false,
        errorMessage: 'Player is already playing in 1 Mixed Doubles match (maximum is 1)',
      };
    }
  }
  
  // Check: The same pair of players cannot be used in more than 1 match
  if (newPlayers.length === 2) {
    // For doubles matches, check if this pair already exists
    const pair = [...newPlayers].sort().join('-');
    
    for (const m of round.matches) {
      if (m.id !== matchId) {
        // Check team1 pair
        if (m.team1Players.length === 2) {
          const team1Pair = [...m.team1Players].sort().join('-');
          if (team1Pair === pair) {
            return {
              isValid: false,
              errorMessage: 'This pair of players is already used in another match',
            };
          }
        }
        // Check team2 pair
        if (m.team2Players.length === 2) {
          const team2Pair = [...m.team2Players].sort().join('-');
          if (team2Pair === pair) {
            return {
              isValid: false,
              errorMessage: 'This pair of players is already used in another match',
            };
          }
        }
      }
    }
  }
  
  return { isValid: true };
}
