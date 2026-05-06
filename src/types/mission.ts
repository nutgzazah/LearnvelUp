export type MissionFrequency = "daily" | "weekly" | "monthly";
export type MissionStatus = "ongoing" | "completed" | "claimed";

export interface Mission {
  id: number;
  title: string;
  description: string | null;
  frequency: MissionFrequency;
  target_value: number;
  reward_energy: number | null;
  reward_xp: number | null;
  reward_coins: number | null;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
  created_at: string | null;
}

export interface UserMission {
  id: number;
  mission_id: number | null;
  user_id: string | null;
  current_progress: number;
  status: MissionStatus;
  completed_at: string | null;
  cycle_date: string | null;

  mission?: Mission;
}

export interface MissionWithProgress {
  id: number; // user_missions.id
  mission_id: number;

  name: string; // map มาจาก missions.title
  description: string | null;

  current_value: number;
  target_value: number;
  progress_percentage: number;
  is_completed: boolean;
  is_claimed: boolean;

  status: MissionStatus;
  completed_at: string | null;
  cycle_date: string | null;

  reward_energy: number;
  reward_xp: number;
  reward_coins: number;

  frequency: MissionFrequency;
}

export interface RewardPageParams {
  missionId: string;
  missionName?: string;
  energy?: string;
  xp?: string;
  coins?: string;
  navigationType?: "back" | "replace";
  returnPath?: string;
}
