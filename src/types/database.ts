// Hand-written to match supabase/migrations/0001_init.sql.
// Regenerate with `npm run supabase:gen-types` once the project is linked to a live Supabase instance.

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          native_language: string | null;
          arabic_experience: string | null;
          goals: string[];
          favorite_dialect: string | null;
          difficulty: string | null;
          daily_goal_minutes: number;
          reminder_time: string;
          speech_confidence: string | null;
          subscription_tier: 'free' | 'premium' | 'family';
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      gamification: {
        Row: {
          user_id: string;
          xp: number;
          total_xp: number;
          level: number;
          coins: number;
          diamonds: number;
          current_streak: number;
          longest_streak: number;
          last_study_date: string | null;
          weekly_xp: number;
          weekly_goal_xp: number;
          freezes_available: number;
          season_pass_level: number;
          season_pass_xp: number;
          active_title: string | null;
          active_avatar: string | null;
          league: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['gamification']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['gamification']['Row']>;
      };
      daily_activity: {
        Row: {
          user_id: string;
          activity_date: string;
          xp: number;
          lessons_completed: number;
          perfect_lessons: number;
          speaking_done: number;
          words_reviewed: number;
          conversations_completed: number;
        };
        Insert: Partial<Database['public']['Tables']['daily_activity']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['daily_activity']['Row']>;
      };
      srs_cards: {
        Row: {
          user_id: string;
          word_id: string;
          ease_factor: number;
          interval_days: number;
          repetitions: number;
          due_at: string;
          last_reviewed_at: string | null;
          lapses: number;
        };
        Insert: Partial<Database['public']['Tables']['srs_cards']['Row']> & { user_id: string; word_id: string };
        Update: Partial<Database['public']['Tables']['srs_cards']['Row']>;
      };
      lesson_completions: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          accuracy: number;
          xp_earned: number;
          completed_at: string;
        };
        Insert: Partial<Database['public']['Tables']['lesson_completions']['Row']> & { user_id: string; lesson_id: string; accuracy: number };
        Update: Partial<Database['public']['Tables']['lesson_completions']['Row']>;
      };
      user_achievements: {
        Row: { user_id: string; achievement_id: string; unlocked_at: string };
        Insert: { user_id: string; achievement_id: string; unlocked_at?: string };
        Update: Partial<Database['public']['Tables']['user_achievements']['Row']>;
      };
      friendships: {
        Row: { user_id: string; friend_id: string; status: 'pending' | 'accepted' | 'blocked'; created_at: string };
        Insert: { user_id: string; friend_id: string; status?: 'pending' | 'accepted' | 'blocked' };
        Update: Partial<Database['public']['Tables']['friendships']['Row']>;
      };
      conversation_history: {
        Row: {
          id: string;
          user_id: string;
          character_id: string;
          speaker: 'user' | 'ai';
          text_arabic: string | null;
          text_transliteration: string | null;
          text_english: string | null;
          audio_url: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['conversation_history']['Row']> & { user_id: string; character_id: string; speaker: 'user' | 'ai' };
        Update: Partial<Database['public']['Tables']['conversation_history']['Row']>;
      };
      conversation_scores: {
        Row: {
          id: string;
          user_id: string;
          character_id: string;
          pronunciation: number | null;
          grammar: number | null;
          vocabulary: number | null;
          confidence: number | null;
          naturalness: number | null;
          fluency: number | null;
          overall: number | null;
          corrections: unknown;
          strengths: unknown;
          areas_to_improve: unknown;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['conversation_scores']['Row']> & { user_id: string; character_id: string };
        Update: Partial<Database['public']['Tables']['conversation_scores']['Row']>;
      };
      ai_generated_content: {
        Row: {
          id: string;
          user_id: string;
          kind: 'lesson' | 'vocabulary' | 'grammar_explanation';
          dialect_id: string;
          topic: string | null;
          payload: unknown;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ai_generated_content']['Row']> & { user_id: string; kind: 'lesson' | 'vocabulary' | 'grammar_explanation'; dialect_id: string; payload: unknown };
        Update: Partial<Database['public']['Tables']['ai_generated_content']['Row']>;
      };
    };
    Views: {
      weekly_leaderboard: {
        Row: {
          user_id: string;
          display_name: string | null;
          active_avatar: string | null;
          weekly_xp: number;
          league: string;
        };
      };
    };
  };
}
