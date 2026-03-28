import { supabase } from "@/src/lib/supabase";

/**
 *  Get the image URL for a specific item by its ID
 * @param itemId
 */
export const fetchItemImageUrl = async (itemId: number) => {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("image_url")
      .eq("id", itemId)
      .single();

    if (error) throw error;

    return data?.image_url || null;
  } catch (error) {
    console.error("Error fetching item image:", error);
    return null; // return null if there's an error or no image URL found
  }
};
