import MissionStatus from "@/src/components/MissionStatus";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { MOCK_MISSIONS } from "../../../../constants/mockMissionData";
import { MissionWithProgress } from "../../../../types/mission";

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

const MissionScreen = () => {
  const missionBanner = require("../../../../../assets/images/mission/mission-banner.png");
  const missionIcon = require("../../../../../assets/images/mission/mission-icon-display.png");
  const missionTimerIcon = require("../../../../../assets/images/mission/mission-timer.png");
  const missionCompleted = require("../../../../../assets/images/mission/mission-complete.png");
  const missionIncomplete = require("../../../../../assets/images/mission/mission-incomplete.png");

  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Sample missions data - Replace with API call
  const [missions, setMissions] =
    useState<MissionWithProgress[]>(MOCK_MISSIONS);

  // Calculate time
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

  // Initialize and update countdown timer
  useEffect(() => {
    // Set initial time
    setTimeRemaining(calculateTimeUntilMidnight());

    // Update every second
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time with leading zeros
  const formatTime = (value: number): string => {
    return value.toString().padStart(2, "0");
  };

  const handleMissionPress = (mission: MissionWithProgress) => {
    if (!mission.is_completed) return;

    const params = new URLSearchParams({
      missionId: mission.id.toString(),
      missionName: mission.name,
      ...(mission.reward_energy && {
        energy: mission.reward_energy.toString(),
      }),
      ...(mission.reward_xp && { xp: mission.reward_xp.toString() }),
      ...(mission.reward_coins && { coins: mission.reward_coins.toString() }),
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
        {/* ---(Mission Banner)--- */}
        <Image
          source={missionBanner}
          className="w-full h-80"
          resizeMode="cover"
        />

        <View className="mt-2 p-4">
          {/* ---(Daily Mission Header)--- */}
          <View className="flex-row items-center mb-2">
            <Text className="text-h6 text-text font-regular">
              ภารกิจประจำวัน
            </Text>
            <Image
              source={missionIcon}
              className="w-7 h-7 ml-2"
              resizeMode="contain"
            />
          </View>

          {/* ---(Time Remaining)--- */}
          <View className="flex-row justify-between mb-6">
            <Text className="text-small font-regular text-text">
              ระยะเวลาคงเหลือ
            </Text>
            <View className="flex-row justify-evenly items-center gap-2">
              <Text className="text-tiny font-regular text-text">
                {formatTime(timeRemaining.hours)} ชั่วโมง{" "}
                {formatTime(timeRemaining.minutes)} นาที{" "}
                {formatTime(timeRemaining.seconds)} วินาที
              </Text>
              <Image
                source={missionTimerIcon}
                className="w-5 h-5"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* ---(Mission List)--- */}
          <View className="mt-2">
            {missions.map((mission) => (
              <MissionStatus
                key={mission.id}
                mission={mission}
                missionCompleted={missionCompleted}
                missionIncomplete={missionIncomplete}
                onMissionPress={handleMissionPress}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default MissionScreen;
