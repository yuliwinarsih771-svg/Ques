import { MazeQuestion, MazeConfig, MazeGem, MazePowerUp, MazeAvatar } from '../types';

export const DEFAULT_MAZE_CONFIG: MazeConfig = {
  activeGrade: '7',
  difficulty: 'medium',
  gridSize: 15,
  allowStudentGradeChange: true,
  timeLimitSeconds: 0,
};

// Fun selectable avatars for SMP students
export const MAZE_AVATARS: MazeAvatar[] = [
  { id: 'alex', name: 'Alex Explorer', emoji: '🧭', badge: 'Petualang Tangguh', color: 'from-amber-400 to-orange-500' },
  { id: 'maya', name: 'Maya Scholar', emoji: '📚', badge: 'Pustakawan Cilik', color: 'from-pink-400 to-indigo-500' },
  { id: 'bot', name: 'Cyber-Bot 7', emoji: '🤖', badge: 'Robot AI Cerdas', color: 'from-cyan-400 to-blue-600' },
  { id: 'fox', name: 'Sparky Fox', emoji: '🦊', badge: 'Rubah Lincah Gesit', color: 'from-emerald-400 to-teal-600' },
];

// Curriculum-aligned questions for SMP Kelas 7, Kelas 8, and Kelas 9
export const SMP_MAZE_QUESTIONS: MazeQuestion[] = [
  // ================= KELAS 7 (Kurikulum Merdeka) =================
  {
    id: 'm7-1',
    grade: '7',
    topic: 'Greetings & Introduction',
    question: 'Edo introduces himself: "Hello everyone, my name is Edo. I ________ 13 years old and I live in Jakarta."',
    options: ['am', 'is', 'are', 'be'],
    correctAnswer: 0,
    explanation: 'Kata ganti "I" dalam Simple Present Tense selalu berpasangan dengan to be "am".',
    vocabularyFocus: 'am (to be untuk subjek I)',
  },
  {
    id: 'm7-2',
    grade: '7',
    topic: 'Possessive Adjectives',
    question: 'Siti is introducing her friend: "This is Lina. ________ hobby is drawing cartoons and sketching."',
    options: ['His', 'Her', 'Their', 'My'],
    correctAnswer: 1,
    explanation: 'Lina adalah perempuan (She), sehingga kata kepemilikannya adalah "Her".',
    vocabularyFocus: 'Her (milik dia perempuan)',
  },
  {
    id: 'm7-3',
    grade: '7',
    topic: 'Daily Routines (Simple Present)',
    question: 'Galang and his brother ________ to SMP Merdeka by bicycle every morning.',
    options: ['go', 'goes', 'went', 'going'],
    correctAnswer: 0,
    explanation: 'Subjek jamak "Galang and his brother" (They) menggunakan kata kerja dasar tanpa akhiran -s/-es (go).',
    vocabularyFocus: 'Go (pergi)',
  },
  {
    id: 'm7-4',
    grade: '7',
    topic: 'Describing Appearance',
    question: 'Andre wears glasses and has short curly black hair. What does "curly" mean in Indonesian?',
    options: ['Lurus', 'Keriting / Ikal', 'Botak', 'Panjang'],
    correctAnswer: 1,
    explanation: '"Curly" berarti rambut keriting atau bergelombang/ikal.',
    vocabularyFocus: 'Curly (keriting/ikal)',
  },
  {
    id: 'm7-5',
    grade: '7',
    topic: 'Procedure Text Imperatives',
    question: 'In a sweet iced tea recipe: "________ one tea bag into hot water and stir gently with a spoon."',
    options: ['Dip', 'Kick', 'Throw', 'Sleep'],
    correctAnswer: 0,
    explanation: '"Dip" (celupkan) adalah kata kerja perintah (imperative) yang tepat untuk kantong teh.',
    vocabularyFocus: 'Dip (mencelupkan)',
  },
  {
    id: 'm7-6',
    grade: '7',
    topic: 'Prepositions of Place',
    question: 'The English dictionary is ________ the wooden table beside the pencil case.',
    options: ['on', 'between', 'underneath', 'into'],
    correctAnswer: 0,
    explanation: 'Benda yang berada tepat di atas permukaan meja menggunakan preposisi "on".',
    vocabularyFocus: 'On (di atas permukaan)',
  },
  {
    id: 'm7-7',
    grade: '7',
    topic: 'Personal Information Question',
    question: 'Which question is used to ask someone\'s place of origin (asal daerah)?',
    options: ['Where are you from?', 'How old are you?', 'What is your hobby?', 'What do you eat?'],
    correctAnswer: 0,
    explanation: '"Where are you from?" digunakan secara khusus untuk menanyakan asal daerah atau tempat lahir.',
    vocabularyFocus: 'Where are you from? (Dari mana asalmu?)',
  },
  {
    id: 'm7-8',
    grade: '7',
    topic: 'Descriptive Personality',
    question: 'Monita always helps her friends who have difficulties in English class. She is very ________.',
    options: ['helpful', 'lazy', 'angry', 'careless'],
    correctAnswer: 0,
    explanation: '"Helpful" berarti suka menolong dan peduli terhadap orang lain.',
    vocabularyFocus: 'Helpful (suka menolong)',
  },
  {
    id: 'm7-9',
    grade: '7',
    topic: 'Sequence Words',
    question: 'Which sequence word is used to start the very beginning step in a procedure text?',
    options: ['First', 'Then', 'After that', 'Finally'],
    correctAnswer: 0,
    explanation: '"First" (pertama-tama) digunakan untuk menandai langkah permulaan suatu teks prosedur.',
    vocabularyFocus: 'First (pertama-tama)',
  },
  {
    id: 'm7-10',
    grade: '7',
    topic: 'Have vs Has',
    question: 'Rian: "Do you have an English notebook?"\nBudi: "Yes, I ________ two notebooks in my bag."',
    options: ['have', 'has', 'having', 'had'],
    correctAnswer: 0,
    explanation: 'Subjek "I" berpasangan dengan kata kerja kepemilikan "have".',
    vocabularyFocus: 'Have (mempunyai)',
  },

  // ================= KELAS 8 =================
  {
    id: 'm8-1',
    grade: '8',
    topic: 'Recount Text - Past Tense',
    question: 'Last weekend, Doni and his family ________ their grandmother\'s house in Yogyakarta.',
    options: ['visited', 'visit', 'visits', 'visiting'],
    correctAnswer: 0,
    explanation: 'Keterangan waktu lampau "Last weekend" menuntut kata kerja bentuk Simple Past (V2: visited).',
    vocabularyFocus: 'Visited (mengunjungi - Past Tense)',
  },
  {
    id: 'm8-2',
    grade: '8',
    topic: 'Asking for Opinion',
    question: 'Which expression is used to ask for someone\'s opinion about an English project?',
    options: ['What do you think about our poster?', 'I totally agree with you.', 'I don\'t think so.', 'Congratulations on your win!'],
    correctAnswer: 0,
    explanation: '"What do you think about...?" adalah ungkapan standar menanyakan pendapat (Asking Opinion).',
    vocabularyFocus: 'What do you think? (Bagaimana menurutmu?)',
  },
  {
    id: 'm8-3',
    grade: '8',
    topic: 'Modals of Obligation (Must)',
    question: 'Students ________ wear the complete school uniform during Monday\'s flag ceremony.',
    options: ['must', 'might', 'could', 'would'],
    correctAnswer: 0,
    explanation: '"Must" menunjukkan kewajiban mutlak (obligation) yang harus ditaati di sekolah.',
    vocabularyFocus: 'Must (wajib/harus)',
  },
  {
    id: 'm8-4',
    grade: '8',
    topic: 'Degrees of Comparison (Comparative)',
    question: 'Cheetahs run ________ than wild horses in the savannah.',
    options: ['faster', 'fastest', 'more fast', 'as fast'],
    correctAnswer: 0,
    explanation: 'Kata sifat pendek satu suku kata (fast) mendapat akhiran -er untuk perbandingan (faster than).',
    vocabularyFocus: 'Faster (lebih cepat)',
  },
  {
    id: 'm8-5',
    grade: '8',
    topic: 'Superlative Degree',
    question: 'Mount Everest is the ________ mountain above sea level on Earth.',
    options: ['highest', 'higher', 'more high', 'most high'],
    correctAnswer: 0,
    explanation: 'Bentuk superlative dari kata sifat "high" diawali the dan diakhiri -est: "the highest".',
    vocabularyFocus: 'The highest (paling tinggi)',
  },
  {
    id: 'm8-6',
    grade: '8',
    topic: 'Notice & Prohibition',
    question: 'What does a notice saying "DO NOT LITTER" mean?',
    options: [
      'Do not throw garbage carelessly',
      'Do not enter this classroom',
      'Please speak loudly',
      'You must park your bicycle here'
    ],
    correctAnswer: 0,
    explanation: '"Do not litter" berarti dilarang membuang sampah sembarangan.',
    vocabularyFocus: 'Do not litter (dilarang buang sampah sembarangan)',
  },
  {
    id: 'm8-7',
    grade: '8',
    topic: 'Modals of Advice (Should)',
    question: 'Maya looks pale and has a headache. Her teacher says: "You ________ rest in the clinic room."',
    options: ['should', 'should not', 'cannot', 'will not'],
    correctAnswer: 0,
    explanation: '"Should" digunakan untuk memberi saran atau anjuran yang baik bagi orang yang sedang sakit.',
    vocabularyFocus: 'Should (sebaiknya/seharusnya)',
  },
  {
    id: 'm8-8',
    grade: '8',
    topic: 'Irregular Past Verb',
    question: 'What is the past tense (Verb 2) form of the irregular verb "buy"?',
    options: ['bought', 'buyed', 'buying', 'buys'],
    correctAnswer: 0,
    explanation: 'Bentuk lampau kedua (Verb 2) dari buy adalah bought (buy - bought - bought).',
    vocabularyFocus: 'Bought (telah membeli)',
  },
  {
    id: 'm8-9',
    grade: '8',
    topic: 'Recount Text Structure',
    question: 'The opening paragraph of a Recount text introducing who, where, and when is called ________.',
    options: ['Orientation', 'Complication', 'Resolution', 'Reorientation'],
    correctAnswer: 0,
    explanation: 'Bagian pembuka teks recount yang memperkenalkan tokoh, tempat, dan waktu disebut Orientation.',
    vocabularyFocus: 'Orientation (bagian orientasi/pengantar)',
  },
  {
    id: 'm8-10',
    grade: '8',
    topic: 'Giving Compliment',
    question: 'Which sentence is an expression of complimenting someone\'s outstanding achievement?',
    options: ['What a wonderful performance!', 'I am very sorry.', 'Excuse me, where is the lab?', 'I disagree with your choice.'],
    correctAnswer: 0,
    explanation: '"What a wonderful performance!" adalah ungkapan memuji (giving compliment/praise).',
    vocabularyFocus: 'What a wonderful... (Sungguh luar biasa!)',
  },

  // ================= KELAS 9 =================
  {
    id: 'm9-1',
    grade: '9',
    topic: 'Narrative Text - Complication',
    question: 'In the story of Sangkuriang or Malin Kundang, what is the "Complication" part of a narrative text?',
    options: [
      'The section where the main characters face conflicts and problems',
      'The opening paragraph introducing the characters',
      'The final solution to the problem',
      'The list of materials and ingredients'
    ],
    correctAnswer: 0,
    explanation: 'Complication adalah bagian teks naratif di mana konflik atau masalah mulai memuncak.',
    vocabularyFocus: 'Complication (pemunculan masalah/konflik)',
  },
  {
    id: 'm9-2',
    grade: '9',
    topic: 'Passive Voice (Present)',
    question: 'Change into passive: "Komodo dragons inhabit Komodo Island."\n-> "Komodo Island ________ by Komodo dragons."',
    options: ['is inhabited', 'was inhabited', 'are inhabited', 'inhabiting'],
    correctAnswer: 0,
    explanation: 'Subjek tunggal "Komodo Island" dalam Simple Present Passive menggunakan to be "is" + V3 (is inhabited).',
    vocabularyFocus: 'Is inhabited (dihuni/ditinggali)',
  },
  {
    id: 'm9-3',
    grade: '9',
    topic: 'Passive Voice (Past)',
    question: 'Change into passive: "Thomas Edison invented the light bulb in 1879."\n-> "The light bulb ________ by Thomas Edison in 1879."',
    options: ['was invented', 'is invented', 'were invented', 'has invented'],
    correctAnswer: 0,
    explanation: 'Peristiwa lampau (1879) dengan subjek tunggal (the light bulb) menggunakan "was + Verb 3" (was invented).',
    vocabularyFocus: 'Was invented (diciptakan/ditemukan pada masa lampau)',
  },
  {
    id: 'm9-4',
    grade: '9',
    topic: 'Conjunction of Purpose',
    question: 'We should drink plenty of clean water every day ________ maintain our bodily health.',
    options: ['in order to', 'although', 'because of', 'despite'],
    correctAnswer: 0,
    explanation: '"In order to" (agar/supaya) diikuti kata kerja bentuk pertama untuk menyatakan tujuan (purpose).',
    vocabularyFocus: 'In order to (agar/supaya)',
  },
  {
    id: 'm9-5',
    grade: '9',
    topic: 'Conjunction of Purpose (So That)',
    question: 'Dian studies diligently every evening ________ she can pass the final semester exam with high honors.',
    options: ['so that', 'although', 'because of', 'in order to'],
    correctAnswer: 0,
    explanation: '"So that" (sehingga/agar) diikuti oleh klausa lengkap bersubjek ("she can pass...").',
    vocabularyFocus: 'So that (sehingga/agar)',
  },
  {
    id: 'm9-6',
    grade: '9',
    topic: 'Present Perfect Tense',
    question: 'Mrs. Eli ________ English at this secondary school for more than ten years.',
    options: ['has taught', 'have taught', 'taught', 'is teaching'],
    correctAnswer: 0,
    explanation: 'Subjek tunggal orang ketiga (Mrs. Eli) dalam Present Perfect Tense menggunakan "has + Verb 3" (has taught).',
    vocabularyFocus: 'Has taught (sudah mengajar)',
  },
  {
    id: 'm9-7',
    grade: '9',
    topic: 'Report Text Characteristics',
    question: 'What is the communicative purpose of an Information Report Text?',
    options: [
      'To describe general facts about natural phenomena, animals, or scientific objects',
      'To entertain readers with fairy tales and magical creatures',
      'To persuade people to buy products in supermarkets',
      'To instruct how to operate a microwave step by step'
    ],
    correctAnswer: 0,
    explanation: 'Report text bertujuan mendeskripsikan sesuatu secara umum berdasarkan fakta ilmiah.',
    vocabularyFocus: 'Report text (teks laporan hasil observasi/fakta ilmiah)',
  },
  {
    id: 'm9-8',
    grade: '9',
    topic: 'Expressing Hope & Wish',
    question: 'Your classmate is competing in the National English Speech Contest. What is the most appropriate expression?',
    options: [
      'I hope you will deliver your best speech and win the gold trophy!',
      'I am very proud of my own speech.',
      'You must finish your meal right now.',
      'I do not agree with the judges.'
    ],
    correctAnswer: 0,
    explanation: '"I hope you will..." adalah ungkapan mendoakan harapan baik (Expressing Hope).',
    vocabularyFocus: 'I hope... (Saya berharap/mendoakan...)',
  },
  {
    id: 'm9-9',
    grade: '9',
    topic: 'Conjunction of Contrast',
    question: '________ it rained heavily all morning, the students arrived on time for the national exam.',
    options: ['Although', 'Because', 'In order to', 'Due to'],
    correctAnswer: 0,
    explanation: '"Although" (meskipun/walaupun) menghubungkan dua klausa yang bertolak belakang.',
    vocabularyFocus: 'Although (meskipun/walaupun)',
  },
  {
    id: 'm9-10',
    grade: '9',
    topic: 'Moral Value of Narrative',
    question: 'What can we conclude as the moral value of the story "The Boy Who Cried Wolf"?',
    options: [
      'Liars will not be believed even when they tell the truth',
      'Wolves are friendly farm animals',
      'Never help your village friends',
      'Do your homework early in the morning'
    ],
    correctAnswer: 0,
    explanation: 'Pesan moral cerita tersebut: pembohong tidak akan dipercaya lagi meski berkata jujur.',
    vocabularyFocus: 'Moral value (amanat / nilai budi pekerti)',
  },
];

// Vocabulary Star Gems scattered along maze corridors
export const SMP_MAZE_GEMS: Array<{ word: string; meaning: string }> = [
  { word: 'Courageous', meaning: 'Pemberani / Berjiwa Tangguh' },
  { word: 'Magnificent', meaning: 'Sangat Indah / Megah' },
  { word: 'Perseverance', meaning: 'Kegigihan / Pantang Menyerah' },
  { word: 'Ingenious', meaning: 'Cerdik / Penuh Akal' },
  { word: 'Compassionate', meaning: 'Penuh Kasih Sayang' },
  { word: 'Curiosity', meaning: 'Rasa Ingin Tahu Tinggi' },
  { word: 'Integrity', meaning: 'Kejujuran & Ketulusan' },
  { word: 'Wisdom', meaning: 'Kebijaksanaan' },
  { word: 'Enthusiastic', meaning: 'Sangat Bersemangat' },
  { word: 'Generous', meaning: 'Suka Memberi / Dermawan' },
  { word: 'Spectacular', meaning: 'Spektakuler / Mengagumkan' },
  { word: 'Delightful', meaning: 'Sangat Menyenangkan' },
];

/**
 * Procedural Maze Generator using randomized Prim / recursive backtracker algorithm
 * Guarantees a fully traversable maze with start at (1,1) and exit at (size-2, size-2)
 */
export function generateMazeGrid(
  size: number = 15,
  grade: '7' | '8' | '9' | 'all' = '7',
  checkpointCount: number = 4
): {
  grid: number[][]; // 1 = wall, 0 = path
  startPos: { x: number; y: number };
  exitPos: { x: number; y: number };
  checkpoints: Array<{
    id: string;
    x: number;
    y: number;
    question: MazeQuestion;
    isUnlocked: boolean;
  }>;
  gems: Array<{
    id: string;
    x: number;
    y: number;
    word: string;
    meaning: string;
    collected: boolean;
  }>;
  powerUps: MazePowerUp[];
} {
  // Ensure odd dimension
  const N = size % 2 === 0 ? size + 1 : size;
  const grid: number[][] = Array.from({ length: N }, () => Array(N).fill(1));

  // Carve paths using randomized depth-first search
  const stack: [number, number][] = [];
  const startX = 1;
  const startY = 1;
  grid[startY][startX] = 0;
  stack.push([startX, startY]);

  const directions = [
    [0, -2],
    [0, 2],
    [-2, 0],
    [2, 0],
  ];

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const neighbors: [number, number, number, number][] = [];

    // Shuffle directions
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of shuffledDirs) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx > 0 && nx < N - 1 && ny > 0 && ny < N - 1 && grid[ny][nx] === 1) {
        neighbors.push([nx, ny, cx + dx / 2, cy + dy / 2]);
      }
    }

    if (neighbors.length > 0) {
      const [nx, ny, wx, wy] = neighbors[0];
      grid[wy][wx] = 0;
      grid[ny][nx] = 0;
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }

  // Ensure exit position at bottom-right
  const exitX = N - 2;
  const exitY = N - 2;
  grid[exitY][exitX] = 0;

  // Make sure path to exit is open
  if (grid[exitY - 1][exitX] === 1 && grid[exitY][exitX - 1] === 1) {
    grid[exitY - 1][exitX] = 0;
  }

  // Collect all empty path cells (excluding start & exit)
  const pathCells: [number, number][] = [];
  for (let y = 1; y < N - 1; y++) {
    for (let x = 1; x < N - 1; x++) {
      if (grid[y][x] === 0) {
        if (!(x === startX && y === startY) && !(x === exitX && y === exitY)) {
          pathCells.push([x, y]);
        }
      }
    }
  }

  // Sort path cells by distance from start to spread checkpoints progressively
  pathCells.sort((a, b) => {
    const distA = Math.hypot(a[0] - startX, a[1] - startY);
    const distB = Math.hypot(b[0] - startX, b[1] - startY);
    return distA - distB;
  });

  // Filter questions based on selected grade
  let questionsPool = SMP_MAZE_QUESTIONS;
  if (grade !== 'all') {
    questionsPool = SMP_MAZE_QUESTIONS.filter((q) => q.grade === grade);
  }
  if (questionsPool.length === 0) {
    questionsPool = SMP_MAZE_QUESTIONS;
  }
  const shuffledQuestions = [...questionsPool].sort(() => Math.random() - 0.5);

  // Pick checkpoint locations evenly spaced through maze progress
  const checkpoints: Array<{
    id: string;
    x: number;
    y: number;
    question: MazeQuestion;
    isUnlocked: boolean;
  }> = [];

  const actualCheckpoints = Math.min(checkpointCount, Math.floor(pathCells.length / 3), shuffledQuestions.length);
  const step = Math.max(1, Math.floor(pathCells.length / (actualCheckpoints + 1)));

  const usedCoords = new Set<string>();
  usedCoords.add(`${startX},${startY}`);
  usedCoords.add(`${exitX},${exitY}`);

  for (let i = 0; i < actualCheckpoints; i++) {
    const targetIdx = Math.min(pathCells.length - 1, Math.max(1, Math.floor((i + 1) * step) + Math.floor(Math.random() * 3) - 1));
    const cell = pathCells[targetIdx];
    if (cell && !usedCoords.has(`${cell[0]},${cell[1]}`)) {
      usedCoords.add(`${cell[0]},${cell[1]}`);
      checkpoints.push({
        id: `cp-${i + 1}`,
        x: cell[0],
        y: cell[1],
        question: shuffledQuestions[i % shuffledQuestions.length],
        isUnlocked: false,
      });
    }
  }

  // Distribute glowing vocabulary gems in leftover corridor dead-ends & paths
  const gems: Array<{
    id: string;
    x: number;
    y: number;
    word: string;
    meaning: string;
    collected: boolean;
  }> = [];

  const shuffledGems = [...SMP_MAZE_GEMS].sort(() => Math.random() - 0.5);
  const remainingCells = pathCells.filter((c) => !usedCoords.has(`${c[0]},${c[1]}`));

  // Place 4-6 gems
  const gemCount = Math.min(shuffledGems.length, Math.max(3, Math.floor(N / 3)));
  for (let i = 0; i < gemCount && i < remainingCells.length; i++) {
    const cell = remainingCells[Math.floor((i / gemCount) * remainingCells.length)];
    if (cell && !usedCoords.has(`${cell[0]},${cell[1]}`)) {
      usedCoords.add(`${cell[0]},${cell[1]}`);
      gems.push({
        id: `gem-${i + 1}`,
        x: cell[0],
        y: cell[1],
        word: shuffledGems[i % shuffledGems.length].word,
        meaning: shuffledGems[i % shuffledGems.length].meaning,
        collected: false,
      });
    }
  }

  // Distribute power-ups (Speed Boots, Reveal Torch, Grammar Shield)
  const powerUps: MazePowerUp[] = [];
  const powerUpTypes: Array<'speed' | 'torch' | 'shield'> = ['speed', 'torch', 'shield'];
  const remainingCellsAfterGems = pathCells.filter((c) => !usedCoords.has(`${c[0]},${c[1]}`));

  for (let i = 0; i < powerUpTypes.length && i < remainingCellsAfterGems.length; i++) {
    const cell = remainingCellsAfterGems[Math.floor((i / powerUpTypes.length) * remainingCellsAfterGems.length)];
    if (cell && !usedCoords.has(`${cell[0]},${cell[1]}`)) {
      usedCoords.add(`${cell[0]},${cell[1]}`);
      powerUps.push({
        id: `pw-${i + 1}`,
        x: cell[0],
        y: cell[1],
        type: powerUpTypes[i],
        collected: false,
      });
    }
  }

  return {
    grid,
    startPos: { x: startX, y: startY },
    exitPos: { x: exitX, y: exitY },
    checkpoints,
    gems,
    powerUps,
  };
}
