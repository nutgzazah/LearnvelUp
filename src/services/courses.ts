import { supabase } from "../lib/supabase";

// ==========================================
// 1. ดึงข้อมูลคอร์สเรียนทั้งหมด (ที่เปิดขายแล้ว) สำหรับหน้า Home / Store
// ==========================================
export const fetchPublishedCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      cover_image_url,
      price_coins,
      total_enrolled,
      status,
      created_at,
      instructor:instructors ( id, first_name, last_name, avatar_url ),
      category:categories!courses_category_id_fkey ( id, name )
    `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

// ==========================================
// 2. ดึงรายละเอียดคอร์สแบบเจาะจง (พร้อมสารบัญบทเรียน)
// ==========================================
export const fetchCourseById = async (courseId: number) => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      learning_outcome,
      cover_image_url,
      price_coins,
      status,
      total_enrolled,
      instructor:instructors ( id, first_name, last_name, job_title, bio, avatar_url ),
      category:categories!courses_category_id_fkey ( id, name ),
      sub_category:categories!courses_sub_category_id_fkey ( id, name ),
      chapters (
        id,
        title,
        duration_seconds,
        sequence_order,
        energy_cost_per_question,
        reward_xp,
        reward_coins
      )
    `,
    )
    .eq("id", courseId)
    .single();

  if (error) throw new Error(error.message);

  // เรียงลำดับบทเรียนตาม sequence_order ให้ชัวร์ๆ
  if (data?.chapters) {
    data.chapters.sort((a, b) => a.sequence_order - b.sequence_order);
  }

  return data;
};

// ==========================================
// 3. ดึงคอร์สที่ User ลงทะเบียนเรียนไว้ (My Courses)
// ==========================================
export const fetchMyEnrolledCourses = async (userId: string) => {
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      progress_percent,
      is_completed,
      enrolled_at,
      course:courses (
        id,
        title,
        cover_image_url,
        category:categories!courses_category_id_fkey ( name ),
        instructor:instructors ( first_name, last_name )
      )
    `,
    )
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};
