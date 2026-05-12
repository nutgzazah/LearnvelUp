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
  id: number;
  user_id: string;
  course_id: number;
  enrolled_at?: string | null;
  progress_percent: number | null;
  is_completed: boolean | null;
};

// เพิ่ม function
export async function getUserEnrollmentsForPath(
  userId: string,
  courseIds: number[]
): Promise<UserEnrollment[]> {
  if (courseIds.length === 0) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select("id, user_id, course_id, enrolled_at, progress_percent, is_completed")
    .eq("user_id", userId)
    .in("course_id", courseIds);

  if (error) {
    console.log("getUserEnrollmentsForPath error:", error);
    throw error;
  }

  return (data ?? []) as UserEnrollment[];
}

// เพิ่ม function ดึง unlock status
export async function getUserLearningPathCourseStatuses(
  userId: string,
  learningPathId: number
) {
  const { data, error } = await supabase
    .from("user_learning_path_courses")
    .select(`
      learning_path_course_id,
      is_unlocked,
      is_completed,
      learning_path_courses!inner (
        learning_path_id
      )
    `)
    .eq("user_id", userId)
    .eq("learning_path_courses.learning_path_id", learningPathId);

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
  const { data: existing, error: checkError } = await supabase
    .from("user_learning_paths")
    .select("*")
    .eq("user_id", userId)
    .eq("learning_path_id", learningPathId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) return existing as UserLearningPath;

  // insert user_learning_paths เหมือนเดิม
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

  // เพิ่มตรงนี้: ดึง courses ทั้งหมดใน path แล้ว insert row ให้ครบ
  const { data: pathCourses } = await supabase
    .from("learning_path_courses")
    .select("id, sequence_order, unlock_type")
    .eq("learning_path_id", learningPathId)
    .order("sequence_order", { ascending: true });
  
  console.log("pathCourses:", pathCourses); // ← เพิ่มตรงนี้

  if (pathCourses && pathCourses.length > 0) {
    const rows = pathCourses.map((pc, index) => ({
      user_id: userId,
      learning_path_course_id: pc.id,
      // course แรก หรือ always_unlocked ให้ปลดล็อกทันที
      is_unlocked: index === 0 || pc.unlock_type === "always_unlocked",
      is_completed: false,
    }));

    console.log("rows to insert:", rows);

    const { error: insertError } = await supabase
    .from("user_learning_path_courses")
    .insert(rows);

    console.log("insert error:", insertError);
  }

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

export async function syncLearningPathProgressAfterCourseCompleted(
  userId: string,
  learningPathId: number,
  courseId: number
) {
  // 1. หา learning_path_course ของคอร์สที่จบ
  const { data: currentPathCourse, error: currentError } = await supabase
    .from("learning_path_courses")
    .select("id, sequence_order")
    .eq("learning_path_id", learningPathId)
    .eq("course_id", courseId)
    .single();

  if (currentError) throw currentError;
  if (!currentPathCourse) return;

  // 2. อัปเดตคอร์สปัจจุบันใน user_learning_path_courses ว่าเรียนจบแล้ว
  const { error: completeError } = await supabase
    .from("user_learning_path_courses")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("learning_path_course_id", currentPathCourse.id);

  if (completeError) throw completeError;

  // 3. หา course ถัดไปใน path
  const { data: nextPathCourse, error: nextError } = await supabase
    .from("learning_path_courses")
    .select("id, unlock_type")
    .eq("learning_path_id", learningPathId)
    .eq("sequence_order", currentPathCourse.sequence_order + 1)
    .maybeSingle();

  if (nextError) throw nextError;

  // ถ้าไม่มีคอร์สถัดไป แปลว่าจบ path แล้ว
  if (!nextPathCourse) {
    await updateLearningPathProgress(userId, learningPathId);
    return;
  }

  // 4. ปลดล็อกคอร์สถัดไป
  const { error: unlockError } = await supabase
    .from("user_learning_path_courses")
    .update({
      is_unlocked: true,
      unlocked_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("learning_path_course_id", nextPathCourse.id);

  if (unlockError) throw unlockError;

  // 5. อัปเดต progress รวมของ learning path
  await updateLearningPathProgress(userId, learningPathId);
}

export async function updateLearningPathProgress(
  userId: string,
  learningPathId: number
) {
  const { data: pathCourses, error } = await supabase
    .from("learning_path_courses")
    .select(`
      id,
      user_learning_path_courses (
        is_completed
      )
    `)
    .eq("learning_path_id", learningPathId);

  if (error) throw error;
  if (!pathCourses || pathCourses.length === 0) return;

  const total = pathCourses.length;

  const completed = pathCourses.filter((item: any) => {
    const userProgress = item.user_learning_path_courses?.[0];
    return userProgress?.is_completed === true;
  }).length;

  const progressPercent = Math.round((completed / total) * 100);

  const isCompleted = completed === total;

  const { error: updateError } = await supabase
    .from("user_learning_paths")
    .update({
      progress_percent: progressPercent,
      status: isCompleted ? "completed" : "in_progress",
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("user_id", userId)
    .eq("learning_path_id", learningPathId);

  if (updateError) throw updateError;
}