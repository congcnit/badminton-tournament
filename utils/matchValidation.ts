import { MatchType, Player, Gender } from '@/types';

/**
 * Validates if a player can be added to a match based on match type and existing players
 * @param matchType - The type of match (Men's Doubles, Women's Doubles, Mixed Doubles)
 * @param playerGender - The gender of the player being added
 * @param existingPlayerIds - Array of player IDs already in the team
 * @param allPlayers - Array of all players (to look up genders of existing players)
 * @returns Object with isValid boolean and error message if invalid
 */
export function validatePlayerGenderForMatch(
  matchType: MatchType,
  playerGender: Gender,
  existingPlayerIds: string[],
  allPlayers: Player[]
): { isValid: boolean; errorMessage?: string } {
  // Get genders of existing players
  const existingGenders = existingPlayerIds
    .map((id) => allPlayers.find((p) => p.id === id)?.gender)
    .filter((gender): gender is Gender => gender !== undefined);

  switch (matchType) {
    case "Men's Doubles":
      if (playerGender !== 'M') {
        return {
          isValid: false,
          errorMessage: "Men's Doubles matches can only include male players",
        };
      }
      // Check if any existing player is not male
      if (existingGenders.some((gender) => gender !== 'M')) {
        return {
          isValid: false,
          errorMessage: "Men's Doubles matches can only include male players",
        };
      }
      break;

    case "Women's Doubles":
      if (playerGender !== 'F') {
        return {
          isValid: false,
          errorMessage: "Women's Doubles matches can only include female players",
        };
      }
      // Check if any existing player is not female
      if (existingGenders.some((gender) => gender !== 'F')) {
        return {
          isValid: false,
          errorMessage: "Women's Doubles matches can only include female players",
        };
      }
      break;

    case "Mixed Doubles":
      // Mixed Doubles requires one male and one female per team
      if (existingPlayerIds.length === 0) {
        // First player can be any gender
        return { isValid: true };
      } else if (existingPlayerIds.length === 1) {
        // Second player must be opposite gender of first player
        const firstPlayerGender = existingGenders[0];
        if (firstPlayerGender === playerGender) {
          return {
            isValid: false,
            errorMessage: 'Mixed Doubles requires one male and one female player per team',
          };
        }
      } else {
        // Should not happen (doubles max is 2), but handle it
        return {
          isValid: false,
          errorMessage: 'Mixed Doubles can only have 2 players per team',
        };
      }
      break;

    default:
      return { isValid: true };
  }

  return { isValid: true };
}
