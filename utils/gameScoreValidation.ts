/**
 * Validates badminton game score according to rules:
 * - Win at 21 points (must be exactly 21)
 * - If score is 20-20, must win by 2 points
 * - If score is 29-29, first to 30 wins (max 30 points)
 * @param team1Score - Score for team 1
 * @param team2Score - Score for team 2
 * @returns Object with isValid boolean, winner if game is complete, and error message if invalid
 */
export function validateGameScore(
  team1Score: number,
  team2Score: number
): { isValid: boolean; winner?: 'team1' | 'team2'; errorMessage?: string } {
  // Handle invalid inputs (NaN, undefined, null)
  const score1 = Number(team1Score) || 0;
  const score2 = Number(team2Score) || 0;
  
  // Scores cannot be negative
  if (score1 < 0 || score2 < 0) {
    return {
      isValid: false,
      errorMessage: 'Scores cannot be negative',
    };
  }

  // Maximum score is 30
  if (score1 > 30 || score2 > 30) {
    return {
      isValid: false,
      errorMessage: 'Maximum score is 30',
    };
  }

  // If one team has 30, they win (29-29 scenario)
  if (score1 === 30) {
    if (score2 < 29) {
      return {
        isValid: false,
        errorMessage: 'Score cannot reach 30 unless opponent has at least 29',
      };
    }
    return { isValid: true, winner: 'team1' };
  }

  if (score2 === 30) {
    if (score1 < 29) {
      return {
        isValid: false,
        errorMessage: 'Score cannot reach 30 unless opponent has at least 29',
      };
    }
    return { isValid: true, winner: 'team2' };
  }

  // If score is 20-20, must win by 2 points
  if (score1 >= 20 && score2 >= 20) {
    const diff = Math.abs(score1 - score2);
    
    // If difference is 2 or more, the higher score wins
    if (diff >= 2) {
      if (score1 > score2) {
        return { isValid: true, winner: 'team1' };
      } else {
        return { isValid: true, winner: 'team2' };
      }
    }
    
    // If difference is less than 2, game is still in progress (valid but no winner yet)
    if (diff === 0) {
      // Both teams have same score >= 20, game continues
      return { isValid: true };
    }
    
    // If difference is 1, game continues
    return { isValid: true };
  }

  // Normal win at 21 points
  if (score1 === 21 && score2 < 20) {
    return { isValid: true, winner: 'team1' };
  }

  if (score2 === 21 && score1 < 20) {
    return { isValid: true, winner: 'team2' };
  }

  // If one team has 21 but opponent has 20 or more, invalid (should be deuce)
  if (score1 === 21 && score2 >= 20) {
    return {
      isValid: false,
      errorMessage: 'At 20-20 or higher, must win by 2 points',
    };
  }

  if (score2 === 21 && score1 >= 20) {
    return {
      isValid: false,
      errorMessage: 'At 20-20 or higher, must win by 2 points',
    };
  }

  // Scores above 21 are only valid in deuce scenarios (20-20+)
  if (score1 > 21 && score2 < 20) {
    return {
      isValid: false,
      errorMessage: 'Score cannot exceed 21 unless opponent has at least 20',
    };
  }

  if (score2 > 21 && score1 < 20) {
    return {
      isValid: false,
      errorMessage: 'Score cannot exceed 21 unless opponent has at least 20',
    };
  }

  // Game is still in progress
  return { isValid: true };
}
