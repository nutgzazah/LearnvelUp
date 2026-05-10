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
  const { data: stats } = useUserStats();
  const insets = useSafeAreaInsets();
  const { oldLevel } = useLocalSearchParams();

  // เตรียมค่าเลเวล
  const newLevel = stats?.level || 0;
  const initialLevel = oldLevel ? Number(oldLevel) : newLevel - 1;

  // States & Refs สำหรับแอนิเมชัน
  const [displayLevel, setDisplayLevel] = useState(initialLevel);

  const levelScale = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  const levelupSound = useAudioPlayer(LEVELUP_SOUND);

  // สุ่มคำคมแค่ครั้งเดียวตอนเข้ามาหน้านี้ (เพื่อไม่ให้ข้อความสลับไปมาระหว่างเปลี่ยนเลข)
  const randomQuote = useMemo(() => {
    return LEVELUP_QUOTES[Math.floor(Math.random() * LEVELUP_QUOTES.length)];
  }, []);

  useEffect(() => {
    const startAnimation = async () => {
      // 1. เริ่มเล่นเสียง
      levelupSound.play();

      // 2. ขยายตัวเลขเลเวล
      Animated.timing(levelScale, {
        toValue: 2.2,
        duration: 1500,
        useNativeDriver: true,
      }).start();

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 3. จังหวะเปลี่ยนเลข
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

      // เปลี่ยนตัวเลขตอนที่แฟลชกำลังทำงาน
      setTimeout(() => {
        setDisplayLevel(newLevel);
      }, 200);

      await new Promise((resolve) => setTimeout(resolve, 400));

      // 4. ดีดกลับสู่ขนาดปกติแบบมีแรงสปริง
      Animated.spring(levelScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // 5. เฟดข้อความและน้องนากโผล่มา
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      await new Promise((resolve) => setTimeout(resolve, 500));

      // 6. เฟดปุ่ม รับทราบ โผล่มาที่ตำแหน่งล่างสุด
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    };

    startAnimation();
  }, [newLevel]);

  return (
    <View className="flex-1 bg-background justify-center px-6 pb-12">
      {/* 🦦 ส่วนบน: น้องนาก */}
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

      {/* 🔢 ส่วนกลาง: การ์ดตัวเลขเลเวล */}
      <View className="items-center justify-center">
        <Animated.View
          style={{
            transform: [{ scale: levelScale }],
            position: "relative",
          }}
        >
          {/* ✨ ทำให้การ์ดเป็นสี่เหลี่ยมจัตุรัสแบบ 110x110 */}
          <View
            className="bg-alert items-center justify-center rounded-[20px] shadow-2xl shadow-alert/40 px-4"
            style={{ width: 110, height: 110 }}
          >
            {/* ✨ ปรับขนาดฟอนต์ให้หดเล็กลงอัตโนมัติ */}
            <Text
              className="text-white font-black text-center"
              style={{ fontSize: 60 }}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {displayLevel}
            </Text>
          </View>

          {/* แผ่น Flash สีขาวตอนเปลี่ยนเลข */}
          <Animated.View
            style={{ opacity: flashOpacity, width: 110, height: 110 }}
            className="absolute inset-0 bg-white rounded-[20px]"
          />
        </Animated.View>

        {/* ✨ ย้าย Level UP! มาไว้ใต้การ์ด และนำ randomQuote มาแสดงผล */}
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

      {/* 🔘 ส่วนล่าง: ปุ่มกด */}
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
