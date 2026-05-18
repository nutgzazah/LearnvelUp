import { AppIcons } from "@/src/constants/icons";
import { useUserStats } from "@/src/hook/useUserStats";
import { usePopupStore } from "@/src/stores/usePopupStore";
import { useAudioPlayer } from "expo-audio";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STREAK_SOUND = require("@/assets/sounds/streak.mp3");
const STREAK_FIRE_ANIM = require("@/assets/json/onFire.json");

const STREAK_QUOTES = [
  "ไฟในตัวคุณเริ่มลุกโชนแล้ว!\nรักษามันไว้ให้ดีนะ 🦦🔥",
  "ความสม่ำเสมอคือหัวใจของความสำเร็จ\nลุยต่ออย่าให้ดับ! 🚀",
  "ร้อนแรงสุดๆ! น้องนากเอาฟืนมาเติมให้แล้ว\nพรุ่งนี้เจอกันใหม่นะ ✨",
  "อย่าให้ไฟมอด! มาเรียนทุกวัน\nเพื่อเป็นสุดยอดนากกันเถอะ 💪",
  "สถิติใหม่รอคุณอยู่! รักษาจังหวะนี้ไว้\nแล้วไปให้ไกลกว่าเดิม 🏆",
];

export default function StreakRewardScreen() {
  const { data: stats } = useUserStats();
  const { popNext } = usePopupStore();
  const insets = useSafeAreaInsets();

  const fireFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  const streakSound = useAudioPlayer(STREAK_SOUND);

  const randomQuote = useMemo(() => {
    return STREAK_QUOTES[Math.floor(Math.random() * STREAK_QUOTES.length)];
  }, []);

  const handleNext = () => {
    const next = popNext();
    if (next === "levelup") {
      router.replace("/levelUpReward" as any);
    } else {
      router.dismiss(3);
    }
  };

  useEffect(() => {
    const startAnimation = async () => {
      // 1. เริ่มเล่นเสียง Streak
      streakSound.play();

      // 2. ค่อยๆ เฟด Lottie ไฟขึ้นมา
      Animated.timing(fireFade, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. เฟดข้อความ
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      await new Promise((resolve) => setTimeout(resolve, 500));

      // 4. เฟดปุ่ม
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    };

    startAnimation();
  }, []);

  return (
    <View className="flex-1 bg-background justify-center px-6 pb-12">
      {/*  ส่วนกลาง: Lottie ไฟสตรีค */}
      <View className="items-center justify-center my-10">
        <Animated.View
          style={{
            opacity: fireFade,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* นำ Lottie ไฟมาใส่ตรงนี้ได้เลย สามารถปรับ width/height*/}
          <LottieView
            source={STREAK_FIRE_ANIM}
            autoPlay
            loop
            style={{ width: 250, height: 250 }}
          />
        </Animated.View>

        {/* ข้อความสตรีคและคำคม */}
        <Animated.View
          style={{ opacity: contentFade }}
          className="items-center mt-8"
        >
          {/* นำ Icon ไฟมาใส่คู่กับตัวเลข และจัดให้อยู่ในแนวนอน (flex-row) */}
          <View className="flex-row items-center justify-center mb-4">
            <Image
              source={AppIcons.HEADERS.NORMAL.STREAK}
              className="w-10 h-10 mr-2"
              resizeMode="contain"
            />
            <Text className="text-alert font-bold text-h2">
              {stats?.streak} วันติดแล้ว!
            </Text>
          </View>

          <Text className="text-text font-regular text-h6 text-center px-6 leading-relaxed">
            {randomQuote}
          </Text>
        </Animated.View>
      </View>

      {/*  ส่วนล่าง: ปุ่มกด */}
      <Animated.View
        className="absolute bottom-8 left-5 right-5"
        style={{
          opacity: buttonFade,
          paddingBottom: insets.bottom,
        }}
      >
        <TouchableOpacity
          onPress={handleNext}
          className="bg-primary py-4 rounded-full flex-row justify-center items-center shadow-md "
        >
          <Text className="text-white font-bold text-body">สุดยอด!</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
