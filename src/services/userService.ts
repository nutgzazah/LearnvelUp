import { supabase } from "@/src/lib/supabase";

/**
 * Save user interests (selected categories) to the database
 */
export const saveUserInterests = async (
  userId: string,
  categoryIds: number[],
) => {
  const MAX_INTERESTS = 3;

  if (categoryIds.length > MAX_INTERESTS) {
    throw new Error(
      `ไม่สามารถบันทึกได้: เลือกความสนใจเกิน ${MAX_INTERESTS} หมวดหมู่`,
    );
  }

  try {
    // Delete existing interests for the user before inserting new ones
    const { error: deleteError } = await supabase
      .from("user_interests")
      .delete()
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // Prepare data for insertion
    const interests = categoryIds.map((id) => ({
      user_id: userId,
      category_id: id,
    }));

    const { error: insertError } = await supabase
      .from("user_interests")
      .insert(interests);

    if (insertError) throw insertError;

    return { success: true };
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

export async function fetchProfileUsername(
  userId: string,
): Promise<string | null> {
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
export const fetchUserStats = async (userId: string) => {
  if (!userId) throw new Error("No user ID provided");

  try {
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select(
        "level, coins, current_streak, last_activity_date, welcome_bonus_claimed",
      )
      .eq("user_id", userId)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching user_stats:", statsError);
    }

    const { data: currentEnergy, error: energyError } = await supabase.rpc(
      "get_current_energy",
      { p_user_id: userId },
    );

    if (energyError) {
      console.error("Error fetching user_energy via RPC:", energyError);
    }

    return {
      level: statsData?.level || 0,
      coins: statsData?.coins || 0,
      streak: statsData?.current_streak || 0,
      energy: typeof currentEnergy === "number" ? currentEnergy : 20,
      last_activity_date: statsData?.last_activity_date || null,
      welcome_bonus_claimed: statsData?.welcome_bonus_claimed ?? false,
    };
  } catch (err) {
    console.error("fetchUserStats unexpected error:", err);
    return {
      level: 0,
      coins: 0,
      streak: 0,
      energy: 20,
      welcome_bonus_claimed: false,
    };
  }
};

export const claimWelcomeBonus = async (userId: string) => {
  if (!userId) throw new Error("No user ID provided");

  try {
    const { data, error } = await supabase.rpc("claim_welcome_bonus", {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error claiming welcome bonus:", error);
    throw error;
  }
};
