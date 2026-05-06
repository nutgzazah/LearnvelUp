import { AppIcons } from "@/src/constants/icons";
import { getSecureVideoUrl } from "@/src/services/videoService";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import LottieView from "lottie-react-native";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import loadingOtter from "../../assets/json/loadingOtter.json";

// ✨ 1. สร้าง In-Memory Cache ไว้นอก Component (จะไม่หายไปเมื่อเข้า/ออกหน้าจอ)
const videoUrlCache = new Map<string, { url: string; expiry: number }>();
const CACHE_DURATION = 50 * 60 * 1000; // ตั้งอายุ Cache ไว้ 50 นาที (เผื่อจาก Signed URL ปกติที่มักจะ 1 ชม.)

export interface SecureVideoPlayerRef {
  seek: (time: number) => void;
  pause?: () => void;
}

interface SecureVideoPlayerProps {
  videoPath: string;
  className?: string;
  onProgress?: (currentTime: number, duration: number) => void;
}

const SecureVideoPlayer = forwardRef<
  SecureVideoPlayerRef,
  SecureVideoPlayerProps
>(
  (
    {
      videoPath,
      className = "w-full aspect-[9/16] rounded-xl overflow-hidden",
      onProgress,
    },
    ref,
  ) => {
    const [signedUrl, setSignedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [skipIndicator, setSkipIndicator] = useState<
      "forward" | "backward" | null
    >(null);

    const lastTapRef = useRef<{ time: number; x: number } | null>(null);
    const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );
    const screenWidth = Dimensions.get("window").width;

    const playOpacity = useRef(new Animated.Value(0)).current;
    const skipOpacity = useRef(new Animated.Value(0)).current;

    const player = useVideoPlayer(signedUrl, (player) => {
      player.loop = false;
      player.play();
      setIsPlaying(true);
    });

    useImperativeHandle(ref, () => ({
      seek: (time: number) => {
        if (player) player.currentTime = time;
      },
      // ✨ เพิ่มฟังก์ชัน pause ให้เรียกจากข้างนอกได้
      pause: () => {
        if (player) {
          player.pause();
          setIsPlaying(false);
        }
      },
    }));

    const onProgressRef = useRef(onProgress);
    useEffect(() => {
      onProgressRef.current = onProgress;
    }, [onProgress]);

    useEffect(() => {
      const interval = setInterval(() => {
        if (player) {
          // 1. ส่งอัปเดตเวลาให้หน้าหลัก (แถบ Progress)
          if (onProgressRef.current) {
            onProgressRef.current(
              player.currentTime || 0,
              player.duration || 0,
            );
          }
          // ✨ 2. ถ้าวิดีโอเล่นจนจบแล้ว (เวลาปัจจุบันเกือบเท่ากับความยาววิดีโอ)
          // ให้เซ็ต isPlaying เป็น false เพื่อโชว์ไอคอน Play กลับขึ้นมา
          if (
            player.duration > 0 &&
            player.currentTime >= player.duration - 0.5
          ) {
            setIsPlaying(false);
          }
        }
      }, 250);
      return () => clearInterval(interval);
    }, [player]);

    useEffect(() => {
      Animated.timing(playOpacity, {
        toValue: isPlaying ? 0 : 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, [isPlaying]);

    const togglePlayPause = () => {
      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        // ✨ เช็คว่าถ้าวิดีโอเล่นจนจบแล้ว ให้กรอกลับไปวินาทีที่ 0 ก่อนสั่งเล่น
        if (player.duration && player.currentTime >= player.duration - 0.5) {
          player.currentTime = 0;
        }
        player.play();
        setIsPlaying(true);
      }
    };

    const handlePress = (e: any) => {
      const now = Date.now();
      const x = e.nativeEvent.pageX;

      if (lastTapRef.current && now - lastTapRef.current.time < 300) {
        if (singleTapTimeoutRef.current)
          clearTimeout(singleTapTimeoutRef.current);

        if (x < screenWidth / 2) {
          player.currentTime = Math.max(0, player.currentTime - 5);
          setSkipIndicator("backward");
        } else {
          // ✨ ดักไว้ว่าถ้าบวก 5 วิแล้วเกินความยาววิดีโอ ให้หยุดแค่ตอนจบพอดี
          const newTime = player.currentTime + 5;
          player.currentTime = player.duration
            ? Math.min(newTime, player.duration)
            : newTime;
          setSkipIndicator("forward");
        }

        skipOpacity.setValue(1);
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(skipOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setSkipIndicator(null));

        lastTapRef.current = null;
      } else {
        lastTapRef.current = { time: now, x };
        singleTapTimeoutRef.current = setTimeout(() => {
          togglePlayPause();
          lastTapRef.current = null;
        }, 300);
      }
    };

    useEffect(() => {
      // ✨ 2. ระบบจัดการ Request (AbortController) ป้องกัน Memory Leak
      let isMounted = true;

      const fetchSignedUrl = async () => {
        if (!videoPath) {
          setError("ไม่พบเส้นทางวิดีโอ");
          setLoading(false);
          return;
        }

        // ✨ 3. เช็คใน Cache ก่อนว่ามี URL ของไฟล์นี้ที่ยังไม่หมดอายุไหม
        const cached = videoUrlCache.get(videoPath);
        if (cached && cached.expiry > Date.now()) {
          // console.log("🚀 Using Cached URL for:", videoPath);
          setSignedUrl(cached.url);
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          // console.log("🌐 Fetching New Signed URL...");
          const url = await getSecureVideoUrl(videoPath);

          if (url && isMounted) {
            // ✨ 4. เก็บลง Cache พร้อมระบุเวลาหมดอายุ
            videoUrlCache.set(videoPath, {
              url,
              expiry: Date.now() + CACHE_DURATION,
            });

            setSignedUrl(url);
          } else if (isMounted) {
            throw new Error("ไม่สามารถสร้างลิงก์วิดีโอได้");
          }
        } catch (err: any) {
          if (isMounted) {
            if (err.message?.includes("Object not found")) {
              setError(
                "คุณยังไม่ได้ซื้อคอร์สเรียน หรือไม่มีสิทธิ์เข้าถึงวิดีโอนี้",
              );
            } else {
              setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ หรือไม่มีสิทธิ์เข้าถึง");
            }
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      fetchSignedUrl();

      return () => {
        isMounted = false; // ยกเลิกการอัปเดต State ถ้า User กดย้อนกลับออกไปก่อน
      };
    }, [videoPath]);

    // ... (ส่วนการแสดงผล UI เหมือนเดิม)
    if (loading) {
      return (
        <View
          className={`${className} bg-background items-center justify-center border border-disablebg/20`}
        >
          {/* ✨ เปลี่ยนจากสปินเนอร์กลมๆ เป็นน้องนาก Lottie */}
          <LottieView
            source={loadingOtter} // ตรวจสอบ path ให้ตรงกับโฟลเดอร์ของคุณนะครับ
            autoPlay
            loop
            style={{ width: 120, height: 120 }} // ปรับขนาดให้พอดีกับกรอบวิดีโอ
          />
          <Text className="text-disabletext mt-4 font-bold tracking-[2px] text-small uppercase">
            กำลังโหลดวิดีโอ...
          </Text>
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
      <TouchableWithoutFeedback onPress={(e) => handlePress(e)}>
        <View className={`${className} bg-background relative`}>
          <VideoView
            style={StyleSheet.absoluteFill}
            player={player}
            contentFit="contain"
            nativeControls={false}
            fullscreenOptions={{ enable: true }}
            allowsPictureInPicture
          />

          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { opacity: playOpacity },
              {
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.4)",
                zIndex: 30,
              },
            ]}
            pointerEvents="none"
          >
            <Image
              source={AppIcons.COURSE.NORMAL.PLAY}
              style={{
                width: 80,
                height: 80,
                tintColor: "white",
                opacity: 0.9,
              }}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Skip Indicators */}
          {skipIndicator === "backward" && (
            <Animated.View
              style={{ opacity: skipOpacity }}
              className="absolute left-0 top-0 bottom-0 w-1/2 items-center justify-center bg-white/10 z-30 rounded-l-3xl"
              pointerEvents="none"
            >
              <Ionicons name="play-back" size={40} color="white" />
              <Text className="text-white font-bold mt-2">-5 วินาที</Text>
            </Animated.View>
          )}

          {skipIndicator === "forward" && (
            <Animated.View
              style={{ opacity: skipOpacity }}
              className="absolute right-0 top-0 bottom-0 w-1/2 items-center justify-center bg-white/10 z-30 rounded-r-3xl"
              pointerEvents="none"
            >
              <Ionicons name="play-forward" size={40} color="white" />
              <Text className="text-white font-bold mt-2">+5 วินาที</Text>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  },
);

export default SecureVideoPlayer;
