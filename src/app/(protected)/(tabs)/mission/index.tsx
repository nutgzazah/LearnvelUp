import MissionStatus from "@/src/components/MissionStatus";
import { AppIcons } from "@/src/constants/icons";
import { supabase } from "@/src/lib/supabase";
import {
  claimMissionReward,
  ensureTodayUserMissions,
  getUserDailyMissions,
} from "@/src/services/missionService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { usePopupStore } from "@/src/stores/usePopupStore";
import { MissionWithProgress } from "@/src/types/mission";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

const MissionScreen = () => {
  const missionBanner = require("../../../../../assets/images/mission/mission-banner.png");
  const LOADING_ANIM = require("@/assets/json/loadingOtter.json");

  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { addPopup, clearQueue } = usePopupStore();
  const queryClient = useQueryClient();

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false); // ✨ ป้องกันการกดเบิ้ล

  const calculateTimeUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  const loadMissions = async () => {
    try {
      if (missions.length === 0) {
        setLoading(true);
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setMissions([]);
        return;
      }

      await ensureTodayUserMissions(user.id);
      const data = await getUserDailyMissions(user.id);
      const sorted = [...data].sort((a, b) => {
        if (a.is_claimed === b.is_claimed) return 0;
        return a.is_claimed ? 1 : -1;
      });
      setMissions(sorted);
    } catch (error) {
      console.error("loadMissions error:", error);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTimeRemaining(calculateTimeUntilMidnight());

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMissions();
    }, []),
  );

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, "0");
  };

  const formatCountdown = ({ hours, minutes, seconds }: TimeRemaining) => {
    if (hours > 0) {
      return `${formatTime(hours)} ชั่วโมง ${formatTime(minutes)} นาที`;
    }

    return `${formatTime(minutes)} นาที ${formatTime(seconds)} วินาที`;
  };

  // ✨ อัปเกรดการกดปุ่มให้เป็นการรับรางวัลและเช็คเลเวลอัป
  const handleMissionPress = async (mission: MissionWithProgress) => {
    // ถ้ายังไม่เสร็จ, รับไปแล้ว, กำลังโหลด หรือ ไม่มีข้อมูล user ให้หยุดทำ
    if (!mission.is_completed || mission.is_claimed || isClaiming || !user?.id)
      return;

    setIsClaiming(true);
    try {
      // 1. เรียกใช้งาน RPC ที่เพิ่งอัปเกรด
      const result = (await claimMissionReward(mission.id, user.id)) as any;

      if (result && result.success) {
        clearQueue(); // ล้างคิวเก่า

        // 2. ถ้ามีการอัปเลเวล ให้เอาเข้าคิวรอเลย
        if (result.leveled_up) {
          addPopup("levelup");
        }

        // 3. รีเฟรชข้อมูล Stats ทันที (เพื่อให้พลังงาน/XP มุมขวาบนอัปเดต)
        await queryClient.invalidateQueries({
          queryKey: ["userStats", user.id],
        });

        // ✨ 4. ลบ await loadMissions(); ออก แล้วใช้วิธีเปลี่ยน State ทันที (Optimistic Update)
        // เพื่อให้ปุ่มเปลี่ยนเป็นคำว่า "รับรางวัลแล้ว" ทันทีโดยไม่ต้องโหลดหน้าจอใหม่
        setMissions((prevMissions) =>
          prevMissions.map((m) =>
            m.id === mission.id ? { ...m, is_claimed: true } : m,
          ),
        );

        // 5. ส่งตัวเลขรางวัลที่ได้จาก Database ไปโชว์ในหน้ารางวัล
        router.push({
          pathname: `/missionReward/${mission.id}` as any,
          params: {
            xp: result.reward_xp || 0,
            energy: result.reward_energy || 0,
            coins: result.reward_coins || 0,
          },
        });
      } else {
        Alert.alert("แจ้งเตือน", result?.message || "ไม่สามารถรับรางวัลได้");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการรับรางวัล");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={missionBanner}
          className="w-full h-80"
          resizeMode="cover"
        />

        <View className="mt-2 p-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-h6 text-text font-regular">
              ภารกิจประจำวัน
            </Text>
            <Image
              source={AppIcons.MISSION.NORMAL.DISPLAY}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-small font-regular text-text">
              ระยะเวลาคงเหลือ
            </Text>
            <View className="flex-row justify-evenly items-center gap-2">
              <Text className="text-tiny font-regular text-text">
                {formatCountdown(timeRemaining)}
              </Text>
              <Image
                source={AppIcons.MISSION.NORMAL.TIMER}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </View>
          </View>

          <View className="mt-2">
            {loading ? (
              <View className="items-center justify-center py-10">
                <LottieView
                  source={LOADING_ANIM}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <Text className="text-primary font-bold mt-2 text-body">
                  กำลังเตรียมภารกิจ...
                </Text>
              </View>
            ) : missions.length === 0 ? (
              <View className="items-center justify-center py-10">
                <Text className="text-body text-disabletext">
                  วันนี้ยังไม่มีภารกิจ
                </Text>
              </View>
            ) : (
              missions.map((mission) => (
                <MissionStatus
                  key={mission.id}
                  mission={mission}
                  missionCompleted={AppIcons.MISSION.NORMAL.COMPLETED}
                  missionIncomplete={AppIcons.MISSION.NORMAL.INCOMPLETE}
                  missionClaimed={AppIcons.MISSION.NORMAL.CLAIMED}
                  onMissionPress={handleMissionPress}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MissionScreen;
