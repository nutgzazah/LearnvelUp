import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { getSecureVideoUrl } from "@/src/services/videoService";

interface SecureVideoPlayerProps {
  videoPath: string;
  className?: string;
}

export default function SecureVideoPlayer({
  videoPath,
  className = "w-full aspect-[9/16] rounded-xl overflow-hidden",
}: SecureVideoPlayerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const player = useVideoPlayer(signedUrl, (player) => {
    player.loop = true;
    player.play();
  });

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!videoPath) {
        setError("ไม่พบเส้นทางวิดีโอ");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const url = await getSecureVideoUrl(videoPath);

        if (url) {
          setSignedUrl(url);
        } else {
          throw new Error("ไม่สามารถสร้างลิงก์วิดีโอได้");
        }
      } catch (err: any) {
        console.log("Error fetching video:", err.message);
        if (
          err.message?.includes("Object not found") ||
          err.message?.includes("not found")
        ) {
          setError(
            "คุณยังไม่ได้ซื้อคอร์สเรียน หรือไม่มีสิทธิ์เข้าถึงวิดีโอนี้",
          );
        } else {
          setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ หรือไม่มีสิทธิ์เข้าถึง");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [videoPath]);

  if (loading) {
    return (
      <View
        className={`${className} bg-card items-center justify-center border border-border`}
      >
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text className="text-white mt-2">กำลังเตรียมวิดีโอ...</Text>
      </View>
    );
  }

  if (error || !signedUrl) {
    return (
      <View
        className={`${className} bg-card items-center justify-center border border-alert`}
      >
        <Text className="text-alert font-bold">{error}</Text>
      </View>
    );
  }

  return (
    <View className={`${className} bg-black`}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
      />
    </View>
  );
}
