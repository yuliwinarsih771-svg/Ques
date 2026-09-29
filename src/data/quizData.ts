import { Question, QuizSettings, ProcedureTextItem, StudentSubmission, StudentMasterData } from '../types';

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  maxAttempts: 1,
  timeLimitMinutes: 20,
  isQuizOpen: true,
  allowedClasses: ['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'],
  shuffleQuestions: true,
  shuffleOptions: true,
  enableAntiCheating: true,
  autoPlayAudio: true,
  defaultSpeechRate: 0.8,
  kkmScore: 75,
  antiScreenshotMobile: false,
  studyModuleLockHours: 1,
};

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    topic: 'Introducing Myself - Greeting & Identity',
    question: 'Read the greeting: "Hello everyone, my name is Galang. I am from Kalimantan." Where does Galang come from?',
    options: ['Java', 'Kalimantan', 'Sumatra', 'Sulawesi'],
    correctAnswer: 1,
    explanation: 'Dalam teks tertulis jelas: "I am from Kalimantan". Jadi asal daerah Galang adalah Kalimantan.',
    passage: 'Hello everyone, my name is Galang. I am thirteen years old and I am a student of SMP Merdeka. I am from Kalimantan.',
    audioText: 'Hello everyone, my name is Galang. I am thirteen years old and I am a student of SMP Merdeka. I am from Kalimantan.',
    isListening: true,
  },
  {
    id: 2,
    topic: 'Pronouns & Subject Verb Agreement',
    question: 'Complete the sentence: "This is Monita. ______ favorite hobby is reading comic books."',
    options: ['His', 'Her', 'Their', 'My'],
    correctAnswer: 1,
    explanation: 'Monita adalah kata ganti orang perempuan (female pronoun: She). Possessive adjective (kata ganti kepemilikan) untuk perempuan adalah "Her".',
  },
  {
    id: 3,
    topic: 'Describing People - Physical Appearance',
    question: 'Read the description: "Andre is tall and has curly black hair. He always wears glasses." Which statement is TRUE about Andre?',
    options: [
      'He has straight blonde hair',
      'He wears eyeglasses',
      'He is short and plump',
      'He does not like wearing glasses'
    ],
    correctAnswer: 1,
    explanation: 'Kalimat menyebutkan: "He always wears glasses" yang berarti Andre selalu memakai kacamata (eyeglasses).',
    passage: 'Andre is tall and has curly black hair. He always wears glasses. He is very friendly to all of his classmates.',
    audioText: 'Andre is tall and has curly black hair. He always wears glasses. He is very friendly to all of his classmates.',
    isListening: true,
  },
  {
    id: 4,
    topic: 'Asking for Personal Information',
    question: 'If you want to know someone\'s age, which question is the most appropriate to ask?',
    options: [
      'Where do you live?',
      'How are you today?',
      'How old are you?',
      'What is your hobby?'
    ],
    correctAnswer: 2,
    explanation: '"How old are you?" digunakan untuk menanyakan usia seseorang. "Where do you live?" untuk alamat, "What is your hobby?" untuk hobi.',
  },
  {
    id: 5,
    topic: 'Preposition of Origin and Place',
    question: 'Complete the dialogue:\nPipit: "Where do you live, Made?"\nMade: "I live ______ Jl. Merak No. 12."',
    options: ['at', 'in', 'on', 'from'],
    correctAnswer: 0,
    explanation: 'Untuk alamat spesifik dan lengkap dengan nomor rumah (Jl. Merak No. 12), preposisi yang benar adalah "at". (In untuk kota/negara, On untuk nama jalan tanpa nomor).',
  },
  {
    id: 6,
    topic: 'Descriptive Text - Identification and Description',
    question: 'What is the main communicative purpose of a Descriptive Text about a person?',
    options: [
      'To tell steps to cook traditional food',
      'To describe and reveal a particular person, place, or thing',
      'To entertain readers with a fictional fairy tale',
      'To report the results of a scientific experiment'
    ],
    correctAnswer: 1,
    explanation: 'Tujuan komunikatif Descriptive Text adalah untuk mendeskripsikan dan menggambarkan orang, tempat, atau benda tertentu secara khusus.',
  },
  {
    id: 7,
    topic: 'Introducing Others in Conversation',
    question: 'Galang: "Andre, this is my new classmate, Sinta."\nAndre: "Hi Sinta, __________________"\nSinta: "Nice to meet you too, Andre."',
    options: [
      'See you later.',
      'Nice to meet you.',
      'I am not fine.',
      'What do you do?'
    ],
    correctAnswer: 1,
    explanation: 'Respons yang paling lazim dan sopan saat pertama kali diperkenalkan adalah "Nice to meet you", yang dibalas dengan "Nice to meet you too".',
  },
  {
    id: 8,
    topic: 'Listening & Character Traits',
    question: 'Listen carefully: "Made is an active boy. He loves playing basketball and never gives up during matches." What is Made\'s hobby?',
    options: ['Reading novels', 'Playing basketball', 'Cooking fritters', 'Fishing at the river'],
    correctAnswer: 1,
    explanation: 'Dalam rekaman audio disebutkan: "He loves playing basketball". Maka hobi Made adalah bermain bola basket.',
    audioText: 'Made is an active boy. He loves playing basketball and never gives up during matches.',
    isListening: true,
  },
  {
    id: 9,
    topic: 'Simple Present Tense - Have / Has',
    question: 'Complete the sentence with the correct verb: "My brother and I ________ a collection of old stamps."',
    options: ['has', 'have', 'having', 'is having'],
    correctAnswer: 1,
    explanation: 'Subjek "My brother and I" adalah jamak (We), sehingga kata kerja kepemilikan yang tepat dalam Simple Present Tense adalah "have".',
  },
  {
    id: 10,
    topic: 'Descriptive Adjectives',
    question: 'Which of the following words is an adjective used to describe someone\'s personality?',
    options: ['Quickly', 'Helpful', 'Classroom', 'Walking'],
    correctAnswer: 1,
    explanation: '"Helpful" (suka menolong) adalah kata sifat (adjective) yang mendeskripsikan kepribadian seseorang. Quickly adalah adverb, Classroom adalah noun, Walking adalah verb.',
  },
];

export const INITIAL_STUDENT_MASTER: StudentMasterData[] = [
  { id: '1', name: 'Ahmad Rizky Pratama', className: '7A', attendanceNumber: 1 },
  { id: '2', name: 'Aisyah Putri Rahmawati', className: '7A', attendanceNumber: 2 },
  { id: '3', name: 'Bagas Aditya Nugroho', className: '7A', attendanceNumber: 3 },
  { id: '4', name: 'Cantika Dewi Lestari', className: '7A', attendanceNumber: 4 },
  { id: '5', name: 'Dimas Wahyu Saputra', className: '7A', attendanceNumber: 5 },
  { id: '6', name: 'Fadhil Muhammad Ihsan', className: '7B', attendanceNumber: 1 },
  { id: '7', name: 'Gita Anindya Putri', className: '7B', attendanceNumber: 2 },
  { id: '8', name: 'Hafiz Al-Farisi', className: '7B', attendanceNumber: 3 },
  { id: '9', name: 'Intan Nur Aini', className: '7B', attendanceNumber: 4 },
  { id: '10', name: 'Jovan Nathan Kusuma', className: '7B', attendanceNumber: 5 },
];

export const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    name: 'Ahmad Rizky Pratama',
    className: '7A',
    attendanceNumber: 1,
    score: 90,
    correctAnswersCount: 9,
    totalQuestions: 10,
    answers: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 0, 6: 1, 7: 1, 8: 1, 9: 1, 10: 0 },
    timeSpentSeconds: 430,
    submittedAt: '2026-09-29 08:30:15',
  },
  {
    id: 'sub-2',
    name: 'Aisyah Putri Rahmawati',
    className: '7A',
    attendanceNumber: 2,
    score: 100,
    correctAnswersCount: 10,
    totalQuestions: 10,
    answers: { 1: 1, 2: 1, 3: 1, 4: 2, 5: 0, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1 },
    timeSpentSeconds: 380,
    submittedAt: '2026-09-29 08:35:40',
  },
  {
    id: 'sub-3',
    name: 'Bagas Aditya Nugroho',
    className: '7A',
    attendanceNumber: 3,
    score: 70,
    correctAnswersCount: 7,
    totalQuestions: 10,
    answers: { 1: 1, 2: 0, 3: 1, 4: 2, 5: 1, 6: 1, 7: 1, 8: 0, 9: 1, 10: 1 },
    timeSpentSeconds: 520,
    submittedAt: '2026-09-29 08:41:10',
  },
];

export const INITIAL_PROCEDURE_TEXTS: ProcedureTextItem[] = [
  {
    id: 'p-1',
    title: 'How to Introduce Myself Confidently',
    category: 'snack',
    goal: 'To deliver a complete and polite self-introduction in English.',
    ingredients: [
      'Greeting (Good morning / Hello everyone)',
      'Full Name and Nickname (My name is... You can call me...)',
      'Origin and Address (I am from... I live in...)',
      'Age and School (I am 13 years old. I study at SMP...)',
      'Hobby and Favorite Subject (I like... My favorite subject is...)',
      'Closing (Nice to meet you / Thank you)'
    ],
    tools: [
      'Smile and eye contact',
      'Clear and polite voice',
      'Good standing posture'
    ],
    steps: [
      'First, start with a warm greeting like "Hello everyone" or "Good morning".',
      'Next, clearly state your full name and nickname so your friends know how to call you.',
      'Then, mention your place of origin or where you live using appropriate prepositions.',
      'After that, share your age and what hobbies or sports you enjoy during free time.',
      'Finally, conclude your introduction politely by saying "Nice to meet you all".'
    ],
    languageFocus: [
      'Simple Present Tense (am, is, are / live, like, study)',
      'Subject Pronouns (I, you, he, she, we, they)',
      'Possessive Adjectives (my, your, his, her, our, their)'
    ],
    audioScript: 'Hello everyone. First, greet your friends warmly. Next, state your full name and nickname. Then, tell where you live. After that, share your favorite hobbies. Finally, close with nice to meet you.'
  },
  {
    id: 'p-2',
    title: 'How to Make Sweet Potato Fritters (Pisang Goreng / Ubi Goreng)',
    category: 'food',
    goal: 'How to make crunchy and delicious Sweet Potato Fritters (Culinary and Me - Chapter 2)',
    servings: '4-5 servings',
    cookingTime: '20 minutes',
    ingredients: [
      '500g sweet potatoes (peeled and sliced)',
      '100g all-purpose flour',
      '2 tablespoons of rice flour',
      '2 tablespoons of sugar',
      'A pinch of salt',
      '150ml clean water',
      'Cooking oil for frying'
    ],
    tools: [
      'Mixing bowl',
      'Frying pan / wok',
      'Spatula',
      'Sieve or strainer for draining oil',
      'Serving plate'
    ],
    steps: [
      'First, peel the sweet potatoes, wash them cleanly, and slice into thin pieces.',
      'Next, in a large mixing bowl, mix all-purpose flour, rice flour, sugar, salt, and water until smooth.',
      'Then, dip the sliced sweet potatoes into the batter until well coated.',
      'After that, heat the cooking oil in a frying pan and fry the coated sweet potatoes until golden brown and crispy.',
      'Finally, take them out with a spatula, drain on a sieve, and serve hot on a plate.'
    ],
    languageFocus: [
      'Imperative verbs: Peel, Wash, Slice, Mix, Dip, Heat, Fry, Drain, Serve',
      'Sequence adverbs: First, Next, Then, After that, Finally',
      'Kitchen utensils: Spatula, Strainer, Mixing bowl, Frying pan'
    ],
    audioScript: 'First, peel and slice the sweet potatoes. Next, mix the flour, sugar, and water in a bowl. Then, dip the potatoes into the batter. After that, fry them in hot oil until golden brown. Finally, drain the oil and enjoy your delicious sweet potato fritters.'
  }
];
