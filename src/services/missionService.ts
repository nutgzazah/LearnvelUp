import { supabase } from "@/src/lib/supabase";
import {
  MissionFrequency,
  MissionStatus,
  MissionWithProgress,
} from "@/src/types/mission";

type UserMissionRow = {
  id: number;
  current_progress: number | null;
  status: MissionStatus | null;
  completed_at: string | null;
  cycle_date: string | null;
  mission_id: number | null;
  missions: {
    id: number;
    title: string;
    description: string | null;
    target_value: number;
    reward_coins: number | null;
    reward_energy: number | null;
    reward_xp: number | null;
    is_active: boolean;
    frequency: MissionFrequency;
    start_at: string | null;
    end_at: string | null;
  } | null;
};

type MissionTemplateRow = {
  id: number;
  title: string;
  description: string | null;
  target_value: number;
  reward_coins: number | null;
  reward_energy: number | null;
  reward_xp: number | null;
  is_active: boolean;
  frequency: MissionFrequency;
  start_at: string | null;
  end_at: string | null;
};

type MissionRow = {
  id: number;
  current_progress: number | null;
  status: MissionStatus;
  completed_at: string | null;
  cycle_date: string | null;
  mission_id: number | null;
  missions: {
    id: number;
    title: string;
    description: string | null;
    target_value: number;
    reward_energy: number | null;
    reward_xp: number | null;
    reward_coins: number | null;
    frequency: "daily" | "weekly" | "monthly";
  } | null;
};

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDateTimeRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return {
    startOfDay: `${year}-${month}-${day}T00:00:00`,
    endOfDay: `${year}-${month}-${day}T23:59:59`,
  };
};

export async function ensureTodayUserMissions(userId: string): Promise<void> {
  const today = getTodayDate();
  const { startOfDay, endOfDay } = getTodayDateTimeRange();

  // 1) ดึง mission template ที่ active และเป็น daily
  const { data: templates, error: templateError } = await supabase
    .from("missions")
    .select(`
      id,
      title,
      description,
      target_value,
      reward_coins,
      reward_energy,
      reward_xp,
      is_active,
      frequency,
      start_at,
      end_at
    `)
    .eq("is_active", true)
    .eq("frequency", "daily")
    .or(
      `start_at.is.null,start_at.lte.${endOfDay}`
    )
    .or(
      `end_at.is.null,end_at.gte.${startOfDay}`
    )
    .order("id", { ascending: true });

  if (templateError) {
    throw templateError;
  }

  const missionTemplates = (templates ?? []) as MissionTemplateRow[];

  if (missionTemplates.length === 0) {
    return;
  }

  // 2) ดึง user_missions ของวันนี้ที่มีอยู่แล้ว
  const { data: existingRows, error: existingError } = await supabase
    .from("user_missions")
    .select("mission_id")
    .eq("user_id", userId)
    .eq("cycle_date", today);

  if (existingError) {
    throw existingError;
  }

  const existingMissionIds = new Set(
    (existingRows ?? [])
      .map((row) => row.mission_id)
      .filter((id): id is number => typeof id === "number")
  );

  // 3) เลือกเฉพาะ mission ที่ยังไม่มีใน user_missions วันนี้
  const rowsToInsert = missionTemplates
    .filter((mission) => !existingMissionIds.has(mission.id))
    .map((mission) => ({
      user_id: userId,
      mission_id: mission.id,
      current_progress: 0,
      status: "ongoing" as MissionStatus,
      completed_at: null,
      cycle_date: today,
    }));

  if (rowsToInsert.length === 0) {
    return;
  }

  // 4) insert เพิ่มเฉพาะที่ยังไม่มี
  const { error: insertError } = await supabase
  .from("user_missions")
  .upsert(rowsToInsert, {
    onConflict: "user_id,mission_id,cycle_date",
    ignoreDuplicates: true,
  });

  if (insertError) {
    throw insertError;
  }
}

export async function getUserDailyMissions(
  userId: string
): Promise<MissionWithProgress[]> {
  const today = getTodayDate();

  const { data, error } = await supabase
    .from("user_missions")
    .select(`
      id,
      current_progress,
      status,
      completed_at,
      cycle_date,
      mission_id,
      missions!inner (
        id,
        title,
        description,
        target_value,
        reward_coins,
        reward_energy,
        reward_xp,
        is_active,
        frequency,
        start_at,
        end_at
      )
    `)
    .eq("user_id", userId)
    .eq("cycle_date", today)
    .eq("missions.is_active", true)
    .eq("missions.frequency", "daily")
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as UserMissionRow[];

  return rows
    .filter((row) => row.missions)
    .map((row) => {
      const mission = row.missions!;
      const currentValue = row.current_progress ?? 0;
      const targetValue = mission.target_value ?? 0;

      const progressPercentage =
        targetValue > 0
          ? Math.min(Math.round((currentValue / targetValue) * 100), 100)
          : 0;

      const isCompleted =
        row.status === "completed" || row.status === "claimed" || currentValue >= targetValue;
      
      const isClaimed = row.status === "claimed";

      return {
        id: row.id,
        mission_id: mission.id,
        name: mission.title,
        description: mission.description,

        current_value: currentValue,
        target_value: targetValue,
        progress_percentage: progressPercentage,
        is_completed: isCompleted,
        is_claimed: isClaimed,

        status: row.status ?? "ongoing",
        completed_at: row.completed_at,
        cycle_date: row.cycle_date,

        reward_coins: mission.reward_coins ?? 0,
        reward_energy: mission.reward_energy ?? 0,
        reward_xp: mission.reward_xp ?? 0,

        frequency: mission.frequency,
      };
    });
}

export async function fetchUserMissions(
  userId: string
): Promise<MissionWithProgress[]> {
  const { data, error } = await supabase
    .from("user_missions")
    .select(`
      id,
      current_progress,
      status,
      completed_at,
      cycle_date,
      mission_id,
      missions (
        id,
        title,
        description,
        target_value,
        reward_energy,
        reward_xp,
        reward_coins,
        frequency
      )
    `)
    .eq("user_id", userId)
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as MissionRow[];

  return rows
    .filter((row) => row.missions && row.mission_id)
    .map((row) => {
      const mission = row.missions!;
      const currentValue = row.current_progress ?? 0;
      const targetValue = mission.target_value ?? 0;

      const progressRaw =
        targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

      const progressPercentage = Math.min(100, Math.max(0, Math.round(progressRaw)));

      const isCompleted = row.status === "completed" || row.status === "claimed";
      const isClaimed = row.status === "claimed";

      return {
        id: row.id, // user_missions.id
        mission_id: row.mission_id!,
        name: mission.title,
        description: mission.description,

        current_value: currentValue,
        target_value: targetValue,
        progress_percentage: progressPercentage,
        is_completed: isCompleted,
        is_claimed: isClaimed,

        status: row.status,
        completed_at: row.completed_at,
        cycle_date: row.cycle_date,

        reward_energy: mission.reward_energy ?? 0,
        reward_xp: mission.reward_xp ?? 0,
        reward_coins: mission.reward_coins ?? 0,

        frequency: mission.frequency,
      };
    });
}

export async function claimMissionReward(userMissionId: number, userId: string) {
  const { data, error } = await supabase.rpc("claim_mission_reward" as any, {
    p_user_mission_id: userMissionId,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return data;
}