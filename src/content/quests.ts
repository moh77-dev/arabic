import type { Quest } from '@/types';

export const DAILY_QUESTS: Quest[] = [
  { id: 'q_daily_xp_20', title: 'Warm Up', description: 'Earn 20 XP today', type: 'daily', goalType: 'earn_xp', target: 20, xpReward: 10, coinReward: 10, icon: '⚡' },
  { id: 'q_daily_xp_50', title: 'Solid Session', description: 'Earn 50 XP today', type: 'daily', goalType: 'earn_xp', target: 50, xpReward: 20, coinReward: 20, icon: '⚡' },
  { id: 'q_daily_lesson_3', title: 'Triple Threat', description: 'Complete 3 lessons today', type: 'daily', goalType: 'complete_lessons', target: 3, xpReward: 25, coinReward: 25, icon: '📗' },
  { id: 'q_daily_perfect_1', title: 'Flawless', description: 'Get one perfect lesson today', type: 'daily', goalType: 'perfect_lessons', target: 1, xpReward: 20, coinReward: 15, icon: '✨' },
  { id: 'q_daily_speak_1', title: 'Say It Out Loud', description: 'Complete one speaking exercise', type: 'daily', goalType: 'practice_speaking', target: 1, xpReward: 15, coinReward: 15, icon: '🎙️' },
  { id: 'q_daily_review_10', title: 'Memory Lane', description: 'Review 10 flashcards', type: 'daily', goalType: 'review_words', target: 10, xpReward: 15, coinReward: 15, icon: '🔁' },
];

export const WEEKLY_QUESTS: Quest[] = [
  { id: 'q_weekly_xp_300', title: 'Weekly Grind', description: 'Earn 300 XP this week', type: 'weekly', goalType: 'earn_xp', target: 300, xpReward: 100, coinReward: 80, diamondReward: 2, icon: '📅' },
  { id: 'q_weekly_lessons_15', title: 'Course Crusher', description: 'Complete 15 lessons this week', type: 'weekly', goalType: 'complete_lessons', target: 15, xpReward: 120, coinReward: 100, diamondReward: 3, icon: '📘' },
  { id: 'q_weekly_conversation_3', title: 'Chatterbox', description: 'Complete 3 AI conversations this week', type: 'weekly', goalType: 'win_conversation', target: 3, xpReward: 90, coinReward: 70, diamondReward: 2, icon: '💬' },
];

export const MONTHLY_CHALLENGES: Quest[] = [
  { id: 'q_monthly_xp_1500', title: 'Monthly Marathon', description: 'Earn 1500 XP this month', type: 'monthly', goalType: 'earn_xp', target: 1500, xpReward: 400, coinReward: 300, diamondReward: 10, icon: '🏅' },
  { id: 'q_monthly_lessons_60', title: 'Dialect Deep Dive', description: 'Complete 60 lessons this month', type: 'monthly', goalType: 'complete_lessons', target: 60, xpReward: 500, coinReward: 350, diamondReward: 12, icon: '🎯' },
];
