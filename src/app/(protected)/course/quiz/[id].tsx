import { AppIcons } from "@/src/constants/icons";
import {
  completeQuizAndGiveRewards,
  deductUserEnergy,
  getChapterQuizInfo,
  getQuestionsWithAnswers,
} from "@/src/services/quizService";
import { fetchUserStats } from "@/src/services/userService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAudioPlayer } from "expo-audio"; // ✨ เปลี่ยนมาใช้ expo-audio ตัวใหม่
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ✨ โหลดไฟล์เสียง
const CORRECT_SOUND = require("../../../../../assets/sounds/correct.mp3");
const WRONG_SOUND = require("../../../../../assets/sounds/wrong.mp3");
const WIN_SOUND = require("../../../../../assets/sounds/win.mp3");
const LOSE_SOUND = require("../../../../../assets/sounds/lose.mp3");

// ✨ โหลด Lottie มารอไว้เลย
const BOSS_IDLE_ANIM = require("../../../../../assets/json/loadingOtter.json");
const BOSS_CORRECT_ANIM = require("../../../../../assets/json/loadingOtter.json");
const BOSS_WRONG_ANIM = require("../../../../../assets/json/loadingOtter.json");
const BOSS_LOSE_ANIM = require("../../../../../assets/json/loadingOtter.json");
const BOSS_WIN_ANIM = require("../../../../../assets/json/loadingOtter.json");

// ✨ รายการคำคมปลอบใจ (แพ้)
const LOSE_QUOTES = [
  "น่าเสียดายจัง... แต่ไม่เป็นไรนะ ครั้งหน้าเอาใหม่! 🦦",
  "พลาดไปนิดเดียวเอง พักกินปลาก่อนแล้วค่อยมาลุยใหม่นะ 🐟",
  "โอ๊ะโอ... บอสตัวนี้โหดเอาเรื่องเลยนะเนี่ย สู้ๆ! 💪",
  "สะดุดล้มไม่เป็นไร ลุกขึ้นมาปัดฝุ่นแล้วไปต่อกัน! ✨",
  "เกือบจะชนะแล้วเชียว! ไปทบทวนอีกนิดต้องผ่านแน่ๆ 📚",
];

// ✨ รายการคำคมเอ่ยชม (ชนะ)
const WIN_QUOTES = [
  "เก่งมาก! บอสตัวนี้สู้คุณไม่ได้เลยจริงๆ 🎉",
  "สุดยอดไปเลย! ความพยายามของคุณสัมฤทธิ์ผลแล้ว 🦦✨",
  "เยี่ยมยอด! เตรียมรับรางวัลที่คุณคู่ควรได้เลย 🎁",
  "ไร้เทียมทาน! ผ่านฉลุยแบบนี้ต้องฉลองด้วยปลาตัวโตๆ แล้วล่ะ 🐟",
  "ทำได้ดีมาก! ก้าวไปอีกขั้นแล้วนะ ลุยต่อไปเลย! 🚀",
];

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const chapterId = Number(id);
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // ✨ เตรียม Player สำหรับเสียงต่างๆ ไว้ตั้งแต่แรก (แอพจะจัดการ Memory ให้เอง)
  const correctSound = useAudioPlayer(CORRECT_SOUND);
  const wrongSound = useAudioPlayer(WRONG_SOUND);
  const winSound = useAudioPlayer(WIN_SOUND);
  const loseSound = useAudioPlayer(LOSE_SOUND);

  // ✨ State ต่างๆ
  const [endQuote, setEndQuote] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const damageAnim = useRef(new Animated.Value(0)).current;
  const isIntentionalExit = useRef(false);

  // ----------------------------------------------------
  // ✨ 1. Data Fetching
  // ----------------------------------------------------

  const { data: chapter, isLoading: isChapterLoading } = useQuery({
    queryKey: ["chapterQuiz", chapterId],
    queryFn: () => getChapterQuizInfo(chapterId),
  });

  const { data: questions, isLoading: isQuestionsLoading } = useQuery({
    queryKey: ["quizQuestions", chapterId],
    queryFn: () => getQuestionsWithAnswers(chapterId),
  });

  const { data: userStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["userStats", user?.id],
    queryFn: () => fetchUserStats(user?.id as string),
    enabled: !!user?.id,
  });

  const isLoading = isChapterLoading || isQuestionsLoading || isStatsLoading;

  // ----------------------------------------------------
  // ✨ 2. Game States
  // ----------------------------------------------------
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [bossHp, setBossHp] = useState(0);
  const [maxBossHp, setMaxBossHp] = useState(0);
  const [currentEnergy, setCurrentEnergy] = useState(0);

  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStatus, setGameStatus] = useState<"playing" | "win" | "lose">(
    "playing",
  );

  const currentQuestion = questions?.[currentQuestionIndex];
  const hpPercentage =
    maxBossHp > 0 ? Math.max(0, (bossHp / maxBossHp) * 100) : 100;

  // ----------------------------------------------------
  // ✨ 3. Game Logics
  // ----------------------------------------------------

  useEffect(() => {
    if (chapter && userStats && !isInitialized) {
      setBossHp(chapter.quiz_pass_score);
      setMaxBossHp(chapter.quiz_pass_score);
      setCurrentEnergy(userStats.energy);
      setIsInitialized(true);
    }
  }, [chapter, userStats, isInitialized]);

  useEffect(() => {
    (navigation as any).setParams({
      hpPercentage,
      currentEnergy,
    });
  }, [hpPercentage, currentEnergy]);

  // ฟังก์ชันอัปเดตรางวัลลง Database
  const giveRewardsToUser = async () => {
    if (!user?.id || !chapter) return;
    try {
      await completeQuizAndGiveRewards(user.id, chapterId, {
        xp: chapter.reward_xp || 0,
        coins: chapter.reward_coins || 0,
        energy: chapter.reward_energy || 0,
      });
      queryClient.invalidateQueries({ queryKey: ["userStats", user.id] });
    } catch (error) {
      console.error("Error giving rewards:", error);
    }
  };

  // ✨ ดักการกดย้อนกลับ
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      // ✅ ถ้าเป็นการกดจากปุ่ม "รับรางวัล" หรือ "ถอยตั้งหลัก" ปล่อยให้เปลี่ยนหน้าไปได้เลย
      if (isIntentionalExit.current) {
        return;
      }

      // 🛑 ถ้าเกมจบแล้ว แต่ไปเผลอกดลูกศรย้อนกลับ หรือปัดขอบจอ
      if (gameStatus === "win" || gameStatus === "lose") {
        e.preventDefault();

        // จับลูกศรย้อนกลับให้ทำงานเหมือนปุ่มด้านล่างแทน!
        if (gameStatus === "lose") {
          goBackToCourse();
        } else {
          isIntentionalExit.current = true;
          router.push(`/missionReward/${chapterId}` as any);
        }
        return;
      }

      // ⚠️ ถ้ายังเล่นอยู่ (playing) แล้วเผลอกดออก
      e.preventDefault();
      Alert.alert(
        "ยืนยันการออก",
        "คุณต้องการออกจากควิซใช่หรือไม่?\nพลังงานที่ใช้ไปแล้วจะไม่ได้รับคืนนะ",
        [
          { text: "ยกเลิก", style: "cancel", onPress: () => {} },
          {
            text: "ออกจากการเล่น",
            style: "destructive",
            onPress: () => {
              isIntentionalExit.current = true; // 🔑 ไขกุญแจ
              if (router.canDismiss()) {
                router.dismiss(2); // ถอยกลับ 2 ขั้นไปหน้า Course
              } else {
                navigation.dispatch(e.data.action);
              }
            },
          },
        ],
      );
    });

    return unsubscribe;
  }, [navigation, gameStatus, chapterId]);

  // ตรวจสอบสถานะ ชนะ/แพ้
  useEffect(() => {
    if (!isInitialized || !questions || isProcessing) return;

    if (bossHp <= 0 && gameStatus !== "win") {
      triggerWinScreen();
    } else if (currentEnergy <= 0 && gameStatus !== "lose") {
      triggerLoseScreen();
    } else if (
      currentQuestionIndex >= questions.length &&
      bossHp > 0 &&
      gameStatus !== "lose"
    ) {
      triggerLoseScreen();
    }
  }, [
    bossHp,
    currentEnergy,
    currentQuestionIndex,
    questions,
    isInitialized,
    chapter,
    isProcessing,
  ]);

  // ✨ ฟังก์ชันเตรียมหน้าชนะ (เอา async ออก แล้วเรียกเล่นเสียงง่ายๆ ได้เลย)
  const triggerWinScreen = () => {
    setGameStatus("win");
    giveRewardsToUser();

    const randomQuote =
      WIN_QUOTES[Math.floor(Math.random() * WIN_QUOTES.length)];
    setEndQuote(randomQuote);

    // เล่นเสียงชนะ
    winSound.seekTo(0);
    winSound.play();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();
  };

  // ✨ ฟังก์ชันเตรียมหน้าแพ้
  const triggerLoseScreen = () => {
    setGameStatus("lose");

    const randomQuote =
      LOSE_QUOTES[Math.floor(Math.random() * LOSE_QUOTES.length)];
    setEndQuote(randomQuote);

    // เล่นเสียงแพ้
    loseSound.seekTo(0);
    loseSound.play();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 500,
      useNativeDriver: true,
    }).start();
  };

  // ✨ ฟังก์ชันย้อนกลับ (ตอนแพ้)
  const goBackToCourse = async () => {
    isIntentionalExit.current = true;
    if (user?.id) {
      await queryClient.invalidateQueries({ queryKey: ["userStats", user.id] });
    }
    if (router.canDismiss()) {
      router.dismiss(2);
    } else {
      router.replace(`/course/${chapter?.course_id}` as any);
    }
  };

  // ✨ ฟังก์ชันเล่นเสียงกดตอบ
  const playSound = (isCorrect: boolean) => {
    if (isCorrect) {
      correctSound.seekTo(0);
      correctSound.play();
    } else {
      wrongSound.seekTo(0);
      wrongSound.play();
    }
  };

  const handleSelectAnswer = (answer: any) => {
    if (isProcessing || gameStatus !== "playing") return;

    setIsProcessing(true);
    setSelectedAnswerId(answer.id);
    setIsAnswerCorrect(answer.is_correct);

    playSound(answer.is_correct);

    // ✨ รีเซ็ตและเริ่มเล่น Animation ดาเมจ
    damageAnim.setValue(0);
    Animated.timing(damageAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const cost = chapter?.energy_cost_per_question || 1;
    setCurrentEnergy((prev) => prev - cost);

    if (user?.id) {
      deductUserEnergy(user.id, cost).then(() => {
        queryClient.invalidateQueries({ queryKey: ["userStats", user.id] });
      });
    }

    if (answer.is_correct) {
      setBossHp((prev) => Math.max(0, prev - (currentQuestion?.points || 0)));
    }

    setTimeout(() => {
      setSelectedAnswerId(null);
      setIsAnswerCorrect(null);
      setIsProcessing(false);

      if (bossHp - (answer.is_correct ? currentQuestion?.points || 0 : 0) > 0) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 1500);
  };

  // ----------------------------------------------------
  // ✨ 4. UI Styles & Render
  // ----------------------------------------------------

  const getAnswerButtonStyle = (answerId: number, isCorrect: boolean) => {
    if (selectedAnswerId === null) return "border border-primary bg-background";
    if (selectedAnswerId === answerId) {
      return isCorrect
        ? "border border-success bg-success"
        : "border border-alert bg-alert";
    }
    return "border border-text/30 bg-background opacity-50";
  };

  const getAnswerTextStyle = (answerId: number, isCorrect: boolean) => {
    if (selectedAnswerId === null) return "text-primary";
    if (selectedAnswerId === answerId) return "text-white";
    return "text-disabletext opacity-50";
  };

  const getAvatarSource = () => {
    if (isAnswerCorrect === null) return BOSS_IDLE_ANIM;
    if (isAnswerCorrect === true) return BOSS_CORRECT_ANIM;
    if (isAnswerCorrect === false) return BOSS_WRONG_ANIM;
  };

  if (isLoading || !isInitialized) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-disabletext mt-4 font-regular">
          กำลังโหลดบอส...
        </Text>
      </View>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-6">
        <Text className="text-text font-bold text-h6 text-center">
          ยังไม่มีคำถามสำหรับบทเรียนนี้
        </Text>
        <TouchableOpacity className="mt-4" onPress={() => router.back()}>
          <Text className="text-primary font-bold">กลับไปหน้าคอร์ส</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✨ 1. หน้าจอจบเกม
  if (gameStatus === "lose" || gameStatus === "win") {
    const isWin = gameStatus === "win";

    return (
      <View className="flex-1 bg-background justify-center px-6 pb-12">
        <View className="items-center justify-center mb-8 h-64">
          <LottieView
            source={isWin ? BOSS_WIN_ANIM : BOSS_LOSE_ANIM}
            autoPlay
            loop
            style={{ width: 250, height: 250 }}
          />
        </View>

        <Animated.View
          style={{ opacity: fadeAnim }}
          className="items-center px-4"
        >
          <Text
            className={`text-h3 font-bold mb-4 ${isWin ? "text-success" : "text-alert"}`}
          >
            {isWin ? "ยอดเยี่ยม!" : "พ่ายแพ้!"}
          </Text>
          <Text className="text-h6 font-regular text-text text-center leading-loose">
            {endQuote}
          </Text>
        </Animated.View>

        <View className="absolute bottom-8 left-5 right-5">
          {isWin ? (
            <TouchableOpacity
              className="bg-primary py-4 rounded-full flex-row justify-center items-center"
              onPress={() => {
                isIntentionalExit.current = true;
                router.push(`/missionReward/${chapterId}` as any);
              }}
            >
              <Text className="text-white font-bold text-body mr-2">
                รับรางวัล
              </Text>
              <Ionicons name="play-forward" size={18} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-primary py-4 rounded-full flex-row justify-center items-center"
              onPress={goBackToCourse}
            >
              <Ionicons name="arrow-back" size={18} color="white" />
              <Text className="text-white font-bold text-body ml-2">
                ถอยตั้งหลัก
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // ✨ 2. หน้าจอกำลังเล่น
  return (
    <View className="flex-1 bg-background px-5 pb-8">
      <View className="flex-1 pb-10 pt-10">
        <View className="items-center justify-center mb-6 h-40">
          <LottieView
            source={getAvatarSource()}
            autoPlay
            loop
            style={{ width: 180, height: 180 }}
          />
          {selectedAnswerId && (
            <Animated.Text
              style={{
                position: "absolute",
                zIndex: 50,
                opacity: damageAnim.interpolate({
                  inputRange: [0, 0.1, 0.7, 1],
                  outputRange: [0, 1, 1, 0],
                }),
                transform: [
                  {
                    translateY: damageAnim.interpolate({
                      inputRange: [0, 0.1, 0.3, 1],
                      outputRange: [0, -40, -30, -60],
                    }),
                  },
                  {
                    scale: damageAnim.interpolate({
                      inputRange: [0, 0.1, 0.3, 1],
                      outputRange: [0.5, 1.5, 1, 1],
                    }),
                  },
                ],
                textShadowColor: "rgba(0, 0, 0, 0.75)",
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 3,
              }}
              className={`font-black text-4xl ${
                isAnswerCorrect ? "text-alert" : "text-alert" // ตรงนี้คุณนัทกำหนด text-alert ทั้งคู่ไว้ตามโค้ดต้นฉบับครับ
              }`}
            >
              {isAnswerCorrect ? `-${currentQuestion?.points || 0}` : "Miss"}
            </Animated.Text>
          )}
        </View>

        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <Text className="text-text font-bold text-h4 mr-3">คำถาม</Text>
            <Text className="text-text font-bold text-h6 mr-3">
              {currentQuestionIndex + 1}/{questions?.length || 0}
            </Text>
            <View className="border border-primary px-2 py-0.5 rounded-full flex-row items-center">
              <Image
                source={AppIcons.HEADERS.NORMAL.ENERGY}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-primary text-body font-bold mx-1">
                {chapter?.energy_cost_per_question || 1}
              </Text>
            </View>
          </View>
          <Text className="text-text font-regular text-h6 leading-relaxed">
            {currentQuestion?.question_text}
          </Text>
        </View>

        <View className="flex-col space-y-3 gap-y-3">
          {currentQuestion?.answers?.map((ans: any) => (
            <TouchableOpacity
              key={ans.id}
              activeOpacity={0.8}
              onPress={() => handleSelectAnswer(ans)}
              disabled={isProcessing || gameStatus !== "playing"}
              className={`py-4 px-6 rounded-full items-center justify-center ${getAnswerButtonStyle(ans.id, ans.is_correct)}`}
            >
              <Text
                className={`font-bold text-body text-center ${getAnswerTextStyle(ans.id, ans.is_correct)}`}
              >
                {ans.answer_text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}
