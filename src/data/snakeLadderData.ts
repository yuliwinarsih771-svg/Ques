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
// Exact match with user's uploaded classic cartoon board image:
export const LADDERS_MAP: Record<number, number> = {
  4: 16, // Tangga kayu dari petak 4 naik ke 16
  13: 34, // Tangga kayu dari petak 13 naik ke 34
  33: 49, // Tangga kayu dari petak 33 naik ke 49
  42: 63, // Tangga kayu dari petak 42 naik ke 63
  50: 69, // Tangga kayu dari petak 50 naik ke 69
  62: 81, // Tangga kayu dari petak 62 naik ke 81
  74: 92, // Tangga kayu dari petak 74 naik ke 92
};

// Snakes mapping: Head tile -> Tail tile (Going DOWN)
// Exact match with user's uploaded classic cartoon board image:
export const SNAKES_MAP: Record<number, number> = {
  14: 5, // Ular belang merah-kuning kepala di 14 turun ke 5
  21: 2, // Ular oranye kepala di 21 turun ke 2
  38: 18, // Ular hijau muda kepala di 38 turun ke 18
  47: 31, // Ular biru ceria kepala di 47 turun ke 31
  66: 45, // Ular ungu berbintik kepala di 66 turun ke 45
  76: 58, // Ular hijau sisik kuning kepala di 76 turun ke 58
  89: 53, // Ular merah garis putih kepala di 89 turun ke 53
  99: 41, // Ular pink raksasa kepala di 99 meliuk turun ke 41
};

// Exact tile background colors matching the user's checkered board image
export const BOARD_TILE_COLORS: Record<number, string> = {
  // Row 1 (1 to 10)
  1: '#f5b700', 2: '#8338ec', 3: '#06d6a0', 4: '#118ab2', 5: '#f77f00',
  6: '#70e000', 7: '#38b000', 8: '#ffd166', 9: '#e76f51', 10: '#00b4d8',
  // Row 2 (20 down to 11)
  20: '#00b4d8', 19: '#f77f00', 18: '#7b2cbf', 17: '#0077b6', 16: '#e01a4f',
  15: '#023e8a', 14: '#48cae4', 13: '#9d4edd', 12: '#e01a4f', 11: '#5a189a',
  // Row 3 (21 to 30)
  21: '#c77dff', 22: '#ffd166', 23: '#00b4d8', 24: '#ffd166', 25: '#38b000',
  26: '#ffd166', 27: '#e63946', 28: '#06d6a0', 29: '#ffd166', 30: '#38b000',
  // Row 4 (40 down to 31)
  40: '#ffd166', 39: '#00b4d8', 38: '#f77f00', 37: '#9d4edd', 36: '#0096c7',
  35: '#d90429', 34: '#ffd166', 33: '#03045e', 32: '#48cae4', 31: '#0077b6',
  // Row 5 (41 to 50)
  41: '#ffd166', 42: '#e01a4f', 43: '#ffd166', 44: '#38b000', 45: '#ffd166',
  46: '#06d6a0', 47: '#ffd166', 48: '#48cae4', 49: '#ffd166', 50: '#f77f00',
  // Row 6 (60 down to 51)
  60: '#00b4d8', 59: '#7b2cbf', 58: '#f77f00', 57: '#0096c7', 56: '#38b000',
  55: '#d90429', 54: '#023e8a', 53: '#00b4d8', 52: '#e01a4f', 51: '#5a189a',
  // Row 7 (61 to 70)
  61: '#ffd166', 62: '#e01a4f', 63: '#ffd166', 64: '#00b4d8', 65: '#ffd166',
  66: '#9d4edd', 67: '#ffd166', 68: '#38b000', 69: '#ffd166', 70: '#06d6a0',
  // Row 8 (80 down to 71)
  80: '#38b000', 79: '#00b4d8', 78: '#f77f00', 77: '#0096c7', 76: '#06d6a0',
  75: '#48cae4', 74: '#f77f00', 73: '#0077b6', 72: '#023e8a', 71: '#00b4d8',
  // Row 9 (81 to 90)
  81: '#ffd166', 82: '#e01a4f', 83: '#7b2cbf', 84: '#ffd166', 85: '#e01a4f',
  86: '#ffd166', 87: '#38b000', 88: '#0077b6', 89: '#e63946', 90: '#f77f00',
  // Row 10 (100 down to 91)
  100: '#00b4d8', 99: '#e01a4f', 98: '#48cae4', 97: '#38b000', 96: '#7b2cbf',
  95: '#0077b6', 94: '#9d4edd', 93: '#00b4d8', 92: '#06d6a0', 91: '#5a189a',
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

// Default Question Bank specifically for Snakes and Ladders (Editable by Teacher)
export const DEFAULT_SNAKE_LADDER_QUESTIONS: MazeQuestion[] = [
  // ================= KELAS 7 =================
  {
    id: 'sl-7-1',
    grade: '7',
    topic: 'Introduction & To Be',
    question: 'Edo: "Hi, I ________ Edo. Nice to meet you!"\nBudi: "Nice to meet you too, Edo."',
    options: ['am', 'is', 'are', 'was'],
    correctAnswer: 0,
    explanation: 'Subjek "I" selalu berpasangan dengan to be "am" dalam Simple Present Tense.',
    vocabularyFocus: 'am (to be untuk I)',
  },
  {
    id: 'sl-7-2',
    grade: '7',
    topic: 'Possessive Pronouns',
    question: 'This is my sister, Maya. ________ favourite food is fried rice and chicken satay.',
    options: ['His', 'Her', 'Their', 'My'],
    correctAnswer: 1,
    explanation: 'Kata ganti kepemilikan untuk perempuan tunggal (Maya / she) adalah "Her".',
    vocabularyFocus: 'Her (milik dia perempuan)',
  },
  {
    id: 'sl-7-3',
    grade: '7',
    topic: 'Simple Present Tense',
    question: 'Galang and his father ________ to the traditional market every Sunday morning.',
    options: ['go', 'goes', 'went', 'going'],
    correctAnswer: 0,
    explanation: 'Subjek jamak "Galang and his father" (They) memakai kata kerja bentuk pertama "go" tanpa imbuhan -s/-es.',
    vocabularyFocus: 'go (pergi)',
  },
  {
    id: 'sl-7-4',
    grade: '7',
    topic: 'Prepositions of Place',
    question: 'The dictionary is ________ the table, right next to the pencil case.',
    options: ['on', 'in', 'under', 'between'],
    correctAnswer: 0,
    explanation: '"On" digunakan untuk menunjukkan posisi benda di atas permukaan (meja).',
    vocabularyFocus: 'on (di atas permukaan)',
  },
  {
    id: 'sl-7-5',
    grade: '7',
    topic: 'Daily Activities',
    question: 'Rani: "What time do you usually ________ up in the morning?"\nSinta: "At 5:00 AM."',
    options: ['wake', 'wakes', 'woke', 'woken'],
    correctAnswer: 0,
    explanation: 'Setelah kata tanya pembantu "do", kata kerja harus kembali ke bentuk dasar (Verb 1: wake).',
    vocabularyFocus: 'wake up (bangun tidur)',
  },

  // ================= KELAS 8 =================
  {
    id: 'sl-8-1',
    grade: '8',
    topic: 'Simple Past Tense',
    question: 'Yesterday, the students of Class 8B ________ Independence Day games at school.',
    options: ['played', 'play', 'plays', 'playing'],
    correctAnswer: 0,
    explanation: 'Keterangan waktu "Yesterday" menandakan Simple Past Tense, gunakan kata kerja bentuk kedua (Verb 2: played).',
    vocabularyFocus: 'played (bermain - past)',
  },
  {
    id: 'sl-8-2',
    grade: '8',
    topic: 'Modals of Ability',
    question: 'Lina has practiced swimming for 5 years, so she ________ swim very fast.',
    options: ['can', 'should', 'must', 'couldn\'t'],
    correctAnswer: 0,
    explanation: '"Can" menyatakan kemampuan fisik (ability) pada saat sekarang (present).',
    vocabularyFocus: 'can (dapat / mampu)',
  },
  {
    id: 'sl-8-3',
    grade: '8',
    topic: 'Recount Text Connectors',
    question: 'First, we washed the vegetables. ________, we chopped the onions and garlic.',
    options: ['Then', 'Because', 'Although', 'While'],
    correctAnswer: 0,
    explanation: 'Kata sambung urutan kronologis kegiatan setelah "First" adalah "Then" atau "Next".',
    vocabularyFocus: 'Then (kemudian)',
  },
  {
    id: 'sl-8-4',
    grade: '8',
    topic: 'Comparative Degree',
    question: 'Mount Bromo is magnificent, but Mount Semeru is ________ than Mount Bromo.',
    options: ['higher', 'high', 'highest', 'more high'],
    correctAnswer: 0,
    explanation: 'Kata sifat 1 suku kata (high) ditambah akhiran -er menjadi "higher" untuk kalimat perbandingan dua hal.',
    vocabularyFocus: 'higher (lebih tinggi)',
  },
  {
    id: 'sl-8-5',
    grade: '8',
    topic: 'Imperative Sentence',
    question: 'Teacher: "Please ________ quiet, the examination is going on!"',
    options: ['be', 'is', 'are', 'being'],
    correctAnswer: 0,
    explanation: 'Kalimat perintah dengan kata sifat (quiet) menggunakan "Please be + adjective".',
    vocabularyFocus: 'be quiet (harap tenang)',
  },

  // ================= KELAS 9 =================
  {
    id: 'sl-9-1',
    grade: '9',
    topic: 'Present Continuous Tense',
    question: 'Look! The students ________ basketball in the school yard right now.',
    options: ['are playing', 'play', 'is playing', 'played'],
    correctAnswer: 0,
    explanation: 'Keterangan "right now" dan kata "Look!" menandakan Present Continuous Tense: are + V-ing.',
    vocabularyFocus: 'are playing (sedang bermain)',
  },
  {
    id: 'sl-9-2',
    grade: '9',
    topic: 'Passive Voice',
    question: 'The traditional batik cloth ________ by skilled artisans in Yogyakarta.',
    options: ['is made', 'makes', 'making', 'are made'],
    correctAnswer: 0,
    explanation: 'Batik cloth (tunggal) dalam kalimat pasif Simple Present menggunakan rumus: is + Verb 3 (made).',
    vocabularyFocus: 'is made (dibuat)',
  },
  {
    id: 'sl-9-3',
    grade: '9',
    topic: 'Narrative Text',
    question: 'Once upon a time in West Java, there ________ a young and handsome prince named Sangkuriang.',
    options: ['lived', 'lives', 'living', 'was live'],
    correctAnswer: 0,
    explanation: 'Cerita naratif masa lampau diawali dengan Simple Past Tense menggunakan Verb 2 (lived).',
    vocabularyFocus: 'lived (tinggal / hidup)',
  },
  {
    id: 'sl-9-4',
    grade: '9',
    topic: 'Conjunction of Purpose',
    question: 'You should consume more fruits and vegetables ________ stay healthy.',
    options: ['in order to', 'so that', 'because', 'although'],
    correctAnswer: 0,
    explanation: '"In order to" diikuti oleh kata kerja bentuk pertama (in order to stay healthy).',
    vocabularyFocus: 'in order to (agar / supaya)',
  },
  {
    id: 'sl-9-5',
    grade: '9',
    topic: 'Present Perfect Tense',
    question: 'Budi and Maya ________ this English storybook three times.',
    options: ['have read', 'has read', 'reading', 'are reading'],
    correctAnswer: 0,
    explanation: 'Subjek jamak "Budi and Maya" (They) menggunakan "have + Verb 3" (have read) untuk menyatakan pengalaman yang telah dilakukan.',
    vocabularyFocus: 'have read (telah membaca)',
  },
  // Include other rich SMP questions as baseline
  ...SMP_MAZE_QUESTIONS.slice(0, 15).map((q, idx) => ({
    ...q,
    id: `sl-smp-${idx + 1}`,
  })),
];

/**
 * Helper to get a curriculum question appropriate for the game
 */
export function getSnakeLadderQuestion(
  grade: SmpGradeLevel,
  usedIds: Set<string> = new Set(),
  customPool?: MazeQuestion[]
): MazeQuestion {
  let pool = customPool && customPool.length > 0 ? customPool : DEFAULT_SNAKE_LADDER_QUESTIONS;
  if (grade !== 'all') {
    const filtered = pool.filter((q) => q.grade === grade);
    if (filtered.length > 0) {
      pool = filtered;
    }
  }
  if (pool.length === 0) pool = DEFAULT_SNAKE_LADDER_QUESTIONS;

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
