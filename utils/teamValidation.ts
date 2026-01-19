import { Team, Player } from '@/types';

export interface TeamValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTeam(team: Team): TeamValidationResult {
  // No constraints - teams can have any number of players
  return {
    isValid: true,
    errors: [],
    warnings: [],
  };
}

export function calculateTeamStrength(team: Team): number {
  const levelPoints: Record<string, number> = {
    'Nguyên Anh': 4,
    'Kết Đan': 3,
    'Trúc Cơ': 2,
    'Luyện Khí Kỳ': 1,
  };

  return team.players.reduce((sum, player) => {
    return sum + (levelPoints[player.level] || 0);
  }, 0);
}

