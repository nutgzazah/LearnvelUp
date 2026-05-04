import { supabase } from "../lib/supabase";
import { Categories } from "../types/categories";
import { Course } from "../types/course";
import type { TablesInsert } from "../types/database.types";
import { Instructor } from "../types/instructor";

export const getPublishedCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select(`
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
    `)
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
    .select(`
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
    `)
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
  id: number
): Promise<Instructor | null> => {
  const { data, error } = await supabase
    .from("instructors")
    .select(`
      id,
      username,
      email,
      bio,
      avatar_url
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("getInstructorById error:", error.message);
    throw error;
  }

  return data || null;
};

export const getPublishedCoursesByInstructorId = async (
  instructorId: number
): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select(`
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
    `)
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
    .select(`
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
    `)
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