import MissionStatus from "@/src/components/MissionStatus";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
  const [missions, setMissions] = useState([
    {
      id: 1,
      title: "ล็อกอินประจำวัน",
      progress: 100,
      completed: true,
      current: 1,
      target: 1,
      unit: "วัน",
    },
    {
      id: 2,
      title: "เข้าดูวีดิโอ 2 บท",
      progress: 50,
      completed: false,
      current: 1,
      target: 2,
      unit: "บท",
    },
    {
      id: 3,
      title: "ตอบคำถามถูก 10 ข้อ",
      progress: 50,
      completed: false,
      current: 5,
      target: 10,
      unit: "ข้อ",
    },
    {
      id: 4,
      title: "โค้นบอส 5 ตัว",
      progress: 20,
      completed: false,
      current: 1,
      target: 5,
      unit: "ตัว",
    },
    {
      id: 5,
      title: "สะสมคะแนนให้ได้ 1,000 คะแนน",
      progress: 70,
      completed: false,
      current: 700,
      target: 1000,
      unit: "คะแนน",
    },
  ]);

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
        <View className="mt-4 p-4">
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
          {/* ---(Daily Mission Time Remaining)--- */}
          <View className="flex-row justify-between">
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

          {/* ---(Daily Mission List)--- */}
          <View className="mt-4 ">
            {missions.map((mission) => (
              <MissionStatus
                key={mission.id}
                mission={mission}
                missionCompleted={missionCompleted}
                missionIncomplete={missionIncomplete}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push("/missionReward/[id]")}>
          <Text className="text-center text-primary font-regular mb-4">
            ดูรางวัลทั้งหมด &gt;
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MissionScreen;
