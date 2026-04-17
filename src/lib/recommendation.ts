const BASE_URL = process.env.EXPO_PUBLIC_RECOMMENDATION_URL ?? "";

export interface CourseScore {
  course_id: number;
  title: string;
  score: number; // 0.0 – 1.0
  main_category: string | null;
  sub_categories: string[];
  teacher_avatar_url: string | null; // ใช้แสดง avatar
  cover_image_url: string | null; // ใช้แสดง thumbnail
  price_coins: number | null; // ใช้แสดงราคา
}

export interface RecommendResponse {
  recommendations: CourseScore[];
  is_cold_start: boolean;
}

// ── Get recommendations
export async function getRecommendations(
  userId: string,
  topK = 10,
): Promise<RecommendResponse> {
  console.log("body ที่ส่ง:", JSON.stringify({ user_id: userId, top_k: topK }));
  const res = await fetch(`${BASE_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, top_k: topK }),
  });

  if (!res.ok) throw new Error(`Recommendation API error: ${res.status}`);
  return res.json() as Promise<RecommendResponse>;
}

// ── Trigger retrain
export async function triggerRetrain(): Promise<void> {
  await fetch(`${BASE_URL}/retrain`, { method: "POST" });
}
