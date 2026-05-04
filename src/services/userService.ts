import { supabase } from "@/src/lib/supabase";

/**
 * Save user interests (selected categories) to the database
 */
export const saveUserInterests = async (
  userId: string,
  categoryIds: number[],
) => {
  try {
    const interestsData = categoryIds.map((categoryId) => ({
      user_id: userId,
      category_id: categoryId,
    }));

    const { error } = await supabase
      .from("user_interests")
      .insert(interestsData);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving user interests:", error);
    throw error;
  }
};

export const fetchUserEquippedAvatar = async (): Promise<number | null> => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("equipped_avatar_id")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return data?.equipped_avatar_id ?? null;
  } catch (error) {
    console.error("fetchUserEquippedAvatar error:", error);
    return null;
  }
};

export async function fetchProfileUsername(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("fetchProfileUsername error:", error.message);
    throw error;
  }

  return data?.username ?? null;
}

export type UserStats = {
  level: number;
  current_streak: number | null;
  coins: number;
};

export async function fetchUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from("user_stats")
    .select("level, current_streak, coins")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("fetchUserStats error:", error.message);
    throw error;
  }

  if (!data) return null;

  return {
    level: data.level ?? 0,
    current_streak: data.current_streak ?? 0,
    coins: data.coins ?? 0,
  };
}

import { fetchItemImageUrl } from "@/src/services/itemService";

export async function fetchUserEquippedBackground(): Promise<number | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) throw authError;
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("equipped_frame_id")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    return data?.equipped_frame_id ?? null;
  } catch (error) {
    console.error("fetchUserEquippedBackground error:", error);
    return null;
  }
}

export async function fetchUserEquippedBackgroundUrl(): Promise<string | null> {
  try {
    const backgroundId = await fetchUserEquippedBackground();
    if (!backgroundId) return null;

    const imageUrl = await fetchItemImageUrl(backgroundId);
    return imageUrl;
  } catch (error) {
    console.error("fetchUserEquippedBackgroundUrl error:", error);
    return null;
  }
}