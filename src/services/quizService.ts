import { supabase } from "@/src/lib/supabase";

/**
 * ดึงข้อมูล Chapter เพื่อเอาหลอดเลือดบอส (quiz_pass_score) และค่า Energy
 */
export const getChapterQuizInfo = async (chapterId: number) => {
  const { data, error } = await supabase
    .from("chapters")
    // ✨ เพิ่ม course_id เข้าไปในบรรทัดนี้ครับ
    .select(
      "id, course_id, title, quiz_pass_score, energy_cost_per_question, reward_energy, reward_xp, reward_coins",
    )
    .eq("id", chapterId)
    .single();

  if (error) {
    console.error("Error fetching chapter quiz info:", error);
    throw error;
  }
  return data;
};

/**
 * ดึงคำถามทั้งหมดพร้อมตัวเลือกของ Chapter นั้น
 */
export const getQuestionsWithAnswers = async (chapterId: number) => {
  const { data, error } = await supabase
    .from("questions")
    .select(
      `
      id,
      question_text,
      points,
      answers (
        id,
        answer_text,
        is_correct
      )
    `,
    )
    .eq("chapter_id", chapterId)
    .order("sequence_order", { ascending: true });

  if (error) {
    console.error("Error fetching questions and answers:", error);
    throw error;
  }
  return data;
};

/**
 * ฟังก์ชันสำหรับหัก Energy (ใช้ RPC ป้องกัน Race Condition)
 */
export const deductUserEnergy = async (userId: string, cost: number) => {
  if (!userId || cost <= 0) return;

  // ✨ เรียกใช้ RPC ที่เราเพิ่งสร้าง
  const { error } = await supabase.rpc("deduct_user_energy", {
    p_user_id: userId,
    p_cost: cost,
  });

  if (error) {
    console.error("Error in RPC deduct_user_energy:", error);
  }
};

/**
 * ฟังก์ชันสำหรับจบเกมชนะ (ใช้ RPC อัปเดตตาราง Progress และ Stats พร้อมกัน)
 */
export const completeQuizAndGiveRewards = async (
  userId: string,
  chapterId: number,
  rewards: { xp: number; coins: number; energy: number },
) => {
  if (!userId || !chapterId) return null;

  const { data, error } = await supabase.rpc("process_quiz_victory", {
    p_user_id: userId,
    p_chapter_id: chapterId,
    p_xp: rewards.xp,
    p_coins: rewards.coins,
    p_energy: rewards.energy,
  });

  if (error) {
    console.error("Error in RPC process_quiz_victory:", error);
    throw error;
  }

  return data; // ✨ ส่ง json ที่สุ่มเสร็จแล้วจาก RPC กลับไปให้หน้าแอป
};
