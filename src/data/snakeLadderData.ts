import { SnakeLadderConfig, SmpGradeLevel, MazeQuestion } from '../types';
import { SMP_MAZE_QUESTIONS } from './mazeData';

export const DEFAULT_SNAKE_LADDER_CONFIG: SnakeLadderConfig = {
  activeGrade: '7',
  mode: 'solo',
  totalPlayers: 2,
  requireCorrectToClimb: true,
  snakeShieldOnCorrect: true,
};

// Ladders mapping: Start tile -> End tile (Going UP)
export const LADDERS_MAP: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

// Snakes mapping: Head tile -> Tail tile (Going DOWN)
export const SNAKES_MAP: Record<number, number> = {
  17: 7,
  54: 34,
  62: 18,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

// Dedicated Question Tiles where player lands and must answer an English challenge
export const QUESTION_TILES = new Set<number>([12, 25, 36, 45, 58, 69, 77, 88]);

// Available Avatars for Players
export const PLAYER_AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'Singa Berani', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-500' },
  { id: 'cat', emoji: '🐱', name: 'Kucing Pintar', color: 'from-pink-400 to-rose-500', bg: 'bg-pink-500' },
  { id: 'rocket', emoji: '🚀', name: 'Roket Penjelajah', color: 'from-indigo-400 to-blue-600', bg: 'bg-indigo-600' },
  { id: 'owl', emoji: '🦉', name: 'Burung Hantu Bijak', color: 'from-emerald-400 to-teal-600', bg: 'bg-emerald-600' },
  { id: 'panda', emoji: '🐼', name: 'Panda Ceria', color: 'from-cyan-400 to-sky-600', bg: 'bg-cyan-600' },
  { id: 'fox', emoji: '🦊', name: 'Rubah Lincah', color: 'from-violet-400 to-purple-600', bg: 'bg-violet-600' },
];

/**
 * Helper to get a curriculum question appropriate for the game
 */
export function getSnakeLadderQuestion(
  grade: SmpGradeLevel,
  usedIds: Set<string> = new Set()
): MazeQuestion {
  let pool = SMP_MAZE_QUESTIONS;
  if (grade !== 'all') {
    pool = SMP_MAZE_QUESTIONS.filter((q) => q.grade === grade);
  }
  if (pool.length === 0) pool = SMP_MAZE_QUESTIONS;

  // Filter unused if possible
  const available = pool.filter((q) => !usedIds.has(q.id));
  const candidateList = available.length > 0 ? available : pool;

  const randomIndex = Math.floor(Math.random() * candidateList.length);
  return candidateList[randomIndex];
}

/**
 * Returns tiles arranged in classic Snake & Ladder zig-zag 10x10 order:
 * Row 10 (top): 100 to 91 (left to right)
 * Row 9: 81 to 90
 * ...
 * Row 1 (bottom): 1 to 10
 */
export function getBoardTilesZigZag(): number[][] {
  const rows: number[][] = [];
  for (let r = 9; r >= 0; r--) {
    const row: number[] = [];
    const isReversed = r % 2 === 1; // Odd rows go right-to-left
    for (let c = 0; c < 10; c++) {
      const tileNum = isReversed ? (r + 1) * 10 - c : r * 10 + c + 1;
      row.push(tileNum);
    }
    rows.push(row);
  }
  return rows;
}
