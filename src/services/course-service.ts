import { supabase } from "../lib/supabase";
import { Categories } from "../types/categories";
import { Course } from "../types/course";
import type { TablesInsert } from "../types/database.types";
import { Instructor } from "../types/instructor";

export const getPublishedCoursesWithFilter = async (options?: {
  limit?: number;
  orderBy?: "created_at" | "total_enrolled";
  categoryId?: number;
}) => {
  let query = supabase
    .from("courses")
    .select(
      `
      id, title, category_id, sub_category_1_id, cover_image_url, price_coins, status, created_at, total_enrolled,
      instructors (id, username, avatar_url)
    `,
    )
    .eq("status", "published");

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }

  if (options?.orderBy === "total_enrolled") {
    query = query.order("total_enrolled", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((course: any) => ({
    ...course,
    instructors: Array.isArray(course.instructors)
      ? course.instructors[0] || null
      : course.instructors || null,
  }));
};

// ✨ ฟังก์ชันรวบยอดสำหรับดึงข้อมูลหน้า Home (ใช้ตัวเดียวจบ)
export const getHomeCoursesData = async (userId: string | null) => {
  // 1. คอร์สใหม่ล่าสุด (6 คอร์ส)
  const newestCourses = await getPublishedCoursesWithFilter({
    limit: 6,
    orderBy: "created_at",
  });

  // 2. คอร์สยอดนิยม (6 คอร์ส)
  const popularCourses = await getPublishedCoursesWithFilter({
    limit: 6,
    orderBy: "total_enrolled",
  });

  // 3. ดึงหมวดหมู่ (ดึงจากความสนใจผู้ใช้ก่อน)
  let targetCategoryIds: number[] = [];
  if (userId) {
    const { data: interests } = await supabase
      .from("user_interests")
      .select("category_id")
      .eq("user_id", userId)
      .limit(3);
    if (interests) targetCategoryIds = interests.map((i: any) => i.category_id);
  }

  // ถ้ายังเลือกความสนใจไม่ถึง 3 หมวด ให้สุ่มหมวดหมู่อื่นมาเติมให้เต็ม
  if (targetCategoryIds.length < 3) {
    const { data: randomCats } = await supabase
      .from("categories")
      .select("id")
      .limit(5);
    const missing = 3 - targetCategoryIds.length;
    const additional = (randomCats || [])
      .filter((c: any) => !targetCategoryIds.includes(c.id))
      .slice(0, missing)
      .map((c: any) => c.id);
    targetCategoryIds = [...targetCategoryIds, ...additional];
  }

  // ดึงชื่อหมวดหมู่
  const { data: catNamesData } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", targetCategoryIds);

  // ดึงคอร์ส 4 อันดับแรกของแต่ละหมวดหมู่
  const categorySections = await Promise.all(
    targetCategoryIds.map(async (catId) => {
      const catName =
        catNamesData?.find((c: any) => c.id === catId)?.name || "หมวดหมู่";
      const courses = await getPublishedCoursesWithFilter({
        limit: 4,
        categoryId: catId,
      });

      // แมปข้อมูลให้ตรงกับที่ CourseHorizontalList ต้องการ (ป้องกัน error type)
      const mappedCourses = courses.map((c: any) => ({
        id: c.id,
        title: c.title,
        categories: [catName],
        thumbnail: c.cover_image_url || "https://via.placeholder.com/150",
        price_coin: c.price_coins || 0,
      }));

      return {
        categoryId: catId,
        categoryName: catName,
        courses: mappedCourses,
      };
    }),
  );

  return { newestCourses, popularCourses, categorySections };
};

export const getPublishedCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      category_id,
      sub_category_1_id,
      cover_image_url,
      price_coins,
      status,
      created_at,
      instructors (
        id,
        username,
        avatar_url
      )
    `,
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedCourses error:", error.message);
    throw error;
  }

  const formatted: Course[] = (data || []).map((course: any) => ({
    ...course,
    instructors: Array.isArray(course.instructors)
      ? course.instructors[0] || null
      : course.instructors || null,
  }));

  return formatted;
};

export const getCategories = async (): Promise<Categories[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("id", { ascending: true });

  if (error) {
    console.error("getCategories error:", error.message);
    throw error;
  }

  return data || [];
};

export const getCourseById = async (id: number): Promise<Course | null> => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      category_id,
      sub_category_1_id,
      sub_category_2_id,
      description,
      learning_outcome,
      cover_image_url,
      price_coins,
      total_enrolled,
      created_at,
      instructors (
        id,
        username,
        avatar_url
      ),
      chapters (
        id,
        course_id,
        title,
        video_url,
        duration_seconds,
        sequence_order,
        energy_cost_per_question,
        quiz_pass_score,
        reward_energy,
        reward_xp,
        reward_coins
      )
    `,
    )
    .eq("id", id)
    .order("sequence_order", { foreignTable: "chapters", ascending: true })
    .single();

  if (error) {
    console.error("getCourseById error:", error.message);
    throw error;
  }

  if (!data) return null;

  const formatted: Course = {
    ...data,
    instructors: Array.isArray(data.instructors)
      ? data.instructors[0] || null
      : data.instructors || null,
  };

  return formatted;
};

export const getInstructorById = async (
  id: number,
): Promise<Instructor | null> => {
  const { data, error } = await supabase
    .from("instructors")
    .select(
      `
      id,
      username,
      email,
      bio,
      avatar_url
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("getInstructorById error:", error.message);
    throw error;
  }

  return data || null;
};

export const getPublishedCoursesByInstructorId = async (
  instructorId: number,
): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      category_id,
      sub_category_1_id,
      sub_category_2_id,
      cover_image_url,
      price_coins,
      total_enrolled,
      status,
      created_at,
      instructors (
        id,
        username,
        avatar_url
      )
    `,
    )
    .eq("status", "published")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedCoursesByInstructorId error:", error.message);
    throw error;
  }

  const formatted: Course[] = (data || []).map((course: any) => ({
    ...course,
    instructors: Array.isArray(course.instructors)
      ? course.instructors[0] || null
      : course.instructors || null,
  }));

  return formatted;
};

// ฟังก์ชันดึง User ปัจจุบัน
export async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user?.id ?? null;
}

export async function isCourseInWishlist(courseId: number) {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const { data, error } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) throw error;

  return !!data;
}

export async function addCourseToWishlist(courseId: number) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("กรุณาเข้าสู่ระบบก่อน");
  }

  const payload: TablesInsert<"wishlists"> = {
    user_id: userId,
    course_id: courseId,
  };

  const { data, error } = await supabase
    .from("wishlists")
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeCourseFromWishlist(courseId: number) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("กรุณาเข้าสู่ระบบก่อน");
  }

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) throw error;
}

export async function getWishlistCourses(): Promise<Course[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("wishlists")
    .select(
      `
      course_id,
      courses (
        id,
        title,
        category_id,
        sub_category_1_id,
        sub_category_2_id,
        cover_image_url,
        price_coins,
        total_enrolled,
        status,
        created_at,
        instructors (
          id,
          username,
          avatar_url
        )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getWishlistCourses error:", error.message);
    throw error;
  }

  const formatted: Course[] = (data || [])
    .map((item: any) => {
      const course = Array.isArray(item.courses)
        ? item.courses[0] || null
        : item.courses || null;

      if (!course) return null;

      return {
        ...course,
        instructors: Array.isArray(course.instructors)
          ? course.instructors[0] || null
          : course.instructors || null,
      };
    })
    .filter(Boolean) as Course[];

  return formatted;
}

export const getCourseDetailData = async (
  courseId: number,
  userId: string | null,
) => {
  // 1. ดึงข้อมูล Course & Chapters
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(
      `
      id, title, category_id, sub_category_1_id, sub_category_2_id,
      description, learning_outcome, cover_image_url, price_coins, total_enrolled, created_at,
      instructors (id, username, avatar_url),
      chapters (
        id, course_id, title, video_url, duration_seconds, sequence_order,
        energy_cost_per_question, quiz_pass_score, reward_energy, reward_xp, reward_coins
      )
    `,
    )
    .eq("id", courseId)
    .order("sequence_order", { foreignTable: "chapters", ascending: true })
    .single();

  if (courseError) throw courseError;

  // 2. ดึง Categories มาเตรียมไว้แปลงชื่อ
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name");

  let isWishlisted = false;
  let isEnrolled = false;
  let chapterProgress: any[] = [];

  // 3. ถ้าล็อกอินอยู่ ให้ดึงสถานะส่วนตัวมาด้วย (ยิงพร้อมกันเพื่อความเร็ว)
  if (userId) {
    const [wishRes, enrollRes, progRes] = await Promise.all([
      supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle(),
      supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .maybeSingle(),
      supabase
        .from("user_chapter_progress")
        .select("chapter_id, is_passed, is_video_watched")
        .eq("user_id", userId),
    ]);

    isWishlisted = !!wishRes.data;
    isEnrolled = !!enrollRes.data;
    chapterProgress = progRes.data || [];
  }

  // จัดระเบียบข้อมูลก่อนส่งไปหน้า UI
  return {
    course: {
      ...course,
      instructors: Array.isArray(course.instructors)
        ? course.instructors[0]
        : course.instructors,
    },
    categories: categories || [],
    isWishlisted,
    isEnrolled,
    chapterProgress,
  };
};

// ---------------------------------------------------------
// ✨ ฟังก์ชันจัดการ Wishlist และ ซื้อคอร์ส
// ---------------------------------------------------------
export async function toggleWishlist(
  courseId: number,
  isCurrentlyWishlisted: boolean,
) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("กรุณาเข้าสู่ระบบก่อน");

  if (isCurrentlyWishlisted) {
    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("course_id", courseId);
    return false;
  } else {
    await supabase
      .from("wishlists")
      .insert({ user_id: userId, course_id: courseId });
    return true;
  }
}

export const enrollCourse = async (courseId: number, userId: string) => {
  const { data, error } = await supabase.rpc("enroll_course", {
    p_user_id: userId,
    p_course_id: courseId,
  });

  if (error) throw error;
  return data; // คืนค่า json_build_object กลับไป
};
export const getMyCoursesData = async (userId: string | null) => {
  if (!userId) return [];

  // 1. ดึงข้อมูลการลงทะเบียนและคอร์ส
  const { data: enrollments, error } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      course_id,
      enrolled_at,
      progress_percent,
      is_completed,
      courses (
        id,
        title,
        cover_image_url,
        instructors (
          id,
          username,
          avatar_url
        )
      )
    `,
    )
    .eq("user_id", userId);

  if (error) {
    console.error("getMyCoursesData error:", error.message);
    throw error;
  }

  // 2. ดึงประวัติการเรียน เพื่อหา "เวลาที่เรียนจบล่าสุด" ของแต่ละคอร์ส
  const { data: progressData } = await supabase
    .from("user_chapter_progress")
    .select(
      `
      completed_at,
      chapters ( course_id )
    `,
    )
    .eq("user_id", userId)
    .not("completed_at", "is", null);

  // หาค่าเวลาที่เรียนจบล่าสุด (Max Time) ของแต่ละ course_id
  const lastAccessedMap: Record<number, number> = {};
  if (progressData) {
    progressData.forEach((prog: any) => {
      const courseId = prog.chapters?.course_id;
      if (courseId && prog.completed_at) {
        const time = new Date(prog.completed_at).getTime();
        if (!lastAccessedMap[courseId] || time > lastAccessedMap[courseId]) {
          lastAccessedMap[courseId] = time;
        }
      }
    });
  }

  // 3. แมปข้อมูลส่งกลับไปให้หน้า UI
  return (enrollments || []).map((item: any) => {
    const course = Array.isArray(item.courses) ? item.courses[0] : item.courses;
    const instructor = Array.isArray(course?.instructors)
      ? course?.instructors[0]
      : course?.instructors;

    return {
      enrollment_id: item.id,
      course_id: item.course_id,
      title: course?.title || "ไม่มีชื่อคอร์ส",
      thumbnail: course?.cover_image_url || "https://via.placeholder.com/300",
      instructorName: instructor?.username || "ไม่ระบุผู้สอน",
      instructorAvatar:
        instructor?.avatar_url || "https://via.placeholder.com/100",
      progress: item.progress_percent || 0,
      is_completed: item.is_completed || false,
      enrolled_at: item.enrolled_at,
      // ✨ ถ้าไม่มีประวัติ completed_at ให้เป็น null แทนที่จะเอาวันที่ซื้อมาใส่
      last_accessed_at: lastAccessedMap[item.course_id] || null,
    };
  });
};

export type EnrolledCourseOption = {
  id: number | "all";
  title: string;
  course_id?: number;
};

export async function getEnrolledCourseOptions(
  userId: string | null
): Promise<EnrolledCourseOption[]> {
  if (!userId) {
    return [
      {
        id: "all",
        title: "คอร์สทั้งหมด",
      },
    ];
  }

  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      course_id,
      courses!inner (
        id,
        title,
        status
      )
    `)
    .eq("user_id", userId)
    .eq("courses.status", "published")
    .order("enrolled_at", { ascending: false });

  if (error) {
    console.error("getEnrolledCourseOptions error:", error.message);
    throw error;
  }

  const courseOptions: EnrolledCourseOption[] = (data || []).map((item: any) => {
    const course = Array.isArray(item.courses)
      ? item.courses[0]
      : item.courses;

    return {
      id: item.course_id,
      course_id: item.course_id,
      title: course?.title || "ไม่มีชื่อคอร์ส",
    };
  });

  return [
    {
      id: "all",
      title: "คอร์สทั้งหมด",
    },
    ...courseOptions,
  ];
}

export type CourseChapterProgressSummary = {
  course_id: number;
  total_chapters: number;
  completed_chapters: number;
  remaining_chapters: number;
};

export async function getCourseChapterProgressSummary(
  userId: string,
  courseId: number
): Promise<CourseChapterProgressSummary> {
  // 1. ดึงบทเรียนทั้งหมดของคอร์สนี้
  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id")
    .eq("course_id", courseId);

  if (chaptersError) {
    console.error("getCourseChapterProgressSummary chapters error:", chaptersError);
    throw chaptersError;
  }

  const chapterIds = chapters?.map((chapter) => chapter.id) ?? [];
  const totalChapters = chapterIds.length;

  // ถ้าคอร์สนี้ยังไม่มีบทเรียน
  if (totalChapters === 0) {
    return {
      course_id: courseId,
      total_chapters: 0,
      completed_chapters: 0,
      remaining_chapters: 0,
    };
  }

  // 2. ดึงบทเรียนที่ user ผ่านแล้ว
  const { count, error: progressError } = await supabase
    .from("user_chapter_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_passed", true)
    .in("chapter_id", chapterIds);

  if (progressError) {
    console.error("getCourseChapterProgressSummary progress error:", progressError);
    throw progressError;
  }

  const completedChapters = count ?? 0;
  const remainingChapters = Math.max(totalChapters - completedChapters, 0);

  return {
    course_id: courseId,
    total_chapters: totalChapters,
    completed_chapters: completedChapters,
    remaining_chapters: remainingChapters,
  };
}