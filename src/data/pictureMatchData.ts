import { PictureCardItem, PictureMatchCategory, SmpGradeLevel } from '../types';

export const PICTURE_MATCH_CATEGORIES: {
  id: PictureMatchCategory;
  name: string;
  emoji: string;
  desc: string;
  color: string;
}[] = [
  { id: 'all', name: 'Semua Kategori', emoji: '🌟', desc: 'Acak campuran tema', color: 'from-amber-400 to-indigo-600' },
  { id: 'animals', name: 'Hewan & Alam (Animals)', emoji: '🦁', desc: 'Mamalia, reptil & serangga', color: 'from-amber-500 to-orange-600' },
  { id: 'school', name: 'Sekolah & Belajar (School)', emoji: '🎒', desc: 'Benda kelas & laboratorium', color: 'from-blue-500 to-indigo-600' },
  { id: 'food', name: 'Makanan & Buah (Food)', emoji: '🍎', desc: 'Kuliner & nutrisi sehat', color: 'from-rose-500 to-pink-600' },
  { id: 'jobs', name: 'Profesi & Cita-cita (Jobs)', emoji: '👨‍⚕️', desc: 'Pekerjaan & karier masa depan', color: 'from-teal-500 to-emerald-600' },
  { id: 'actions', name: 'Kata Kerja & Aktivitas (Actions)', emoji: '🏃', desc: 'Rutinitas harian (Daily verbs)', color: 'from-cyan-500 to-blue-600' },
  { id: 'science', name: 'Sains & Teknologi (Science)', emoji: '🚀', desc: 'Eksplorasi luar angkasa & sains', color: 'from-purple-500 to-violet-600' },
];

export const PICTURE_MATCH_ITEMS: PictureCardItem[] = [
  // ================= ANIMALS (HEWAN & ALAM) =================
  {
    id: 'pic-ani-1',
    word: 'Lion',
    translation: 'Singa',
    emoji: '🦁',
    category: 'animals',
    grade: '7',
    exampleSentence: 'The lion is known as the king of the jungle.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'pic-ani-2',
    word: 'Elephant',
    translation: 'Gajah',
    emoji: '🐘',
    category: 'animals',
    grade: '7',
    exampleSentence: 'An elephant has large ears and a strong trunk.',
    color: 'from-slate-400 to-zinc-600',
  },
  {
    id: 'pic-ani-3',
    word: 'Giraffe',
    translation: 'Jerapah',
    emoji: '🦒',
    category: 'animals',
    grade: '7',
    exampleSentence: 'The giraffe uses its long neck to reach high leaves.',
    color: 'from-yellow-400 to-amber-600',
  },
  {
    id: 'pic-ani-4',
    word: 'Butterfly',
    translation: 'Kupu-kupu',
    emoji: '🦋',
    category: 'animals',
    grade: '7',
    exampleSentence: 'A colorful butterfly flew over the flower garden.',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    id: 'pic-ani-5',
    word: 'Dolphin',
    translation: 'Lumba-lumba',
    emoji: '🐬',
    category: 'animals',
    grade: '8',
    exampleSentence: 'Dolphins are intelligent mammals that live in the ocean.',
    color: 'from-sky-400 to-indigo-500',
  },
  {
    id: 'pic-ani-6',
    word: 'Eagle',
    translation: 'Elang',
    emoji: '🦅',
    category: 'animals',
    grade: '8',
    exampleSentence: 'The eagle has sharp vision and powerful talons.',
    color: 'from-amber-600 to-stone-700',
  },
  {
    id: 'pic-ani-7',
    word: 'Kangaroo',
    translation: 'Kanguru',
    emoji: '🦘',
    category: 'animals',
    grade: '8',
    exampleSentence: 'A mother kangaroo carries her baby in a pouch.',
    color: 'from-orange-400 to-amber-600',
  },
  {
    id: 'pic-ani-8',
    word: 'Penguin',
    translation: 'Pinguin',
    emoji: '🐧',
    category: 'animals',
    grade: '7',
    exampleSentence: 'Penguins are flightless birds that swim gracefully.',
    color: 'from-slate-600 to-zinc-800',
  },

  // ================= SCHOOL & STUDY (SEKOLAH & KELAS) =================
  {
    id: 'pic-sch-1',
    word: 'Microscope',
    translation: 'Mikroskop',
    emoji: '🔬',
    category: 'school',
    grade: '8',
    exampleSentence: 'We examine plant cells using a science laboratory microscope.',
    color: 'from-teal-400 to-emerald-600',
  },
  {
    id: 'pic-sch-2',
    word: 'Backpack',
    translation: 'Tas Ransel',
    emoji: '🎒',
    category: 'school',
    grade: '7',
    exampleSentence: 'Rudi puts his textbooks and pencil case in his backpack.',
    color: 'from-indigo-400 to-blue-600',
  },
  {
    id: 'pic-sch-3',
    word: 'Dictionary',
    translation: 'Kamus',
    emoji: '📖',
    category: 'school',
    grade: '7',
    exampleSentence: 'Always consult an English dictionary to check spelling.',
    color: 'from-rose-400 to-red-600',
  },
  {
    id: 'pic-sch-4',
    word: 'Telescope',
    translation: 'Teleskop',
    emoji: '🔭',
    category: 'school',
    grade: '9',
    exampleSentence: 'Students observed constellations through the school telescope.',
    color: 'from-violet-400 to-purple-600',
  },
  {
    id: 'pic-sch-5',
    word: 'Globe',
    translation: 'Bola Dunia (Globe)',
    emoji: '🌍',
    category: 'school',
    grade: '7',
    exampleSentence: 'The geography teacher pointed at Indonesia on the globe.',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'pic-sch-6',
    word: 'Scissors',
    translation: 'Gunting',
    emoji: '✂️',
    category: 'school',
    grade: '7',
    exampleSentence: 'Use safe scissors when cutting craft origami paper.',
    color: 'from-slate-400 to-zinc-600',
  },
  {
    id: 'pic-sch-7',
    word: 'Calculator',
    translation: 'Kalkulator',
    emoji: '🧮',
    category: 'school',
    grade: '8',
    exampleSentence: 'We calculated the arithmetic mean on the digital calculator.',
    color: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'pic-sch-8',
    word: 'Blackboard',
    translation: 'Papan Tulis',
    emoji: '📋',
    category: 'school',
    grade: '7',
    exampleSentence: 'The teacher wrote today\'s English vocabulary on the board.',
    color: 'from-green-500 to-emerald-700',
  },

  // ================= FOOD & BEVERAGES (MAKANAN & MINUMAN) =================
  {
    id: 'pic-foo-1',
    word: 'Fried Rice',
    translation: 'Nasi Goreng',
    emoji: '🍳',
    category: 'food',
    grade: '7',
    exampleSentence: 'Indonesian fried rice is delicious with fried egg and crackers.',
    color: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'pic-foo-2',
    word: 'Watermelon',
    translation: 'Semangka',
    emoji: '🍉',
    category: 'food',
    grade: '7',
    exampleSentence: 'A slice of sweet cold watermelon is refreshing in summer.',
    color: 'from-rose-400 to-red-600',
  },
  {
    id: 'pic-foo-3',
    word: 'Strawberry',
    translation: 'Stroberi',
    emoji: '🍓',
    category: 'food',
    grade: '7',
    exampleSentence: 'Fresh red strawberries are rich in natural vitamin C.',
    color: 'from-pink-400 to-rose-600',
  },
  {
    id: 'pic-foo-4',
    word: 'Milk',
    translation: 'Susu',
    emoji: '🥛',
    category: 'food',
    grade: '7',
    exampleSentence: 'Drinking a glass of warm milk keeps our bones strong.',
    color: 'from-sky-300 to-blue-400',
  },
  {
    id: 'pic-foo-5',
    word: 'Vegetables',
    translation: 'Sayur-sayuran',
    emoji: '🥦',
    category: 'food',
    grade: '8',
    exampleSentence: 'Broccoli and carrots are healthy green vegetables.',
    color: 'from-emerald-400 to-green-600',
  },
  {
    id: 'pic-foo-6',
    word: 'Apple',
    translation: 'Apel',
    emoji: '🍎',
    category: 'food',
    grade: '7',
    exampleSentence: 'An apple a day keeps the doctor away.',
    color: 'from-red-500 to-rose-700',
  },
  {
    id: 'pic-foo-7',
    word: 'Orange',
    translation: 'Jeruk',
    emoji: '🍊',
    category: 'food',
    grade: '7',
    exampleSentence: 'Sweet and sour fresh orange juice boosts our stamina.',
    color: 'from-orange-400 to-amber-500',
  },
  {
    id: 'pic-foo-8',
    word: 'Cheese',
    translation: 'Keju',
    emoji: '🧀',
    category: 'food',
    grade: '8',
    exampleSentence: 'Melted savory cheese tastes great on warm bread.',
    color: 'from-yellow-400 to-amber-500',
  },

  // ================= PROFESSIONS & JOBS (PROFESI) =================
  {
    id: 'pic-job-1',
    word: 'Doctor',
    translation: 'Dokter',
    emoji: '👨‍⚕️',
    category: 'jobs',
    grade: '7',
    exampleSentence: 'A caring doctor examines sick patients at the hospital.',
    color: 'from-teal-400 to-cyan-600',
  },
  {
    id: 'pic-job-2',
    word: 'Astronaut',
    translation: 'Astronot',
    emoji: '👨‍🚀',
    category: 'jobs',
    grade: '8',
    exampleSentence: 'The brave astronaut walked on the lunar space station.',
    color: 'from-indigo-400 to-blue-600',
  },
  {
    id: 'pic-job-3',
    word: 'Chef',
    translation: 'Koki / Juru Masak',
    emoji: '👨‍🍳',
    category: 'jobs',
    grade: '7',
    exampleSentence: 'The master chef created a savory traditional soup recipe.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'pic-job-4',
    word: 'Teacher',
    translation: 'Guru',
    emoji: '👩‍🏫',
    category: 'jobs',
    grade: '7',
    exampleSentence: 'Our dedicated teacher inspires students to read every day.',
    color: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'pic-job-5',
    word: 'Firefighter',
    translation: 'Pemadam Kebakaran',
    emoji: '👨‍🚒',
    category: 'jobs',
    grade: '8',
    exampleSentence: 'Firefighters bravely rescued a trapped kitten from the roof.',
    color: 'from-red-500 to-orange-600',
  },
  {
    id: 'pic-job-6',
    word: 'Scientist',
    translation: 'Ilmuwan / Peneliti',
    emoji: '👩‍🔬',
    category: 'jobs',
    grade: '9',
    exampleSentence: 'The scientist discovered a new clean renewable energy source.',
    color: 'from-purple-400 to-violet-600',
  },
  {
    id: 'pic-job-7',
    word: 'Pilot',
    translation: 'Pilot Pesawat',
    emoji: '👨‍✈️',
    category: 'jobs',
    grade: '8',
    exampleSentence: 'The skilled pilot safely landed the aircraft during rain.',
    color: 'from-sky-400 to-blue-600',
  },
  {
    id: 'pic-job-8',
    word: 'Artist',
    translation: 'Pelukis / Seniman',
    emoji: '🎨',
    category: 'jobs',
    grade: '7',
    exampleSentence: 'The creative artist painted a stunning sunset landscape.',
    color: 'from-pink-400 to-rose-600',
  },

  // ================= ACTIONS & VERBS (KATA KERJA) =================
  {
    id: 'pic-act-1',
    word: 'Reading',
    translation: 'Membaca',
    emoji: '📖',
    category: 'actions',
    grade: '7',
    exampleSentence: 'Dewi enjoys reading mystery novels in the school library.',
    color: 'from-indigo-400 to-blue-600',
  },
  {
    id: 'pic-act-2',
    word: 'Swimming',
    translation: 'Berenang',
    emoji: '🏊',
    category: 'actions',
    grade: '7',
    exampleSentence: 'We go swimming at the community pool every Saturday.',
    color: 'from-cyan-400 to-teal-500',
  },
  {
    id: 'pic-act-3',
    word: 'Cooking',
    translation: 'Memasak',
    emoji: '🍳',
    category: 'actions',
    grade: '7',
    exampleSentence: 'Mother is cooking aromatic chicken soup in the kitchen.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'pic-act-4',
    word: 'Singing',
    translation: 'Menyanyi',
    emoji: '🎤',
    category: 'actions',
    grade: '8',
    exampleSentence: 'The choir members are singing patriotic national songs.',
    color: 'from-pink-400 to-rose-600',
  },
  {
    id: 'pic-act-5',
    word: 'Dancing',
    translation: 'Menari',
    emoji: '💃',
    category: 'actions',
    grade: '8',
    exampleSentence: 'Students practice traditional Balinese dancing gracefully.',
    color: 'from-fuchsia-400 to-purple-600',
  },
  {
    id: 'pic-act-6',
    word: 'Running',
    translation: 'Berlari',
    emoji: '🏃',
    category: 'actions',
    grade: '7',
    exampleSentence: 'Andi is running fast in the 100-meter sprint competition.',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'pic-act-7',
    word: 'Gardening',
    translation: 'Berkebun',
    emoji: '🌱',
    category: 'actions',
    grade: '8',
    exampleSentence: 'Grandfather loves gardening and planting organic tomatoes.',
    color: 'from-green-400 to-emerald-600',
  },
  {
    id: 'pic-act-8',
    word: 'Writing',
    translation: 'Menulis',
    emoji: '✍️',
    category: 'actions',
    grade: '7',
    exampleSentence: 'Siti is writing an inspiring personal recount diary entry.',
    color: 'from-blue-400 to-indigo-600',
  },

  // ================= SCIENCE & TECH (SAINS & TEKNOLOGI) =================
  {
    id: 'pic-sci-1',
    word: 'Rocket',
    translation: 'Roket',
    emoji: '🚀',
    category: 'science',
    grade: '8',
    exampleSentence: 'The space exploration rocket launched successfully toward Mars.',
    color: 'from-rose-500 to-indigo-600',
  },
  {
    id: 'pic-sci-2',
    word: 'Volcano',
    translation: 'Gunung Berapi',
    emoji: '🌋',
    category: 'science',
    grade: '8',
    exampleSentence: 'Indonesia has many majestic active volcanoes like Mount Merapi.',
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'pic-sci-3',
    word: 'Rainbow',
    translation: 'Pelangi',
    emoji: '🌈',
    category: 'science',
    grade: '7',
    exampleSentence: 'A colorful arc of rainbow appeared right after the afternoon rain.',
    color: 'from-pink-400 via-yellow-400 to-cyan-500',
  },
  {
    id: 'pic-sci-4',
    word: 'Lightning',
    translation: 'Kilat / Petir',
    emoji: '⚡',
    category: 'science',
    grade: '8',
    exampleSentence: 'Lightning travels faster than the thunder sound during storms.',
    color: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'pic-sci-5',
    word: 'Satellite',
    translation: 'Satelit',
    emoji: '🛰️',
    category: 'science',
    grade: '9',
    exampleSentence: 'Telecommunication satellites orbit Earth to transmit internet signals.',
    color: 'from-slate-400 to-indigo-600',
  },
  {
    id: 'pic-sci-6',
    word: 'Magnet',
    translation: 'Magnet',
    emoji: '🧲',
    category: 'science',
    grade: '8',
    exampleSentence: 'A magnetic field attracts iron and nickel objects strongly.',
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'pic-sci-7',
    word: 'Solar System',
    translation: 'Tata Surya',
    emoji: '🪐',
    category: 'science',
    grade: '9',
    exampleSentence: 'The sun is the gravitational center of our solar system.',
    color: 'from-amber-500 to-purple-600',
  },
  {
    id: 'pic-sci-8',
    word: 'Compass',
    translation: 'Kompas',
    emoji: '🧭',
    category: 'science',
    grade: '7',
    exampleSentence: 'Hikers use a magnetic compass to navigate toward the north.',
    color: 'from-blue-500 to-cyan-600',
  },
];

/**
 * Helper to prepare a shuffled card deck for the Picture Matching Game
 * Mode 1: Image Card paired with English Word Card
 * Or Mode 2: Matching Pairs (Image ↔ Image)
 */
export interface MatchCard {
  uid: string; // Unique card instance id
  itemId: string; // Target item id to match
  type: 'image' | 'word';
  displayEmoji?: string;
  displayText: string;
  subText?: string;
  exampleSentence: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function generatePictureMatchDeck(
  category: PictureMatchCategory = 'all',
  grade: SmpGradeLevel = 'all',
  pairsCount: number = 6, // 6 pairs = 12 cards, 8 pairs = 16 cards
  matchType: 'image_to_word' | 'image_to_image' = 'image_to_word',
  customPool?: PictureCardItem[]
): MatchCard[] {
  let pool = customPool && customPool.length > 0 ? customPool : PICTURE_MATCH_ITEMS;

  // Filter category
  if (category !== 'all') {
    pool = pool.filter((item) => item.category === category);
  }

  // Filter grade
  if (grade !== 'all') {
    const gradeFiltered = pool.filter((item) => item.grade === grade);
    if (gradeFiltered.length >= pairsCount) {
      pool = gradeFiltered;
    }
  }

  // Shuffle pool and select pairsCount items
  const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
  const selectedItems = shuffledPool.slice(0, Math.min(pairsCount, shuffledPool.length));

  const deck: MatchCard[] = [];

  selectedItems.forEach((item, idx) => {
    if (matchType === 'image_to_word') {
      // Card 1: Picture Card (Emoji/Ilustrasi + Terjemahan Indonesia)
      deck.push({
        uid: `${item.id}-img-${idx}`,
        itemId: item.id,
        type: 'image',
        displayEmoji: item.emoji,
        displayText: item.translation,
        subText: 'Gambar',
        exampleSentence: item.exampleSentence,
        color: item.color,
        isFlipped: false,
        isMatched: false,
      });

      // Card 2: English Word Card (Kosakata Bahasa Inggris)
      deck.push({
        uid: `${item.id}-word-${idx}`,
        itemId: item.id,
        type: 'word',
        displayText: item.word,
        subText: 'Kata Bahasa Inggris',
        exampleSentence: item.exampleSentence,
        color: item.color,
        isFlipped: false,
        isMatched: false,
      });
    } else {
      // Image to Image matching (Identical pairs)
      deck.push({
        uid: `${item.id}-imgA-${idx}`,
        itemId: item.id,
        type: 'image',
        displayEmoji: item.emoji,
        displayText: item.word,
        subText: item.translation,
        exampleSentence: item.exampleSentence,
        color: item.color,
        isFlipped: false,
        isMatched: false,
      });

      deck.push({
        uid: `${item.id}-imgB-${idx}`,
        itemId: item.id,
        type: 'image',
        displayEmoji: item.emoji,
        displayText: item.word,
        subText: item.translation,
        exampleSentence: item.exampleSentence,
        color: item.color,
        isFlipped: false,
        isMatched: false,
      });
    }
  });

  // Shuffle deck
  return deck.sort(() => 0.5 - Math.random());
}
