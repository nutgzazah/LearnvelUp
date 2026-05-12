import { supabase } from "@/src/lib/supabase";
import { MissionWithProgress } from "@/src/types/mission";

export async function getUserMissions(
  userId: string,
): Promise<MissionWithProgress[]> {
  const { data, error } = await supabase.rpc("get_user_missions", {
    p_user_id: userId,
  });

  if (error) {
    console.error("RPC get_user_missions Error:", error);
    throw error;
  }

  return (data || []).map((row: any) => {
    const progressRaw =
      row.target_value > 0 ? (row.current_value / row.target_value) * 100 : 0;
    const progressPercentage = Math.min(
      100,
      Math.max(0, Math.round(progressRaw)),
    );

    return {
      id: row.mission_id,
      mission_id: row.mission_id,
      name: row.name,
      description: row.description,
      current_value: row.current_value,
      target_value: row.target_value,
      progress_percentage: progressPercentage,
      is_completed: row.is_completed,
      is_claimed: row.is_claimed,
      status: row.is_claimed
        ? "claimed"
        : row.is_completed
          ? "completed"
          : "ongoing",
      completed_at: null,
      cycle_date: new Date().toISOString(),
      reward_energy: row.reward_energy,
      reward_xp: row.reward_xp,
      reward_coins: row.reward_coins,
      frequency: row.frequency, // daily, weekly, one_time
    };
  });
}

export const claimMissionReward = async (missionId: number, userId: string) => {
  const { data, error } = await supabase.rpc("claim_mission_reward", {
    p_mission_id: missionId,
    p_user_id: userId,
  });

  if (error) {
    console.error("RPC claim_mission_reward Error:", error);
    throw error;
  }

  return data;
};
