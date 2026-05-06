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

export const fetchUserStats = async (userId: string) => {
  if (!userId) throw new Error("No user ID provided");

  try {
    // 1. ดึง เหรียญ และ เปลวไฟ จากตาราง user_stats (เหมือนเดิม)
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("coins, current_streak")
      .eq("user_id", userId)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching user_stats:", statsError);
    }

    // ✨ 2. ดึง พลังงาน โดยใช้ RPC get_current_energy แทน (เพื่อให้มันคำนวณและรีชาร์จให้อัตโนมัติ)
    // หมายเหตุ: ต้องไปสร้าง RPC ใน Supabase ตามที่คุยกันไปก่อนหน้านี้ด้วยนะครับ
    const { data: currentEnergy, error: energyError } = await supabase.rpc(
      "get_current_energy",
      { p_user_id: userId },
    );

    if (energyError) {
      console.error("Error fetching user_energy via RPC:", energyError);
    }

    // ส่งคืนข้อมูลที่จัดเป็นก้อนเดียวกัน
    return {
      coins: statsData?.coins || 0,
      streak: statsData?.current_streak || 0,
      // ถ้าไม่ได้ค่ากลับมา (เช่น rpc error หรือ user ใหม่มากๆ) ก็ให้ค่าเริ่มต้นเป็น 20
      energy: typeof currentEnergy === "number" ? currentEnergy : 20,
    };
  } catch (err) {
    console.error("fetchUserStats unexpected error:", err);
    // คืนค่า default ป้องกันแอปพัง
    return { coins: 0, streak: 0, energy: 20 };
  }
};
