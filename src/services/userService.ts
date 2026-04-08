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

/**
 * Get the currently equipped avatar ID for a user from their profile
 */
export const fetchUserEquippedAvatar = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("equipped_avatar_id")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data?.equipped_avatar_id || null;
  } catch (error) {
    console.error("Error fetching equipped avatar:", error);
    return null;
  }
};
