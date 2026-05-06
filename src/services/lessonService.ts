import { supabase } from "@/src/lib/supabase";

// ดึงข้อมูลตอนเรียนและอาจารย์ผู้สอน
export const getChapterWithInstructor = async (chapterId: string | number) => {
  const { data, error } = await supabase
    .from("chapters")
    .select(
      `
      id, title, video_url, duration_seconds,
      courses (
        instructors ( id, username, avatar_url )
      )
    `,
    )
    .eq("id", Number(chapterId))
    .single();

  if (error) throw error;
  return data;
};

export const getChapterComments = async (chapterId: string | number) => {
  // ✨ เปลี่ยนจาก .from("comments") มาใช้ .rpc() แทน
  const { data, error } = await supabase.rpc("get_chapter_comments_secure", {
    p_chapter_id: Number(chapterId),
  });

  if (error) throw error;
  return data;
};

// ✨ สร้างคอมเมนต์ใหม่ (มีการตรวจสอบว่าถ้าตอบกลับ ต้องเป็นกระทู้ของตัวเองเท่านั้น)
export const createComment = async (
  chapterId: number,
  userId: string,
  content: string,
  parentId: number | null = null,
) => {
  // 1. ตรวจสอบสิทธิ์ฝั่ง API ก่อนเพิ่มลง Database (ป้องกันการยิง API ตรงๆ)
  if (parentId) {
    const { data: parentComment, error: parentError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", parentId)
      .single();

    if (parentError || !parentComment) {
      throw new Error("ไม่พบคอมเมนต์หลักที่ต้องการตอบกลับ");
    }

    // ✨ ถ้ากระทู้หลักไม่ได้เป็นของคนที่ล็อกอินอยู่ ให้บล็อกการตอบกลับทันที!
    if (parentComment.user_id !== userId) {
      throw new Error("ไม่อนุญาตให้ตอบกลับในกระทู้คอมเมนต์ของผู้อื่น");
    }
  }

  // 2. ถ้าผ่านด่านการตรวจสอบ ค่อยบันทึกลง Database
  const { data, error } = await supabase
    .from("comments")
    .insert({
      chapter_id: chapterId,
      user_id: userId,
      content: content,
      parent_id: parentId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// ✨ ลบคอมเมนต์ (ลบแค่ตัวแม่ แล้วเดี๋ยว Database จัดการลูกให้เอง)
export const deleteCommentById = async (commentId: number) => {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId); // สั่งลบแค่บรรทัดที่ต้องการจบเลย

  if (error) throw error;
  return true;
};
