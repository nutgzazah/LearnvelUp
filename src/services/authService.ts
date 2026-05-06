import { supabase } from "@/src/lib/supabase";

/**
 * Fetch user profile from the profiles table
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, gender, birthdate, age_group, created_at, updated_at",
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.log("Profile fetch error:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    username?: string;
    gender?: "male" | "female" | "other";
    birthdate?: string;
    age_group?: "high_school" | "university" | "working" | "general";
    equipped_avatar_id?: number;
  },
) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.log("Profile update error:", error.message);
      throw new Error("ไม่สามารถอัปเดตโปรไฟล์ได้");
    }

    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * Check if user profile is complete (has all required fields)
 */
export const isProfileComplete = (profile: any): boolean => {
  if (!profile) return false;

  return (
    profile.username && profile.gender && profile.birthdate && profile.age_group
  );
};

/**
 * Fetch user stats
 */
export const fetchUserStats = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.log("Stats fetch error:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
};

/**
 * Fetch user energy
 */
export const fetchUserEnergy = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_energy")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.log("Energy fetch error:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching energy:", error);
    return null;
  }
};

export const checkUsernameAvailable = async (
  username: string,
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("check_username_available", {
      requested_username: username,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error checking username:", error);
    throw error;
  }
};

/**
 * verify user session on the server side
 */
export const verifyServerSession = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { isValid: !error && !!data.user };
  } catch (error) {
    return { isValid: false };
  }
};

/**
 * Get current logged in user with their Profile and Avatar
 */
export const getCurrentUserWithAvatar = async () => {
  try {
    // 1. ดึงข้อมูล User ที่กำลังล็อกอินอยู่
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return null;

    // 2. ดึงข้อมูล Profile และ รูป Avatar จากตาราง items
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "username, avatar:items!profiles_equipped_avatar_id_fkey(image_url)",
      )
      .eq("id", user.id)
      .single();

    if (profileError) return null;

    // 3. จัดรูปส่งกลับไปให้หน้าบ้านใช้ง่ายๆ
    return {
      id: user.id,
      username: profile.username || "Me",
      avatar_url: profile.avatar?.image_url || null,
    };
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return null;
  }
};
