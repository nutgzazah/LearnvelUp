import { useUserStats } from "@/src/hook/useUserStats";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LEVELUP_SOUND = require("@/assets/sounds/levelup.mp3");
const OTTER_ANIM = require("@/assets/json/loadingOtter.json");

const LEVELUP_QUOTES = [
  "คุณแข็งแกร่งขึ้นแล้ว! พลังงานถูกเติมจนเต็มหลอด\nพร้อมลุยต่อแล้วนะ 🦦✨",
  "เลเวลอัป! ขีดจำกัดใหม่ถูกปลดล็อก\nพร้อมกับพลังงานที่ฟื้นฟูเต็มเปี่ยม! ⚡️",
  "ยอดเยี่ยมมาก! รางวัลของคนเก่งคือ\nพลังงานที่เต็ม 100% ลุยกันต่อเลย! 🚀",
  "เก่งขึ้นอีกขั้นแล้ว! ดื่มด่ำกับพลังงานที่เต็มหลอด\nแล้วไปสนุกกับบทเรียนกันต่อ 🔋",
  "ร่างกายพร้อมปะทะทุกบทเรียน!\nเพราะพลังงานของคุณถูกชาร์จเต็มแล้ว ไปกันเลย! 💪",
];

export default function LevelUpRewardScreen() {
  const { data: stats, isLoading } = useUserStats();
  const insets = useSafeAreaInsets();
  const { oldLevel } = useLocalSearchParams();

  const [displayLevel, setDisplayLevel] = useState<number | null>(null);

  const levelScale = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  const levelupSound = useAudioPlayer(LEVELUP_SOUND);

  const randomQuote = useMemo(() => {
    return LEVELUP_QUOTES[Math.floor(Math.random() * LEVELUP_QUOTES.length)];
  }, []);

  useEffect(() => {
    if (isLoading || !stats) return;

    const newLevel = stats.level;
    const calculatedOldLevel = oldLevel
      ? Number(oldLevel)
      : Math.max(1, newLevel - 1);

    setDisplayLevel(calculatedOldLevel);

    const startAnimation = async () => {
      levelupSound.play();

      Animated.timing(levelScale, {
        toValue: 2.2,
        duration: 1500,
        useNativeDriver: true,
      }).start();

      await new Promise((resolve) => setTimeout(resolve, 1500));

      Animated.sequence([
        Animated.timing(flashOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setDisplayLevel(newLevel);
      }, 200);

      await new Promise((resolve) => setTimeout(resolve, 400));

      Animated.spring(levelScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      Animated.timing(contentFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      await new Promise((resolve) => setTimeout(resolve, 500));

      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    };

    startAnimation();
  }, [isLoading, stats?.level]);

  if (displayLevel === null) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <View className="flex-1 bg-background justify-center px-6 pb-12">
      <Animated.View
        style={{ opacity: contentFade, alignItems: "center" }}
        className="mb-4"
      >
        <LottieView
          source={OTTER_ANIM}
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
      </Animated.View>

      <View className="items-center justify-center">
        <Animated.View
          style={{
            transform: [{ scale: levelScale }],
            position: "relative",
          }}
        >
          <View
            className="bg-alert items-center justify-center rounded-[20px] shadow-2xl shadow-alert/40 px-4"
            style={{ width: 110, height: 110 }}
          >
            <Text
              className="text-white font-black text-center"
              style={{ fontSize: 60 }}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {displayLevel}
            </Text>
          </View>

          <Animated.View
            style={{ opacity: flashOpacity, width: 110, height: 110 }}
            className="absolute inset-0 bg-white rounded-[20px]"
          />
        </Animated.View>

        <Animated.View
          style={{ opacity: contentFade }}
          className="items-center mt-8"
        >
          <Text className="text-alert font-bold text-h2 mb-4">LEVEL UP!</Text>
          <Text className="text-text font-regular text-h6 text-center px-6 leading-relaxed">
            {randomQuote}
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        className="absolute bottom-8 left-5 right-5"
        style={{
          opacity: buttonFade,
          paddingBottom: insets.bottom,
        }}
      >
        <TouchableOpacity
          onPress={() => router.dismiss(3)}
          className="bg-primary py-4 rounded-full flex-row justify-center items-center shadow-md shadow-primary/30"
        >
          <Text className="text-white font-bold text-body">รับทราบ!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
