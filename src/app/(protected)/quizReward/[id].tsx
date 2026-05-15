import { AppIcons } from "@/src/constants/icons";
import { usePopupStore } from "@/src/stores/usePopupStore";
import { useAudioPlayer } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import NewBadgeUnlocked from "@/src/components/NewBadgeUnlocked";

const REWARD_ANIM = require("@/assets/json/loadingOtter.json");
const REWARD_SOUND = require("@/assets/sounds/reward.mp3");
const BADGE_SOUND = require("@/assets/sounds/badge.mp3");

const REWARD_TITLES = [
  "ยินดีด้วย!",
  "สุดยอดไปเลย!",
  "เก่งมาก!",
  "ทำได้ดีมาก!",
  "ยอดเยี่ยม!",
  "เพอร์เฟกต์!",
  "ไร้ที่ติ!",
  "เจ๋งสุดๆ!",
  "เฉียบขาด!",
  "ปรบมือรัวๆ!",
];

const REWARD_SUBTITLES = [
  "คุณได้รับรางวัลสุดพิเศษแล้ว! 🎁",
  "ความพยายามของคุณกลายเป็นรางวัลแล้วนะ! 🌟",
  "เหนื่อยหน่อยแต่คุ้มค่า นี่คือรางวัลของคุณ! 🏆",
  "รับของรางวัลไปเลย คุณคู่ควรกับมัน! 👑",
  "เก็บรางวัลเข้ากระเป๋า แล้วไปลุยกันต่อ! 🎒",
  "ผลงานดีแบบนี้ ต้องฉลองด้วยรางวัล! 🎉",
  "รางวัลของคนเก่งมารออยู่ตรงหน้าแล้ว! 🥇",
  "น้องนากหอบของรางวัลมาส่งให้ถึงที่เลย! 🦦✨",
  "เก็บสะสมความสำเร็จ แล้วรับรางวัลไปเต็มๆ! 💰",
  "ก้าวไปอีกขั้นแล้วนะ มารับของขวัญกันเถอะ! 🚀",
];

export default function QuizRewardScreen() {
  const { popNext } = usePopupStore();
  const { xp, energy, coins, courseId, new_badges } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const targetXp = Number(xp) || 0;
  const targetEnergy = Number(energy) || 0;
  const targetCoins = Number(coins) || 0;

  const parsedBadges = useMemo(() => {
    if (!new_badges) return [];
    try {
      return JSON.parse(new_badges as string);
    } catch (e) {
      return [];
    }
  }, [new_badges]);

  const [displayXp, setDisplayXp] = useState(0);
  const [displayEnergy, setDisplayEnergy] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);

  const scaleXp = useRef(new Animated.Value(1)).current;
  const scaleEnergy = useRef(new Animated.Value(1)).current;
  const scaleCoins = useRef(new Animated.Value(1)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeTranslateY = useRef(new Animated.Value(30)).current;

  const [isButtonActive, setIsButtonActive] = useState(false);

  const rewardSound = useAudioPlayer(REWARD_SOUND);
  const badgeSound = useAudioPlayer(BADGE_SOUND);

  const randomTitle = useMemo(() => {
    return REWARD_TITLES[Math.floor(Math.random() * REWARD_TITLES.length)];
  }, []);

  const randomSubtitle = useMemo(() => {
    return REWARD_SUBTITLES[
      Math.floor(Math.random() * REWARD_SUBTITLES.length)
    ];
  }, []);

  const handleClaim = () => {
    const nextPopup = popNext();
    if (nextPopup === "streak") {
      router.replace("/streakReward" as any);
    } else if (nextPopup === "levelup") {
      router.replace("/levelUpReward" as any);
    } else {
      router.dismiss(3);
    }
  };

  useEffect(() => {
    const queue: any[] = [];
    if (targetXp > 0)
      queue.push({
        target: targetXp,
        setDisplay: setDisplayXp,
        scale: scaleXp,
      });
    if (targetEnergy > 0)
      queue.push({
        target: targetEnergy,
        setDisplay: setDisplayEnergy,
        scale: scaleEnergy,
      });
    if (targetCoins > 0)
      queue.push({
        target: targetCoins,
        setDisplay: setDisplayCoins,
        scale: scaleCoins,
      });

    if (queue.length === 0) {
      setDisplayXp(targetXp);
      setDisplayEnergy(targetEnergy);
      setDisplayCoins(targetCoins);
      buttonOpacity.setValue(1);
      badgeOpacity.setValue(1);
      badgeTranslateY.setValue(0);
      setIsButtonActive(true);
      return;
    }

    let isCancelled = false;

    const processQueue = async () => {
      for (let i = 0; i < queue.length; i++) {
        if (isCancelled) break;
        const item = queue[i];

        rewardSound.seekTo(0);
        rewardSound.play();

        Animated.spring(item.scale, {
          toValue: 1.15,
          friction: 4,
          useNativeDriver: true,
        }).start();

        await new Promise<void>((resolve) => {
          const duration = 890;
          const fps = 60;
          const totalFrames = (duration / 1000) * fps;
          let currentFrame = 0;

          const timer = setInterval(() => {
            if (isCancelled) {
              clearInterval(timer);
              return resolve();
            }
            currentFrame++;
            const progress = currentFrame / totalFrames;
            const easeOut = progress * (2 - progress);

            if (currentFrame >= totalFrames) {
              clearInterval(timer);
              item.setDisplay(item.target);
              resolve();
            } else {
              item.setDisplay(Math.floor(item.target * easeOut));
            }
          }, 1000 / fps);
        });

        if (isCancelled) break;

        Animated.spring(item.scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();

        if (i < queue.length - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      if (!isCancelled) {
        setIsButtonActive(true);

        if (parsedBadges.length > 0) {
          badgeSound.seekTo(0);
          badgeSound.play();
        }

        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          ...(parsedBadges.length > 0
            ? [
                Animated.timing(badgeOpacity, {
                  toValue: 1,
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.spring(badgeTranslateY, {
                  toValue: 0,
                  friction: 5,
                  useNativeDriver: true,
                }),
              ]
            : []),
        ]).start();
      }
    };

    processQueue();

    return () => {
      isCancelled = true;
    };
  }, [targetXp, targetEnergy, targetCoins, parsedBadges.length]);

  return (
    <View className="flex-1 bg-background justify-center pb-12">
      <View className="items-center justify-center mb-8 h-52">
        <LottieView
          source={REWARD_ANIM}
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
      </View>

      <View className="items-center mb-8 px-4">
        <Text className="text-primary font-bold text-h3 mb-4 text-center">
          {randomTitle}
        </Text>
        <Text className="text-text font-regular text-h6 text-center leading-relaxed">
          {randomSubtitle}
        </Text>
      </View>

      {/* แถวของรางวัล XP / Energy / Coin */}
      <View className="flex-row items-center justify-center gap-3 w-full px-6">
        {targetXp > 0 && (
          <Animated.View
            style={{ transform: [{ scale: scaleXp }] }}
            className="flex-1 rounded-2xl bg-alert/10 p-4 items-center border border-alert/50"
          >
            <Text className="text-alert font-bold text-body mb-3">XP</Text>
            <View className="flex-row items-center bg-alert/10 px-4 py-2 rounded-full">
              <Text className="text-alert font-bold mr-1 text-body">+</Text>
              <Image
                source={AppIcons.HEADERS.NORMAL.XP}
                className="w-5 h-5 mr-1"
                resizeMode="contain"
              />
              <Text className="text-alert font-bold text-small">
                {displayXp}
              </Text>
            </View>
          </Animated.View>
        )}

        {targetEnergy > 0 && (
          <Animated.View
            style={{ transform: [{ scale: scaleEnergy }] }}
            className="flex-1 rounded-2xl bg-primary/10 p-4 items-center border border-primary/50"
          >
            <Text className="text-primary font-bold text-body mb-3">
              พลังงาน
            </Text>
            <View className="flex-row items-center bg-primary/10 px-4 py-2 rounded-full">
              <Text className="text-primary font-bold mr-1 text-body">+</Text>
              <Image
                source={AppIcons.HEADERS.NORMAL.ENERGY}
                className="w-5 h-5 mr-1"
                resizeMode="contain"
              />
              <Text className="text-primary font-bold text-small">
                {displayEnergy}
              </Text>
            </View>
          </Animated.View>
        )}

        {targetCoins > 0 && (
          <Animated.View
            style={{ transform: [{ scale: scaleCoins }] }}
            className="flex-1 rounded-2xl bg-secondary/10 p-4 items-center border border-secondary/50"
          >
            <Text className="text-secondary font-bold text-body mb-3">
              เหรียญ
            </Text>
            <View className="flex-row items-center bg-secondary/10 px-4 py-2 rounded-full">
              <Text className="text-secondary font-bold mr-1 text-body">+</Text>
              <Image
                source={AppIcons.HEADERS.NORMAL.COIN}
                className="w-5 h-5 mr-1"
                resizeMode="contain"
              />
              <Text className="text-secondary font-bold text-small">
                {displayCoins}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* ✨ ส่วนแสดงเหรียญตรา (Badge) ที่ปลดล็อกใหม่ */}
      <NewBadgeUnlocked
        badges={parsedBadges}
        opacity={badgeOpacity}
        translateY={badgeTranslateY}
      />

      <Animated.View
        className="absolute bottom-8 left-5 right-5"
        style={{ opacity: buttonOpacity }}
      >
        <TouchableOpacity
          className="bg-primary py-4 rounded-full flex-row justify-center items-center shadow-md shadow-primary/30"
          onPress={handleClaim}
          disabled={!isButtonActive}
        >
          <Text className="text-white font-bold text-body">รับรางวัล</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
