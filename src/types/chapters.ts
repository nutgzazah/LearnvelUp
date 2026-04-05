export type Chapter = {
  id: number;
  course_id: number;
  title: string;
  video_url?: string | null;
  duration_seconds?: number | null;
  sequence_order: number;
  energy_cost_per_question: number;
  quiz_pass_score: number;
  reward_energy?: number | null;
  reward_xp?: number | null;
  reward_coins?: number | null;
};