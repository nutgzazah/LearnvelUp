import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
// ✨ เปลี่ยนมาใช้ Image จาก expo-image
import { fetchItemImageUrl } from "@/src/services/itemService";
import { Image } from "expo-image";

// เก็บไว้แค่รูป Default เผื่อกรณีที่ User ยังไม่มีรูป
const DEFAULT_AVATAR = require("../../assets/avatar/generalOtter.png");

interface AvatarDisplayProps {
  avatarId?: number | null;
  size?: number;
}

export default function AvatarDisplay({
  avatarId,
  size = 112,
}: AvatarDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (!avatarId) {
        setImageUrl(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // ดึง URL จาก Database (ซึ่ง URL นี้น่าจะมี ?v= ติดมาแล้วถ้าทำตามข้อ 1)
        const url = await fetchItemImageUrl(avatarId);
        setImageUrl(url);
      } catch (error) {
        console.log("Error fetching avatar item:", error);
        setImageUrl(null);
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
          source={imageUrl ? { uri: imageUrl } : DEFAULT_AVATAR}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="disk" // ✨ หัวใจสำคัญ! สั่งให้แช่รูปลงในเครื่อง โหลดแค่ครั้งเดียวพอ
          transition={200} // เพิ่มเอฟเฟกต์ Fade-in ตอนโหลดเสร็จให้ดูสมูท
        />
      )}
    </View>
  );
}
