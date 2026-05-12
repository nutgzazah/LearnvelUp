import MissionStatus from "@/src/components/MissionStatus";
import { AppIcons } from "@/src/constants/icons";
import {
  claimMissionReward,
  getUserMissions,
} from "@/src/services/missionService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { usePopupStore } from "@/src/stores/usePopupStore";
import { MissionWithProgress } from "@/src/types/mission";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TimeRemaining {
  days: number;
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

  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "one_time">(
    "daily",
  );
  const [isClaiming, setIsClaiming] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ใช้ TanStack Query ดึงข้อมูล
  const { data: allMissions = [], isLoading } = useQuery({
    queryKey: ["missions", user?.id],
    queryFn: () => getUserMissions(user?.id || ""),
    enabled: !!user?.id,
  });

  // กรองข้อมูลตามแท็บและเรียงลำดับ (ยังไม่เสร็จขึ้นก่อน -> เสร็จแล้วรอรับรางวัล -> รับรางวัลแล้วไว้ล่างสุด)
  const displayedMissions = useMemo(() => {
    return allMissions
      .filter((m) => m.frequency === activeTab)
      .sort((a, b) => {
        if (a.is_claimed !== b.is_claimed) return a.is_claimed ? 1 : -1;
        if (a.is_completed !== b.is_completed) return a.is_completed ? -1 : 1;
        return 0;
      });
  }, [allMissions, activeTab]);

  // ฟังก์ชันคำนวณเวลาที่เหลือ
  const calculateTimeRemaining = () => {
    const now = new Date();
    let target = new Date();
    target.setHours(24, 0, 0, 0); // เริ่มต้นตั้งไว้เที่ยงคืนวันนี้

    if (activeTab === "weekly") {
      // หาวันอาทิตย์ที่กำลังจะถึงเวลา 23:59:59
      const day = now.getDay();
      const diffToSunday = day === 0 ? 0 : 7 - day;
      target.setDate(now.getDate() + diffToSunday);
    }

    const diff = target.getTime() - now.getTime();
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };

  useEffect(() => {
    if (activeTab === "one_time") return; // แบบถาวรไม่ต้องรัน timer

    setTimeRemaining(calculateTimeRemaining());
    const timer = setInterval(
      () => setTimeRemaining(calculateTimeRemaining()),
      1000,
    );
    return () => clearInterval(timer);
  }, [activeTab]);

  const formatTime = (value: number) => value.toString().padStart(2, "0");
  const renderCountdown = () => {
    if (activeTab === "one_time") return "ไม่มีวันหมดอายุ";
    const { days, hours, minutes, seconds } = timeRemaining;
    if (days > 0) return `${days} วัน ${formatTime(hours)} ชม.`;
    if (hours > 0)
      return `${formatTime(hours)} ชม. ${formatTime(minutes)} นาที`;
    return `${formatTime(minutes)} นาที ${formatTime(seconds)} วินาที`;
  };

  const handleMissionPress = async (mission: MissionWithProgress) => {
    if (!mission.is_completed || mission.is_claimed || isClaiming || !user?.id)
      return;

    setIsClaiming(true);
    try {
      const result = (await claimMissionReward(mission.id, user.id)) as any;

      if (result && result.success) {
        clearQueue();
        if (result.leveled_up) addPopup("levelup");

        // อัปเดตข้อมูลเพื่อให้หน้าจอเปลี่ยนสถานะทันที
        await queryClient.invalidateQueries({
          queryKey: ["missions", user.id],
        });
        await queryClient.invalidateQueries({
          queryKey: ["userStats", user.id],
        });

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
          className="w-full h-72"
          resizeMode="cover"
        />

        {/* ---( ส่วนสลับแท็บภารกิจ )--- */}
        <View className="flex-row px-4 mt-4 gap-2 border-b border-disablebg pb-3">
          <TabButton
            title="รายวัน"
            isActive={activeTab === "daily"}
            onPress={() => setActiveTab("daily")}
          />
          <TabButton
            title="รายสัปดาห์"
            isActive={activeTab === "weekly"}
            onPress={() => setActiveTab("weekly")}
          />
          <TabButton
            title="ความสำเร็จ"
            isActive={activeTab === "one_time"}
            onPress={() => setActiveTab("one_time")}
          />
        </View>

        <View className="mt-4 p-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-h6 text-text font-bold">
              {activeTab === "daily"
                ? "ภารกิจประจำวัน"
                : activeTab === "weekly"
                  ? "เป้าหมายรายสัปดาห์"
                  : "เกียรติยศถาวร"}
            </Text>
            <Image
              source={AppIcons.MISSION.NORMAL.DISPLAY}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>

          <View className="flex-row justify-between mb-6">
            <Text className="text-small font-regular text-text">
              {activeTab === "one_time" ? "สะสมได้เรื่อยๆ" : "ระยะเวลาคงเหลือ"}
            </Text>
            <View className="flex-row justify-evenly items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Text className="text-tiny font-bold text-primary">
                {renderCountdown()}
              </Text>
              {activeTab !== "one_time" && (
                <Image
                  source={AppIcons.MISSION.NORMAL.TIMER}
                  className="w-4 h-4"
                  resizeMode="contain"
                />
              )}
            </View>
          </View>

          <View className="mt-2">
            {isLoading ? (
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
            ) : displayedMissions.length === 0 ? (
              <View className="items-center justify-center py-10">
                <Text className="text-body text-disabletext">
                  ยังไม่มีภารกิจในหมวดหมู่นี้
                </Text>
              </View>
            ) : (
              displayedMissions.map((mission) => (
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

// Component ปุ่มแท็บสำหรับเลือก Frequency
const TabButton = ({ title, isActive, onPress }: any) => (
  <TouchableOpacity
    className={`flex-1 py-2 items-center rounded-full ${isActive ? "bg-primary" : "bg-transparent border border-disabletext"}`}
    onPress={onPress}
  >
    <Text
      className={`font-bold text-small ${isActive ? "text-white" : "text-disabletext"}`}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export default MissionScreen;
