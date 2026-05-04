import { supabase } from "@/src/lib/supabase";

export type LearningPath = {
  id: number;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  category_id: number | null;
  sub_category_id: number | null;
  status: "draft" | "published" | "archived";
  created_at: string | null;
  updated_at: string | null;
  course_count: number;
};

export async function getLearningPaths(): Promise<LearningPath[]> {
  const { data, error } = await supabase
    .from("learning_paths")
    .select(
      `
      id, title, description, cover_image_url,
      category_id, sub_category_id, status,
      created_at, updated_at,
      learning_path_courses(count)
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    course_count: item.learning_path_courses?.[0]?.count ?? 0,
  })) as LearningPath[];
}

export async function getLearningPathById(id: number): Promise<LearningPath | null> {
  const { data, error } = await supabase
    .from("learning_paths")
    .select(
      `
      id,
      title,
      description,
      cover_image_url,
      category_id,
      sub_category_id,
      status,
      created_at,
      updated_at
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export type LearningPathCourseItem = {
  id: number;
  learning_path_id: number;
  course_id: number;
  sequence_order: number;
  is_required: boolean;
  unlock_type: "always_unlocked" | "previous_completed" | "manual";
  created_at: string | null;
  course: {
    id: number;
    title: string;
    cover_image_url: string | null;
    price_coins: number | null;
    instructors?: {
      avatar_url: string | null;
    } | null;
  } | null;
};

export async function getLearningPathCourses(
  learningPathId: number
): Promise<LearningPathCourseItem[]> {
  const { data, error } = await supabase
    .from("learning_path_courses")
    .select(
      `
      id,
      learning_path_id,
      course_id,
      sequence_order,
      is_required,
      unlock_type,
      created_at,
      course:courses (
        id,
        title,
        cover_image_url,
        price_coins,
        instructors (
          avatar_url
        )
      )
    `
    )
    .eq("learning_path_id", learningPathId)
    .order("sequence_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as LearningPathCourseItem[];
}

// เพิ่ม type
export type UserEnrollment = {
  course_id: number;
  is_completed: boolean;
};

// เพิ่ม function
export async function getUserEnrollmentsForPath(
  userId: string,
  courseIds: number[]
): Promise<UserEnrollment[]> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id, is_completed")
    .eq("user_id", userId)
    .in("course_id", courseIds);

  if (error) throw error;
  return data as any?? [];
}

// เพิ่ม function ดึง unlock status
export async function getUserLearningPathCourseStatuses(
  userId: string,
  learningPathId: number
): Promise<{ learning_path_course_id: number; is_unlocked: boolean; is_completed: boolean }[]> {
  const { data, error } = await supabase
    .from("user_learning_path_courses")
    .select("learning_path_course_id, is_unlocked, is_completed")
    .eq("user_id", userId);

  if (error) throw error;
  return data ?? [];
}

export type UserLearningPath = {
  id: number;
  user_id: string;
  learning_path_id: number;
  status: string;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
};

export async function enrollUserInLearningPath(
  userId: string,
  learningPathId: number
): Promise<UserLearningPath> {
  // เช็คก่อนว่า user ลงทะเบียน learning path นี้ไปแล้วหรือยัง
  const { data: existing, error: checkError } = await supabase
    .from("user_learning_paths")
    .select("*")
    .eq("user_id", userId)
    .eq("learning_path_id", learningPathId)
    .maybeSingle();

  if (checkError) throw checkError;

  // ถ้ามีอยู่แล้ว return ข้อมูลเดิมได้เลย
  if (existing) return existing as UserLearningPath;

  // ถ้ายังไม่มี ให้ insert ใหม่
  const { data, error } = await supabase
    .from("user_learning_paths")
    .insert({
      user_id: userId,
      learning_path_id: learningPathId,
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as UserLearningPath;
}

export async function getUserEnrolledLearningPaths(
  userId: string
): Promise<(UserLearningPath & { learning_path: LearningPath & { course_count: number } })[]> {
  const { data, error } = await supabase
    .from("user_learning_paths")
    .select(`
      id,
      user_id,
      learning_path_id,
      status,
      progress_percent,
      started_at,
      completed_at,
      learning_path:learning_paths (
        id,
        title,
        description,
        cover_image_url,
        category_id,
        sub_category_id,
        status,
        created_at,
        updated_at,
        learning_path_courses(count)
      )
    `)
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    learning_path: {
      ...item.learning_path,
      course_count: (item.learning_path as any)?.learning_path_courses?.[0]?.count ?? 0,
    },
  })) as any;
}