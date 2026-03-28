import { supabase } from "@/src/lib/supabase";

/**
 * Signed URL for securely accessing video files stored in Supabase Storage
 * @param videoPath Path to the video file in Supabase Storage
 * @param expiresIn Expiration time for the signed URL (default is 3600 seconds or 1 hour)
 */
export const getSecureVideoUrl = async (
  videoPath: string,
  expiresIn: number = 3600,
) => {
  try {
    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUrl(videoPath, expiresIn);

    if (error) throw error;

    return data?.signedUrl || null;
  } catch (error) {
    console.error("Error fetching secure video URL:", error);
    throw error; // Send the error back to the caller to handle
  }
};
