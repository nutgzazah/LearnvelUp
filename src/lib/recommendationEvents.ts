
// Helper สำหรับ track implicit feedback
// แยกออกมาเป็นไฟล์เดียวเพื่อให้ reuse ได้ง่าย
// ทุก function เป็น fire-and-forget (ไม่ await)
// เพราะไม่อยากให้ tracking ทำให้ UI ช้า

import { supabase } from "@/src/lib/supabase";

interface EventPayload {
  userId:   string;
  courseId: number;
  score:    number;
  action:   "shown" | "clicked" | "time_on_page" | "back_quickly";
  value?:   number; // วินาที สำหรับ time_on_page
}

// ── Core insert function ──────────────────────────────────────────────────────
async function trackEvent(payload: EventPayload) {
  const { error } = await supabase
    .from("recommendation_events" as any)
    .insert({
    user_id:   payload.userId,
    course_id: payload.courseId,
    action:    payload.action,
    score:     payload.score,
    value:     payload.value ?? null,
  });

  if (error) console.warn("[RecommendEvent] failed:", error.message);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * เรียกเมื่อ card โผล่บนหน้าจอ
 * ใช้ใน useEffect ของ RecommendedCourseCard
 */
export function trackImpression(
  userId:   string,
  courseId: number,
  score:    number
) {
  trackEvent({ userId, courseId, score, action: "shown" });
}

/**
 * เรียกเมื่อ user กด card
 * ใช้ใน onPress ของ RecommendedCourseCard
 */
export function trackClick(
  userId:   string,
  courseId: number,
  score:    number
) {
  trackEvent({ userId, courseId, score, action: "clicked" });
}

/**
 * เรียกเมื่อ user อยู่หน้า CourseDetail นานกว่า threshold
 * value = วินาทีที่อยู่บนหน้า
 */
export function trackTimeOnPage(
  userId:          string,
  courseId:        number,
  durationSeconds: number
) {
  const THRESHOLD_SECONDS = 5;
  if (durationSeconds < THRESHOLD_SECONDS) return;

  trackEvent({
    userId,
    courseId,
    score:  0,
    action: "time_on_page",
    value:  durationSeconds,
  });
}

/**
 * เรียกเมื่อ user กด back ภายใน 5 วินาที = ไม่สนใจ
 * ใช้ใน useTimeOnPage cleanup
 */
export function trackBackQuickly(userId: string, courseId: number) {
  trackEvent({ userId, courseId, score: 0, action: "back_quickly" });
}