import { supabase } from "@/src/lib/supabase";

export interface Achievement {
  id: number;
  name: string;
  detail: string;
  image?: any;
  progress: number;
  condition_value: number;
  is_completed: boolean;
  is_claimed: boolean;
  is_equipped: boolean;
}

export async function fetchAchievements(
  userId: string,
): Promise<Achievement[]> {
  const { data, error } = await supabase.rpc("get_user_achievements", {
    p_user_id: userId,
  });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    detail: row.description || "",
    image: row.image_url ? { uri: row.image_url } : undefined,
    progress: Math.min(row.current_progress, row.condition_value),
    condition_value: row.condition_value,
    is_completed: row.is_completed,
    is_claimed: row.is_claimed,
    is_equipped: row.is_equipped,
  }));
}

export async function equipBadge(userId: string, badgeId: number) {
  const { data, error } = await supabase.rpc("equip_user_badge", {
    p_user_id: userId,
    p_badge_id: badgeId,
  });

  if (error) throw error;

  const result = data as any;
  if (result && !result.success) {
    throw new Error(result.message);
  }
}

export async function unequipBadge(userId: string, badgeId: number) {
  const { error } = await supabase
    .from("user_badges")
    .update({ is_equipped: false })
    .eq("user_id", userId)
    .eq("badge_id", badgeId);

  if (error) throw error;
}

export async function fetchEquippedBadges(userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select(`badge_id, is_equipped, badges (id, name, image_url)`)
    .eq("user_id", userId)
    .eq("is_equipped", true);

  if (error) throw error;

  return (data ?? []).map((item: any) => ({
    id: item.badges.id,
    name: item.badges.name,
    image_url: item.badges.image_url,
    is_equipped: item.is_equipped,
  }));
}
