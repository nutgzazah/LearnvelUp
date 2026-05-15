import { supabase } from "@/src/lib/supabase";

export const setUatStreakToThree = async (userId: string) => {
  if (!userId) throw new Error("No user ID provided");

  try {
    const { data, error } = await supabase.rpc("uat_set_streak_to_three", {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error setting UAT streak:", error);
    throw error;
  }
};
