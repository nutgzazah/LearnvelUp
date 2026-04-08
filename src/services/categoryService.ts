import { supabase } from "@/src/lib/supabase";

export const fetchAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
