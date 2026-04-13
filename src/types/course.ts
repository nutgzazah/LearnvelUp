import { Chapter } from "../types/chapters";
import { Instructor } from "../types/instructor";

export interface Course {
  id: number;
  instructor_id?: number | null;
  category_id?: number | null;
  sub_category_1_id?: number | null;
  sub_category_2_id?: number | null;

  title: string;
  description?: string | null;
  learning_outcome?: string | null;
  cover_image_url?: string | null;

  price_coins: number;

  total_enrolled?: number | null;
  created_at?: string;
  instructors: Instructor | null;
  chapters?: Chapter[];
};
