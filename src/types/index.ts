// Core domain types shared across the app.

export type DialectId =
  | 'msa'
  | 'algerian_algiers'
  | 'algerian_eloued'
  | 'moroccan'
  | 'tunisian'
  | 'libyan'
  | 'egyptian'
  | 'levantine'
  | 'palestinian'
  | 'lebanese'
  | 'syrian'
  | 'jordanian'
  | 'saudi'
  | 'gulf'
  | 'iraqi'
  | 'sudanese'
  | 'yemeni';

export type LearningGoal =
  | 'travel'
  | 'family'
  | 'religion'
  | 'business'
  | 'school'
  | 'fun';

export type SpeechConfidence = 'beginner' | 'shy' | 'comfortable' | 'confident';

export type DifficultyLevel = 'easy' | 'moderate' | 'challenging' | 'intense';

export interface OnboardingProfile {
  nativeLanguage: string;
  arabicExperience: 'none' | 'a_little' | 'intermediate' | 'fluent_other_dialect';
  goals: LearningGoal[];
  favoriteDialect: DialectId;
  difficulty: DifficultyLevel;
  dailyGoalMinutes: number;
  reminderTime: string; // "HH:mm"
  speechConfidence: SpeechConfidence;
}

export type ExerciseType =
  | 'teach'
  | 'grammar_teach'
  | 'vocabulary'
  | 'listening'
  | 'pronunciation'
  | 'speaking'
  | 'typing'
  | 'matching'
  | 'translation'
  | 'word_order'
  | 'picture_match'
  | 'roleplay'
  | 'conversation'
  | 'speed_round'
  | 'shadowing'
  | 'flashcard'
  | 'quiz';

export interface VocabWord {
  id: string;
  dialectId: DialectId;
  arabic: string; // Arabic script
  transliteration: string; // Latin transliteration
  ipa: string;
  english: string;
  category: VocabCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  audioUrl?: string;
  exampleSentenceArabic?: string;
  exampleSentenceTranslit?: string;
  exampleSentenceEnglish?: string;
  relatedWordIds?: string[];
  notes?: string;
  crossDialect?: Partial<Record<DialectId, string>>;
}

export type VocabCategory =
  | 'greetings'
  | 'family'
  | 'market'
  | 'religion'
  | 'ramadan'
  | 'football'
  | 'school'
  | 'business'
  | 'marriage'
  | 'slang'
  | 'expressions'
  | 'idioms'
  | 'food'
  | 'travel'
  | 'technology'
  | 'sports'
  | 'shopping'
  | 'daily_life'
  | 'health'
  | 'weather'
  | 'numbers'
  | 'colors'
  | 'time';

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  promptArabic?: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer: string | string[];
  /** Extra accepted spellings/translations for typed answers (variations, synonyms). */
  acceptedAnswers?: string[];
  wordBank?: string[];
  explanation?: string;
  xpReward: number;
  dialectId: DialectId;
  relatedWordId?: string;
  /** Payload for a `grammar_teach` card — a short concept explanation with cross-dialect notes. */
  grammar?: { title: string; explanation: string; comparisons?: Partial<Record<DialectId, string>> };
}

/** Exercise types that teach rather than test — they don't count toward lesson accuracy or cost hearts. */
export const TEACHING_EXERCISE_TYPES: ExerciseType[] = ['teach', 'grammar_teach'];

export interface Lesson {
  id: string;
  unitId: string;
  dialectId: DialectId;
  title: string;
  titleArabic: string;
  description: string;
  category: VocabCategory;
  exercises: Exercise[];
  xpReward: number;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  isBoss?: boolean;
  crossDialectComparison?: Partial<Record<DialectId, string>>;
}

export interface Unit {
  id: string;
  dialectId: DialectId;
  title: string;
  description: string;
  icon: string;
  colorFrom: string;
  colorTo: string;
  lessonIds: string[];
  order: number;
}

export interface SRSCard {
  wordId: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueAt: string; // ISO date
  lastReviewedAt?: string;
  lapses: number;
}

export type SRSGrade = 'again' | 'hard' | 'good' | 'easy';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  xpReward: number;
  coinReward: number;
  criteria: { type: string; target: number };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  goalType: 'earn_xp' | 'complete_lessons' | 'perfect_lessons' | 'practice_speaking' | 'review_words' | 'win_conversation';
  target: number;
  xpReward: number;
  coinReward: number;
  diamondReward?: number;
  icon: string;
}

export interface AIConversationCharacter {
  id: string;
  name: string;
  nameArabic: string;
  role: string;
  avatar: string;
  dialectId: DialectId;
  personality: string;
  voiceId: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  conversationGoals: string[];
  systemPromptSeed: string;
  isPremium: boolean;
}

export interface ConversationTurn {
  id: string;
  speaker: 'user' | 'ai';
  textArabic?: string;
  textTransliteration?: string;
  textEnglish?: string;
  audioUri?: string;
  timestamp: number;
}

export interface ConversationScore {
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  confidence: number;
  naturalness: number;
  fluency: number;
  overall: number;
  corrections: { original: string; corrected: string; explanation: string }[];
  strengths: string[];
  areasToImprove: string[];
}

export interface PronunciationResult {
  overallScore: number;
  wordScores: { word: string; score: number; issue?: string }[];
  phonemeIssues: { phoneme: string; expected: string; heard: string }[];
  suggestions: string[];
}

export interface Story {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  coverImage: string;
  dialectId: DialectId;
  isPremium: boolean;
  nodes: StoryNode[];
  startNodeId: string;
}

export interface StoryNode {
  id: string;
  speaker: string;
  textArabic: string;
  textTransliteration: string;
  textEnglish: string;
  audioUrl?: string;
  choices?: { id: string; textArabic: string; textEnglish: string; nextNodeId: string; isCorrect?: boolean }[];
  vocabHighlights?: string[];
  isEnding?: boolean;
}

export interface UserGamification {
  xp: number;
  level: number;
  coins: number;
  diamonds: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  weeklyXp: number;
  weeklyGoalXp: number;
  freezesAvailable: number;
  seasonPassLevel: number;
  seasonPassXp: number;
  titles: string[];
  activeTitle: string | null;
  unlockedAvatars: string[];
  activeAvatar: string;
  unlockedAchievementIds: string[];
  studyHeatmap: Record<string, number>; // date -> minutes studied
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatar: string;
  weeklyXp: number;
  league: League;
  rank: number;
}

export type League =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'sapphire'
  | 'ruby'
  | 'emerald'
  | 'amethyst'
  | 'diamond';

export type SubscriptionTier = 'free' | 'premium' | 'family';
