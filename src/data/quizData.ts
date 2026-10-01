import { Question, QuizSettings, ProcedureTextItem, StudentSubmission, StudentMasterData } from '../types';

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  maxAttempts: 1,
  timeLimitMinutes: 20,
  isQuizOpen: true,
  allowedClasses: ['7A', '7B', '7C', '7D', '7E', '7F', '7G', '7H'],
  activeClass: 'Semua Kelas',
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

export const CLASS_SAMPLE_STUDENTS: Record<string, Array<{ name: string; nisn: string }>> = {
  '7A': [
    { name: 'Ahmad Rizky Pratama', nisn: '0012345671' },
    { name: 'Aisyah Putri Rahmawati', nisn: '0012345672' },
    { name: 'Bagas Aditya Nugroho', nisn: '0012345673' },
    { name: 'Cantika Dewi Lestari', nisn: '0012345674' },
    { name: 'Dimas Wahyu Saputra', nisn: '0012345675' },
    { name: 'Eka Nur Anggraini', nisn: '0012345676' },
    { name: 'Fajar Kurniawan', nisn: '0012345677' },
    { name: 'Gita Ayu Wardani', nisn: '0012345678' },
    { name: 'Hendi Pratama', nisn: '0012345679' },
    { name: 'Intan Permatasari', nisn: '0012345680' },
  ],
  '7B': [
    { name: 'Fadhil Muhammad Ihsan', nisn: '0023456781' },
    { name: 'Farhan Maulana Yusuf', nisn: '0023456782' },
    { name: 'Gita Anindya Putri', nisn: '0023456783' },
    { name: 'Hafiz Al-Farisi', nisn: '0023456784' },
    { name: 'Hanifah Salsabila', nisn: '0023456785' },
    { name: 'Intan Nur Aini', nisn: '0023456786' },
    { name: 'Jovan Nathan Kusuma', nisn: '0023456787' },
    { name: 'Kayla Maharani', nisn: '0023456788' },
    { name: 'Kevin Arya Wardhana', nisn: '0023456789' },
    { name: 'Luthfi Rabbani', nisn: '0023456790' },
  ],
  '7C': [
    { name: 'Aditya Bagus Prakoso', nisn: '0034567891' },
    { name: 'Amanda Putri Cahyani', nisn: '0034567892' },
    { name: 'Bayu Aji Pamungkas', nisn: '0034567893' },
    { name: 'Citra Kirana Wulandari', nisn: '0034567894' },
    { name: 'Danu Prasetyo', nisn: '0034567895' },
    { name: 'Dinda Ayu Saraswati', nisn: '0034567896' },
    { name: 'Faris Al-Faruq', nisn: '0034567897' },
    { name: 'Galuh Ratna Sari', nisn: '0034567898' },
    { name: 'Hendra Setiawan', nisn: '0034567899' },
    { name: 'Jessica Aurelia', nisn: '0034567900' },
  ],
  '7D': [
    { name: 'Alifia Zahra Rahmania', nisn: '0045678901' },
    { name: 'Bintang Ramadhan Putra', nisn: '0045678902' },
    { name: 'Clara Nathania', nisn: '0045678903' },
    { name: 'Denis Saputra Pratama', nisn: '0045678904' },
    { name: 'Elvina Rahmawati', nisn: '0045678905' },
    { name: 'Fahmi Reza Kurnia', nisn: '0045678906' },
    { name: 'Gibran Al-Ghifari', nisn: '0045678907' },
    { name: 'Hana Khairunnisa', nisn: '0045678908' },
    { name: 'Ilham Maulana Malik', nisn: '0045678909' },
    { name: 'Jasmine Nadia Putri', nisn: '0045678910' },
  ],
  '7E': [
    { name: 'Ananda Rizky Ramadhan', nisn: '0056789011' },
    { name: 'Bella Safitri', nisn: '0056789012' },
    { name: 'Candra Wijaya', nisn: '0056789013' },
    { name: 'Diva Amelia Putri', nisn: '0056789014' },
    { name: 'Ezra Satria Pratama', nisn: '0056789015' },
    { name: 'Febriani Dwi Lestari', nisn: '0056789016' },
    { name: 'Gilang Ramadhan', nisn: '0056789017' },
    { name: 'Hesti Wulandari', nisn: '0056789018' },
    { name: 'Irfan Maulana', nisn: '0056789019' },
    { name: 'Jihan Syakirah', nisn: '0056789020' },
  ],
  '7F': [
    { name: 'Arya Dwi Pamungkas', nisn: '0067890121' },
    { name: 'Bilqis Humaira', nisn: '0067890122' },
    { name: 'Cinta Laura Pratiwi', nisn: '0067890123' },
    { name: 'Doni Andrian', nisn: '0067890124' },
    { name: 'Elsa Oktaviani', nisn: '0067890125' },
    { name: 'Firman Syahputra', nisn: '0067890126' },
    { name: 'Grace Natalie', nisn: '0067890127' },
    { name: 'Haidar Ali', nisn: '0067890128' },
    { name: 'Indah Permata', nisn: '0067890129' },
    { name: 'Joshua Pratama', nisn: '0067890130' },
  ],
  '7G': [
    { name: 'Arkan Naufal Danendra', nisn: '0078901231' },
    { name: 'Chelsea Olivia Putri', nisn: '0078901232' },
    { name: 'Dafa Ibnu Sina', nisn: '0078901233' },
    { name: 'Erina Gudono Wulandari', nisn: '0078901234' },
    { name: 'Fauzan Azhim', nisn: '0078901235' },
    { name: 'Gracia Indah', nisn: '0078901236' },
    { name: 'Hilman Syarif', nisn: '0078901237' },
    { name: 'Inaya Wulandari', nisn: '0078901238' },
    { name: 'Julian Al-Fatih', nisn: '0078901239' },
    { name: 'Kania Dewi', nisn: '0078901240' },
  ],
  '7H': [
    { name: 'Aldi Taher Ramadhan', nisn: '0089012341' },
    { name: 'Berlian Cantika', nisn: '0089012342' },
    { name: 'Calvin Jeremy Putra', nisn: '0089012343' },
    { name: 'Dea Ananda Maharani', nisn: '0089012344' },
    { name: 'Evan Dimas Saputra', nisn: '0089012345' },
    { name: 'Farah Diba', nisn: '0089012346' },
    { name: 'Geraldo Pratama', nisn: '0089012347' },
    { name: 'Hanna Marwah', nisn: '0089012348' },
    { name: 'Ian Kasela', nisn: '0089012349' },
    { name: 'Karina Suwandi', nisn: '0089012350' },
  ],
};

export const INITIAL_STUDENT_MASTER: StudentMasterData[] = Object.entries(CLASS_SAMPLE_STUDENTS).flatMap(
  ([className, students]) =>
    students.map((s, idx) => ({
      id: `master-${className}-${idx + 1}`,
      name: s.name,
      className,
      attendanceNumber: idx + 1,
      nisn: s.nisn,
    }))
);

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
