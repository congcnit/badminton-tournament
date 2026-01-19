'use client';

import { Match, MatchType, Player, Round } from '@/types';
import PlayerCard from './PlayerCard';
import { validatePlayerGenderForMatch } from '@/utils/matchValidation';
import { validatePlayerAdditionToMatch } from '@/utils/roundValidation';

interface MatchCardProps {
  match: Match;
  team1Name: string;
  team2Name: string;
  team1Players?: Player[];
  team2Players?: Player[];
  allTeam1Players?: Player[];
  allTeam2Players?: Player[];
  allMatches?: Match[]; // All matches in the round to check for conflicts
  round?: Round; // The round this match belongs to
  team1PlayerIds?: string[]; // All player IDs in team1
  team2PlayerIds?: string[]; // All player IDs in team2
  onGameScoreUpdate?: (gameIndex: number, team1Score: number, team2Score: number) => void;
  onPlayerRemove?: (team: 'team1' | 'team2', playerId: string) => void;
  onAddPlayer?: (team: 'team1' | 'team2', playerId: string) => void;
  onRemove?: () => void;
  onStartMatch?: () => void;
  onCompleteMatch?: () => void;
  editable?: boolean;
}

// Match types are now the labels themselves, no mapping needed

export default function MatchCard({
  match,
  team1Name,
  team2Name,
  team1Players = [],
  team2Players = [],
  allTeam1Players = [],
  allTeam2Players = [],
  allMatches = [],
  round,
  team1PlayerIds = [],
  team2PlayerIds = [],
  onGameScoreUpdate,
  onPlayerRemove,
  onAddPlayer,
  onRemove,
  onStartMatch,
  onCompleteMatch,
  editable = false,
}: MatchCardProps) {
  const team1Won = match.winner === 'team1';
  const team2Won = match.winner === 'team2';
  const games = match.games || [];
  const isDoubles = ["Men's Doubles", "Mixed Doubles", "Women's Doubles"].includes(match.type);
  const maxPlayers = isDoubles ? 2 : 1;
  const isStarted = !!match.startedAt;
  const isCompleted = !!match.completedAt;
  const hasWinner = !!match.winner;
  const hasPlayers = team1Players.length > 0 && team2Players.length > 0;
  
  // Check if any player in this match is already in another started (but not completed) match
  const hasPlayerConflict = () => {
    if (!hasPlayers || isStarted) return false;
    
    const allPlayerIds = [...match.team1Players, ...match.team2Players];
    
    // Check other matches in the round
    for (const otherMatch of allMatches) {
      // Skip the current match
      if (otherMatch.id === match.id) continue;
      
      // Check if the other match is started but not completed
      const otherMatchStarted = !!otherMatch.startedAt;
      const otherMatchCompleted = !!otherMatch.completedAt;
      
      if (otherMatchStarted && !otherMatchCompleted) {
        // Check if any player from this match is in the other match
        const otherMatchPlayerIds = [...otherMatch.team1Players, ...otherMatch.team2Players];
        const hasConflict = allPlayerIds.some((playerId) => otherMatchPlayerIds.includes(playerId));
        
        if (hasConflict) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  const playerConflict = hasPlayerConflict();
  const canStartMatch = hasPlayers && !isStarted && !playerConflict;

  // Calculate match duration
  const getMatchDuration = () => {
    if (!match.startedAt) return null;
    const startTime = new Date(match.startedAt).getTime();
    const endTime = match.completedAt ? new Date(match.completedAt).getTime() : Date.now();
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Filter available players for each team based on match type and existing players
  const getAvailablePlayers = (team: 'team1' | 'team2'): Player[] => {
    const allPlayers = team === 'team1' ? allTeam1Players : allTeam2Players;
    const currentPlayerIds = team === 'team1' ? match.team1Players : match.team2Players;
    
    return allPlayers.filter((player) => {
      // Don't show already selected players
      if (currentPlayerIds.includes(player.id)) {
        return false;
      }
      
      // Check if player can be added based on match type
      const genderValidation = validatePlayerGenderForMatch(
        match.type,
        player.gender,
        currentPlayerIds,
        allPlayers
      );
      
      if (!genderValidation.isValid) {
        return false;
      }
      
      // Check round rules if round is available
      if (round && team1PlayerIds.length > 0 && team2PlayerIds.length > 0) {
        const roundValidation = validatePlayerAdditionToMatch(
          round,
          match.id,
          team,
          player.id,
          team1PlayerIds,
          team2PlayerIds
        );
        
        if (!roundValidation.isValid) {
          return false;
        }
      }
      
      return true;
    });
  };

  const handlePlayerSelect = (team: 'team1' | 'team2', playerId: string) => {
    if (playerId && onAddPlayer) {
      onAddPlayer(team, playerId);
    }
  };

  const isInPlay = isStarted && !isCompleted;

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg border p-4 relative ${
      isInPlay 
        ? 'border-green-500 match-in-play' 
        : 'border-gray-700'
    }`}>
      {editable && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-500/20 transition-all"
          title="Remove match"
        >
          ×
        </button>
      )}
      <div className={`flex items-center justify-between mb-3 ${editable && onRemove ? 'pr-8' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-sm font-bold bg-purple-600/30 text-purple-300 border border-purple-500/50 flex items-center gap-2">
            {match.type === "Men's Doubles" && <span>👨‍👨</span>}
            {match.type === "Women's Doubles" && <span>👩‍👩</span>}
            {match.type === "Mixed Doubles" && <span>👨‍👩</span>}
            {match.type}
          </span>
          {isStarted && (
            <span className="text-xs text-gray-500">
              Duration: {getMatchDuration()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editable && !isStarted && onStartMatch && (
            <button
              onClick={onStartMatch}
              disabled={!canStartMatch}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                canStartMatch
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-60'
              }`}
              title={
                !hasPlayers
                  ? 'Both teams must have at least one player to start the match'
                  : playerConflict
                  ? 'Cannot start match: One or more players are already in another active match'
                  : 'Start match'
              }
            >
              Start Match
            </button>
          )}
          {editable && isStarted && !isCompleted && hasWinner && onCompleteMatch && (
            <button
              onClick={onCompleteMatch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold transition-all"
              title="Complete match"
            >
              Complete Match
            </button>
          )}
        </div>
      </div>

      {editable && !isStarted && playerConflict && (
        <div className="mb-3 p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-xs text-yellow-400">
          ⚠️ Cannot start match: One or more players are already participating in another active match
        </div>
      )}

      <div className="flex items-center gap-4">
        <div
          className={`flex-1 p-3 rounded-lg relative ${
            team1Won ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-700/50'
          }`}
        >
          {team1Won && (
            <span className="absolute top-2 right-2 text-green-400 text-2xl" title={`${team1Name} Wins`}>
              🏆
            </span>
          )}
          <div className="text-xs text-gray-400 mb-2">
            {team1Name}
          </div>
          {team1Players.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2 justify-center">
              {team1Players.map((player) => (
                <div key={player.id} className="relative group">
                  <PlayerCard player={player} size="sm" />
                  {editable && onPlayerRemove && (
                    <button
                      onClick={() => onPlayerRemove('team1', player.id)}
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove player"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editable && team1Players.length < maxPlayers && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handlePlayerSelect('team1', e.target.value);
                  e.target.value = ''; // Reset dropdown
                }
              }}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500"
              defaultValue=""
            >
              <option value="">Select player {isDoubles ? `(${team1Players.length}/2)` : ''}</option>
              {getAvailablePlayers('team1').map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="text-gray-500 font-bold">vs</div>

        <div
          className={`flex-1 p-3 rounded-lg relative ${
            team2Won ? 'bg-green-500/20 border border-green-500/50' : 'bg-gray-700/50'
          }`}
        >
          {team2Won && (
            <span className="absolute top-2 left-2 text-green-400 text-2xl" title={`${team2Name} Wins`}>
              🏆
            </span>
          )}
          <div className="text-xs text-gray-400 mb-2 text-right">
            {team2Name}
          </div>
          {team2Players.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2 justify-center">
              {team2Players.map((player) => (
                <div key={player.id} className="relative group">
                  <PlayerCard player={player} size="sm" />
                  {editable && onPlayerRemove && (
                    <button
                      onClick={() => onPlayerRemove('team2', player.id)}
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove player"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {editable && team2Players.length < maxPlayers && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handlePlayerSelect('team2', e.target.value);
                  e.target.value = ''; // Reset dropdown
                }
              }}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500"
              defaultValue=""
            >
              <option value="">Select player {isDoubles ? `(${team2Players.length}/2)` : ''}</option>
              {getAvailablePlayers('team2').map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Games Section */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2 font-semibold">Games (Best of 3)</div>
        <div className="space-y-2">
          {[0, 1, 2].map((gameIndex) => {
            const game = games[gameIndex] || { team1Score: 0, team2Score: 0 };
            return (
              <div key={gameIndex} className="flex items-center gap-3 text-xs">
                <span className="text-gray-500 w-12">Game {gameIndex + 1}:</span>
                {editable ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs w-16 text-right">{team1Name}</span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={game.team1Score === 0 ? '' : (game.team1Score ?? '')}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty input for deletion - set to 0
                          if (value === '') {
                            onGameScoreUpdate?.(gameIndex, 0, game.team2Score || 0);
                            return;
                          }
                          const score = parseInt(value, 10);
                          // Only update if it's a valid number
                          if (!isNaN(score) && score >= 0 && score <= 30) {
                            onGameScoreUpdate?.(gameIndex, score, game.team2Score || 0);
                          }
                        }}
                        onBlur={(e) => {
                          // If empty on blur, ensure it's set to 0
                          if (e.target.value === '') {
                            onGameScoreUpdate?.(gameIndex, 0, game.team2Score || 0);
                          }
                        }}
                        disabled={!isStarted || isCompleted}
                        className={`w-12 text-center bg-gray-800 border border-gray-600 rounded px-1 py-1 text-white text-xs focus:outline-none focus:border-blue-500 ${
                          !isStarted || isCompleted ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="0"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={game.team2Score === 0 ? '' : (game.team2Score ?? '')}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty input for deletion - set to 0
                          if (value === '') {
                            onGameScoreUpdate?.(gameIndex, game.team1Score || 0, 0);
                            return;
                          }
                          const score = parseInt(value, 10);
                          // Only update if it's a valid number
                          if (!isNaN(score) && score >= 0 && score <= 30) {
                            onGameScoreUpdate?.(gameIndex, game.team1Score || 0, score);
                          }
                        }}
                        onBlur={(e) => {
                          // If empty on blur, ensure it's set to 0
                          if (e.target.value === '') {
                            onGameScoreUpdate?.(gameIndex, game.team1Score || 0, 0);
                          }
                        }}
                        disabled={!isStarted || isCompleted}
                        className={`w-12 text-center bg-gray-800 border border-gray-600 rounded px-1 py-1 text-white text-xs focus:outline-none focus:border-blue-500 ${
                          !isStarted || isCompleted ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="0"
                      />
                      <span className="text-gray-400 text-xs w-16">{team2Name}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs w-16 text-right">{team1Name}</span>
                    <span className="text-white font-semibold">
                      {game.team1Score || 0} - {game.team2Score || 0}
                    </span>
                    <span className="text-gray-400 text-xs w-16">{team2Name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}



