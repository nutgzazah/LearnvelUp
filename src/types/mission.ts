export interface Mission {
  id: number;
  name: string;
  description: string;
  period_type_id: number;
  metric_type_id: number;
  target_value: number;
  reward_energy: number;
  reward_xp: number;
  reward_coins: number;
  is_active: boolean;
  created_at: string;

  // Relations
  period_type?: MissionPeriodType;
  metric_type?: MissionMetricType;
}

export interface MissionProgress {
  id: number;
  mission_id: number;
  user_id: number;
  period_start_date: string;
  current_value: number;
  is_completed: boolean;
  completed_at: string | null;
  last_updated_at: string;

  // Relations
  mission?: Mission;
}

export interface MissionPeriodType {
  id: number;
  name: string; // 'daily', 'weekly', 'monthly'
  description: string;
}

export interface MissionMetricType {
  id: number;
  name: string; // 'login', 'video_watch', 'quiz_correct', 'boss_defeat', 'score'
  unit: string; // 'วัน', 'บท', 'ข้อ', 'ตัว', 'คะแนน'
  description: string;
}

// Combined type for UI display
export interface MissionWithProgress extends Mission {
  progress?: MissionProgress;
  progress_percentage: number;
  is_completed: boolean;
  current_value: number;
}

export interface RewardPageParams {
  missionId: string;
  energy?: string;
  xp?: string;
  coins?: string;
  navigationType?: "back" | "replace";
  returnPath?: string;
}
