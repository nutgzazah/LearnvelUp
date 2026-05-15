export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          answer_text: string
          id: number
          is_correct: boolean
          question_id: number | null
        }
        Insert: {
          answer_text: string
          id?: number
          is_correct?: boolean
          question_id?: number | null
        }
        Update: {
          answer_text?: string
          id?: number
          is_correct?: boolean
          question_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          condition_type: string | null
          condition_value: number | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          name: string
          type: Database["public"]["Enums"]["badge_type"]
        }
        Insert: {
          condition_type?: string | null
          condition_value?: number | null
          created_at?: string | null
          description?: string | null
          id?: never
          image_url?: string | null
          name: string
          type?: Database["public"]["Enums"]["badge_type"]
        }
        Update: {
          condition_type?: string | null
          condition_value?: number | null
          created_at?: string | null
          description?: string | null
          id?: never
          image_url?: string | null
          name?: string
          type?: Database["public"]["Enums"]["badge_type"]
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          course_id: number | null
          duration_seconds: number | null
          energy_cost_per_question: number
          id: number
          quiz_pass_score: number
          reward_coins: number | null
          reward_energy: number | null
          reward_xp: number | null
          sequence_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          course_id?: number | null
          duration_seconds?: number | null
          energy_cost_per_question?: number
          id?: number
          quiz_pass_score?: number
          reward_coins?: number | null
          reward_energy?: number | null
          reward_xp?: number | null
          sequence_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          course_id?: number | null
          duration_seconds?: number | null
          energy_cost_per_question?: number
          id?: number
          quiz_pass_score?: number
          reward_coins?: number | null
          reward_energy?: number | null
          reward_xp?: number | null
          sequence_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          chapter_id: number
          content: string
          created_at: string | null
          id: number
          is_resolved: boolean
          parent_id: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chapter_id: number
          content: string
          created_at?: string | null
          id?: never
          is_resolved?: boolean
          parent_id?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chapter_id?: number
          content?: string
          created_at?: string | null
          id?: never
          is_resolved?: boolean
          parent_id?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category_id: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: number
          instructor_id: number | null
          learning_outcome: string | null
          price_coins: number
          status: Database["public"]["Enums"]["course_status"]
          sub_category_1_id: number | null
          sub_category_2_id: number | null
          title: string
          total_enrolled: number | null
        }
        Insert: {
          category_id?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          instructor_id?: number | null
          learning_outcome?: string | null
          price_coins?: number
          status?: Database["public"]["Enums"]["course_status"]
          sub_category_1_id?: number | null
          sub_category_2_id?: number | null
          title: string
          total_enrolled?: number | null
        }
        Update: {
          category_id?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          instructor_id?: number | null
          learning_outcome?: string | null
          price_coins?: number
          status?: Database["public"]["Enums"]["course_status"]
          sub_category_1_id?: number | null
          sub_category_2_id?: number | null
          title?: string
          total_enrolled?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_sub_category_2_id_fkey"
            columns: ["sub_category_2_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_sub_category_id_fkey"
            columns: ["sub_category_1_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: number | null
          enrolled_at: string | null
          id: number
          is_completed: boolean | null
          progress_percent: number | null
          user_id: string | null
        }
        Insert: {
          course_id?: number | null
          enrolled_at?: string | null
          id?: number
          is_completed?: boolean | null
          progress_percent?: number | null
          user_id?: string | null
        }
        Update: {
          course_id?: number | null
          enrolled_at?: string | null
          id?: number
          is_completed?: boolean | null
          progress_percent?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          avatar_url: string | null
          bio: string | null
          email: string | null
          id: number
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          id?: number
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          email?: string | null
          id?: number
          username?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          id: number
          image_url: string | null
          name: string
          price_coins: number
          type: Database["public"]["Enums"]["item_type"]
        }
        Insert: {
          id?: number
          image_url?: string | null
          name: string
          price_coins?: number
          type: Database["public"]["Enums"]["item_type"]
        }
        Update: {
          id?: number
          image_url?: string | null
          name?: string
          price_coins?: number
          type?: Database["public"]["Enums"]["item_type"]
        }
        Relationships: []
      }
      learning_path_courses: {
        Row: {
          course_id: number
          created_at: string | null
          id: number
          is_required: boolean
          learning_path_id: number
          sequence_order: number
          unlock_type: Database["public"]["Enums"]["learning_path_unlock_type"]
        }
        Insert: {
          course_id: number
          created_at?: string | null
          id?: never
          is_required?: boolean
          learning_path_id: number
          sequence_order: number
          unlock_type?: Database["public"]["Enums"]["learning_path_unlock_type"]
        }
        Update: {
          course_id?: number
          created_at?: string | null
          id?: never
          is_required?: boolean
          learning_path_id?: number
          sequence_order?: number
          unlock_type?: Database["public"]["Enums"]["learning_path_unlock_type"]
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_courses_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          category_id: number | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: number
          status: Database["public"]["Enums"]["learning_path_status"]
          sub_category_id: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          status?: Database["public"]["Enums"]["learning_path_status"]
          sub_category_id?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: never
          status?: Database["public"]["Enums"]["learning_path_status"]
          sub_category_id?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_paths_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      level_requirements: {
        Row: {
          level: number
          min_total_xp: number
        }
        Insert: {
          level: number
          min_total_xp: number
        }
        Update: {
          level?: number
          min_total_xp?: number
        }
        Relationships: []
      }
      missions: {
        Row: {
          condition_type: string | null
          created_at: string | null
          description: string | null
          end_at: string | null
          frequency: Database["public"]["Enums"]["mission_frequency"]
          id: number
          is_active: boolean
          reward_coins: number | null
          reward_energy: number | null
          reward_xp: number | null
          start_at: string | null
          target_value: number
          title: string
        }
        Insert: {
          condition_type?: string | null
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          frequency?: Database["public"]["Enums"]["mission_frequency"]
          id?: number
          is_active?: boolean
          reward_coins?: number | null
          reward_energy?: number | null
          reward_xp?: number | null
          start_at?: string | null
          target_value?: number
          title: string
        }
        Update: {
          condition_type?: string | null
          created_at?: string | null
          description?: string | null
          end_at?: string | null
          frequency?: Database["public"]["Enums"]["mission_frequency"]
          id?: number
          is_active?: boolean
          reward_coins?: number | null
          reward_energy?: number | null
          reward_xp?: number | null
          start_at?: string | null
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group_type"] | null
          birthdate: string | null
          created_at: string
          equipped_avatar_id: number | null
          equipped_frame_id: number | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group_type"] | null
          birthdate?: string | null
          created_at?: string
          equipped_avatar_id?: number | null
          equipped_frame_id?: number | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group_type"] | null
          birthdate?: string | null
          created_at?: string
          equipped_avatar_id?: number | null
          equipped_frame_id?: number | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_equipped_avatar_id_fkey"
            columns: ["equipped_avatar_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_equipped_frame_id_fkey"
            columns: ["equipped_frame_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          chapter_id: number | null
          id: number
          points: number | null
          question_text: string
          sequence_order: number | null
        }
        Insert: {
          chapter_id?: number | null
          id?: number
          points?: number | null
          question_text: string
          sequence_order?: number | null
        }
        Update: {
          chapter_id?: number | null
          id?: number
          points?: number | null
          question_text?: string
          sequence_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_events: {
        Row: {
          action: string | null
          course_id: number
          created_at: string
          id: number
          score: number | null
          source: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          action?: string | null
          course_id: number
          created_at?: string
          id?: number
          score?: number | null
          source?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          action?: string | null
          course_id?: number
          created_at?: string
          id?: number
          score?: number | null
          source?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: Database["public"]["Enums"]["currency_type"]
          id: number
          reference_id: number | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: number
          reference_id?: number | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency_type"]
          id?: number
          reference_id?: number | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: number
          reference_id: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: never
          reference_id?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: never
          reference_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: number
          earned_at: string | null
          id: number
          is_equipped: boolean | null
          user_id: string
        }
        Insert: {
          badge_id: number
          earned_at?: string | null
          id?: never
          is_equipped?: boolean | null
          user_id: string
        }
        Update: {
          badge_id?: number
          earned_at?: string | null
          id?: never
          is_equipped?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_chapter_progress: {
        Row: {
          chapter_id: number | null
          completed_at: string | null
          id: number
          is_passed: boolean | null
          is_video_watched: boolean | null
          user_id: string | null
        }
        Insert: {
          chapter_id?: number | null
          completed_at?: string | null
          id?: number
          is_passed?: boolean | null
          is_video_watched?: boolean | null
          user_id?: string | null
        }
        Update: {
          chapter_id?: number | null
          completed_at?: string | null
          id?: number
          is_passed?: boolean | null
          is_video_watched?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_chapter_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_chapter_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_energy: {
        Row: {
          current: number
          last_updated: string
          max: number
          user_id: string
        }
        Insert: {
          current?: number
          last_updated?: string
          max?: number
          user_id: string
        }
        Update: {
          current?: number
          last_updated?: string
          max?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_energy_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          category_id: number | null
          created_at: string | null
          user_id: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          user_id?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          acquired_at: string | null
          id: number
          item_id: number | null
          quantity: number
          user_id: string | null
        }
        Insert: {
          acquired_at?: string | null
          id?: number
          item_id?: number | null
          quantity?: number
          user_id?: string | null
        }
        Update: {
          acquired_at?: string | null
          id?: number
          item_id?: number | null
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_path_courses: {
        Row: {
          completed_at: string | null
          id: number
          is_completed: boolean
          is_unlocked: boolean
          learning_path_course_id: number
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: never
          is_completed?: boolean
          is_unlocked?: boolean
          learning_path_course_id: number
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: never
          is_completed?: boolean
          is_unlocked?: boolean
          learning_path_course_id?: number
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_path_courses_learning_path_course_id_fkey"
            columns: ["learning_path_course_id"]
            isOneToOne: false
            referencedRelation: "learning_path_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_path_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_paths: {
        Row: {
          completed_at: string | null
          id: number
          learning_path_id: number
          progress_percent: number
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: never
          learning_path_id: number
          progress_percent?: number
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: never
          learning_path_id?: number
          progress_percent?: number
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_paths_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed_at: string | null
          current_progress: number
          cycle_date: string | null
          id: number
          mission_id: number | null
          status: Database["public"]["Enums"]["mission_status"]
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          current_progress?: number
          cycle_date?: string | null
          id?: number
          mission_id?: number | null
          status?: Database["public"]["Enums"]["mission_status"]
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          current_progress?: number
          cycle_date?: string | null
          id?: number
          mission_id?: number | null
          status?: Database["public"]["Enums"]["mission_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          coins: number
          current_streak: number | null
          last_activity_date: string | null
          level: number
          longest_streak: number | null
          total_courses_completed: number | null
          total_quizzes_passed: number | null
          user_id: string
          welcome_bonus_claimed: boolean | null
          xp: number
        }
        Insert: {
          coins?: number
          current_streak?: number | null
          last_activity_date?: string | null
          level?: number
          longest_streak?: number | null
          total_courses_completed?: number | null
          total_quizzes_passed?: number | null
          user_id: string
          welcome_bonus_claimed?: boolean | null
          xp?: number
        }
        Update: {
          coins?: number
          current_streak?: number | null
          last_activity_date?: string | null
          level?: number
          longest_streak?: number | null
          total_courses_completed?: number | null
          total_quizzes_passed?: number | null
          user_id?: string
          welcome_bonus_claimed?: boolean | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          course_id: number
          created_at: string | null
          id: number
          user_id: string
        }
        Insert: {
          course_id: number
          created_at?: string | null
          id?: never
          user_id: string
        }
        Update: {
          course_id?: number
          created_at?: string | null
          id?: never
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_award_badges: { Args: { p_user_id: string }; Returns: Json }
      check_username_available: {
        Args: { requested_username: string }
        Returns: boolean
      }
      claim_mission_reward: {
        Args: { p_mission_id: number; p_user_id: string }
        Returns: Json
      }
      claim_welcome_bonus: { Args: { p_user_id: string }; Returns: Json }
      deduct_user_energy: {
        Args: { p_cost: number; p_user_id: string }
        Returns: undefined
      }
      enroll_course: {
        Args: { p_course_id: number; p_user_id: string }
        Returns: Json
      }
      equip_user_badge: {
        Args: { p_badge_id: number; p_user_id: string }
        Returns: Json
      }
      get_chapter_comments_secure: {
        Args: { p_chapter_id: number }
        Returns: {
          avatar_url: string
          content: string
          created_at: string
          id: number
          parent_id: number
          user_id: string
          username: string
        }[]
      }
      get_current_energy: { Args: { p_user_id: string }; Returns: number }
      get_user_achievements: {
        Args: { p_user_id: string }
        Returns: {
          condition_type: string
          condition_value: number
          current_progress: number
          description: string
          id: number
          image_url: string
          is_claimed: boolean
          is_completed: boolean
          is_equipped: boolean
          name: string
        }[]
      }
      get_user_missions: {
        Args: { p_user_id: string }
        Returns: {
          current_value: number
          description: string
          frequency: string
          is_claimed: boolean
          is_completed: boolean
          mission_id: number
          name: string
          reward_coins: number
          reward_energy: number
          reward_xp: number
          target_value: number
        }[]
      }
      log_user_activity: {
        Args: {
          p_action_type: string
          p_reference_id?: number
          p_user_id: string
        }
        Returns: undefined
      }
      process_quiz_victory: {
        Args: {
          p_chapter_id: number
          p_coins: number
          p_energy: number
          p_user_id: string
          p_xp: number
        }
        Returns: Json
      }
      purchase_profile_item: {
        Args: { p_item_id: number; p_user_id: string }
        Returns: {
          item_id: number
          message: string
          remaining_coins: number
          spent_coins: number
          success: boolean
        }[]
      }
      uat_set_streak_to_three: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      age_group_type: "high_school" | "university" | "working" | "general"
      badge_type: "milestone" | "monthly" | "special"
      course_status: "draft" | "published" | "closed"
      currency_type: "coins" | "energy" | "xp"
      gender_type: "male" | "female" | "other"
      item_type: "avatar" | "frame" | "background"
      learning_path_status: "draft" | "published" | "archived"
      learning_path_unlock_type:
        | "always_unlocked"
        | "previous_completed"
        | "manual"
      mission_frequency: "one_time" | "daily" | "weekly" | "monthly"
      mission_status: "ongoing" | "completed" | "claimed"
      transaction_type: "buy_course" | "buy_item" | "refill_energy" | "topup"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      age_group_type: ["high_school", "university", "working", "general"],
      badge_type: ["milestone", "monthly", "special"],
      course_status: ["draft", "published", "closed"],
      currency_type: ["coins", "energy", "xp"],
      gender_type: ["male", "female", "other"],
      item_type: ["avatar", "frame", "background"],
      learning_path_status: ["draft", "published", "archived"],
      learning_path_unlock_type: [
        "always_unlocked",
        "previous_completed",
        "manual",
      ],
      mission_frequency: ["one_time", "daily", "weekly", "monthly"],
      mission_status: ["ongoing", "completed", "claimed"],
      transaction_type: ["buy_course", "buy_item", "refill_energy", "topup"],
    },
  },
} as const
