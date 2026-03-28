import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";

import { fetchItemImageUrl } from "@/src/services/itemService";

export const STATIC_AVATARS: Record<number | string, any> = {
  4: require("../../assets/avatar/studentOtter.png"),
  5: require("../../assets/avatar/universityOtter.png"),
  6: require("../../assets/avatar/officeOtter.png"),
  7: require("../../assets/avatar/generalOtter.png"),
  default: require("../../assets/avatar/generalOtter.png"),
};

interface AvatarDisplayProps {
  avatarId?: number | null;
  size?: number;
}

export default function AvatarDisplay({
  avatarId,
  size = 112,
}: AvatarDisplayProps) {
  const [avatarSource, setAvatarSource] = useState<any>(STATIC_AVATARS.default);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      // If no avatarId provided, use default avatar immediately
      if (!avatarId) {
        setAvatarSource(STATIC_AVATARS.default);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const imageUrl = await fetchItemImageUrl(avatarId);

        // Hybrid: If DB has URL use it, otherwise fallback to static asset based on ID
        if (imageUrl) {
          setAvatarSource({ uri: imageUrl });
        } else if (STATIC_AVATARS[avatarId]) {
          setAvatarSource(STATIC_AVATARS[avatarId]);
        } else {
          setAvatarSource(STATIC_AVATARS.default);
        }
      } catch (error) {
        console.log("Error fetching avatar item:", error);
        setAvatarSource(STATIC_AVATARS.default);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatar();
  }, [avatarId]);

  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full border-[4px] border-background bg-card items-center justify-center overflow-hidden shadow-custom"
    >
      {loading ? (
        <ActivityIndicator size="small" color="#6C5CE7" />
      ) : (
        <Image
          source={avatarSource}
          className="w-full h-full"
          resizeMode="cover"
        />
      )}
    </View>
  );
}
