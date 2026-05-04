import MissionStatus from "@/src/components/MissionStatus";
import { AppIcons } from "@/src/constants/icons";
import { supabase } from "@/src/lib/supabase";
import { ensureTodayUserMissions, getUserDailyMissions } from "@/src/services/missionService";
import { MissionWithProgress } from "@/src/types/mission";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

const MissionScreen = () => {
  const missionBanner = require("../../../../../assets/images/mission/mission-banner.png");

  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [missions, setMissions] = useState<MissionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);

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
    }, [])
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

  

  const handleMissionPress = (mission: MissionWithProgress) => {
    if (!mission.is_completed) return;

    const params = new URLSearchParams({
      missionId: mission.id.toString(),
      missionName: mission.name,
      ...(mission.reward_energy > 0 && {
        energy: mission.reward_energy.toString(),
      }),
      ...(mission.reward_xp > 0 && { xp: mission.reward_xp.toString() }),
      ...(mission.reward_coins > 0 && {
        coins: mission.reward_coins.toString(),
      }),
      navigationType: "back",
      returnPath: "/(tabs)/mission",
    });

    router.push(`/missionReward/${mission.id}?${params.toString()}`);
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
              <Text className="text-small text-disabletext">กำลังโหลดภารกิจ...</Text>
            ) : missions.length === 0 ? (
              <Text className="text-small text-disabletext">
                วันนี้ยังไม่มีภารกิจ
              </Text>
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