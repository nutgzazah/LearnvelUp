import { getRecommendations, type CourseScore } from "@/src/lib/recommendation";
import { create } from "zustand";

interface RecommendationState {
  courses: CourseScore[];
  isColdStart: boolean; // true = ผลที่ได้เป็น popular ไม่ใช่ personalized
  loading: boolean;
  error: string | null;
  fetch: (userId: string, topK?: number) => Promise<void>;
  clear: () => void;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  courses: [],
  isColdStart: false,
  loading: false,
  error: null,

  fetch: async (userId, topK = 10) => {
    set({ loading: true, error: null });
    try {
      const { recommendations, is_cold_start } = await getRecommendations(
        userId,
        topK,
      );
      set({ courses: recommendations, isColdStart: is_cold_start });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  clear: () => set({ courses: [], isColdStart: false, error: null }),
}));
