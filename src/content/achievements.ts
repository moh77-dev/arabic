import type { Achievement } from '@/types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach_first_lesson', title: 'First Steps', description: 'Complete your first lesson', icon: '🌱', tier: 'bronze', xpReward: 20, coinReward: 20, criteria: { type: 'lessons_completed', target: 1 } },
  { id: 'ach_10_lessons', title: 'Getting Fluent', description: 'Complete 10 lessons', icon: '📚', tier: 'silver', xpReward: 50, coinReward: 50, criteria: { type: 'lessons_completed', target: 10 } },
  { id: 'ach_50_lessons', title: 'Dialect Devotee', description: 'Complete 50 lessons', icon: '🏆', tier: 'gold', xpReward: 200, coinReward: 150, criteria: { type: 'lessons_completed', target: 50 } },
  { id: 'ach_streak_7', title: 'Week Warrior', description: 'Reach a 7-day streak', icon: '🔥', tier: 'bronze', xpReward: 30, coinReward: 30, criteria: { type: 'streak_days', target: 7 } },
  { id: 'ach_streak_30', title: 'Monthly Master', description: 'Reach a 30-day streak', icon: '🔥', tier: 'gold', xpReward: 150, coinReward: 100, criteria: { type: 'streak_days', target: 30 } },
  { id: 'ach_streak_100', title: 'Centurion', description: 'Reach a 100-day streak', icon: '💯', tier: 'legendary', xpReward: 500, coinReward: 500, criteria: { type: 'streak_days', target: 100 } },
  { id: 'ach_perfect_5', title: 'Perfectionist', description: 'Get 5 perfect lessons in a row', icon: '✨', tier: 'silver', xpReward: 60, coinReward: 40, criteria: { type: 'perfect_streak', target: 5 } },
  { id: 'ach_first_conversation', title: 'Breaking the Ice', description: 'Complete your first AI conversation', icon: '💬', tier: 'bronze', xpReward: 30, coinReward: 25, criteria: { type: 'conversations_completed', target: 1 } },
  { id: 'ach_eloued_master', title: 'Son/Daughter of the Souf', description: 'Complete the entire El Oued track', icon: '🏜️', tier: 'platinum', xpReward: 400, coinReward: 300, criteria: { type: 'dialect_track_completed', target: 1 } },
  { id: 'ach_500_words', title: 'Word Collector', description: 'Learn 500 words', icon: '🧠', tier: 'gold', xpReward: 250, coinReward: 200, criteria: { type: 'words_learned', target: 500 } },
  { id: 'ach_early_bird', title: 'Early Bird', description: 'Complete a lesson before 7am', icon: '🌅', tier: 'bronze', xpReward: 20, coinReward: 20, criteria: { type: 'early_lesson', target: 1 } },
  { id: 'ach_night_owl', title: 'Night Owl', description: 'Complete a lesson after midnight', icon: '🦉', tier: 'bronze', xpReward: 20, coinReward: 20, criteria: { type: 'late_lesson', target: 1 } },
  { id: 'ach_social_butterfly', title: 'Social Butterfly', description: 'Add 5 friends', icon: '🦋', tier: 'silver', xpReward: 40, coinReward: 40, criteria: { type: 'friends_added', target: 5 } },
  { id: 'ach_top_league', title: 'Diamond League', description: 'Reach the Diamond league', icon: '💎', tier: 'legendary', xpReward: 300, coinReward: 250, criteria: { type: 'league_reached', target: 8 } },
  { id: 'ach_story_finished', title: 'Storyteller', description: 'Finish your first interactive story', icon: '📖', tier: 'bronze', xpReward: 25, coinReward: 25, criteria: { type: 'stories_completed', target: 1 } },
];
