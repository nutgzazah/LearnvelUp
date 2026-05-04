import { supabase } from "@/src/lib/supabase";
import type { ImageSourcePropType } from "react-native";

export type Achievement = {
  id: number;
  name: string;
  detail: string;
  image?: ImageSourcePropType;
  progress: number;
  condition_value: number;
  is_completed: boolean;
  is_claimed: boolean;
  is_equipped: boolean;
};

type BadgeRow = {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  condition_value: number | null;
};

type UserBadgeRow = {
  badge_id: number;
  user_id: string;
  is_equipped: boolean;
};

export async function fetchAchievements(userId: string): Promise<Achievement[]> {
  const { data: badges, error: badgesError } = await supabase
    .from("badges")
    .select("id, name, description, image_url, condition_value")
    .order("id", { ascending: true });

  if (badgesError) {
    throw badgesError;
  }

  const { data: userBadges, error: userBadgesError } = await supabase
    .from("user_badges")
    .select("badge_id, user_id, is_equipped")
    .eq("user_id", userId);

  if (userBadgesError) {
    throw userBadgesError;
  }

  const userBadgeRows = (userBadges as UserBadgeRow[] | null) ?? [];

  const claimedBadgeIds = new Set(userBadgeRows.map((item) => item.badge_id));

  const equippedBadgeIds = new Set(
    userBadgeRows
      .filter((item) => item.is_equipped)
      .map((item) => item.badge_id)
  );

  return ((badges as BadgeRow[] | null) ?? []).map((badge) => ({
    id: badge.id,
    name: badge.name,
    detail: badge.description ?? "",
    image: badge.image_url ? { uri: badge.image_url } : undefined,
    progress: 0,
    condition_value: badge.condition_value ?? 0,
    is_completed: false,
    is_claimed: claimedBadgeIds.has(badge.id),
    is_equipped: equippedBadgeIds.has(badge.id),
  }));
}

export async function equipBadge(userId: string, badgeId: number) {
  const { error } = await supabase
    .from("user_badges")
    .update({ is_equipped: true })
    .eq("user_id", userId)
    .eq("badge_id", badgeId);

  if (error) throw error;
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
    .select(`
      badge_id,
      is_equipped,
      badges (
        id,
        name,
        image_url
      )
    `)
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