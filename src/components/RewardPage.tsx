import { AppIcons } from "@/src/constants/icons";
import { supabase } from "@/src/lib/supabase";
import { claimMissionReward } from "@/src/services/missionService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const missionRewardBanner = require("../../assets/images/mission/mission-reward-banner.png");

export default function RewardPage() {
  const params = useLocalSearchParams();

  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);

  const rewards = {
    energy: Number(params.energy ?? 0),
    xp: Number(params.xp ?? 0),
    coins: Number(params.coins ?? 0),
  };

  const userMissionId = Number(params.missionId ?? 0);

  const handleClaimReward = async () => {
    if (claimed || loading) return;

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("ไม่พบผู้ใช้");
      }

      if (!userMissionId) {
        throw new Error("ไม่พบ mission ที่จะรับรางวัล");
      }

      const result = await claimMissionReward(userMissionId, user.id);

      setClaimed(true);

      Alert.alert(
        "รับรางวัลสำเร็จ",
        `ได้รับ ${result?.reward_coins ?? 0} Coins\nได้รับ ${result?.reward_xp ?? 0} XP\nได้รับ ${result?.reward_energy ?? 0} Energy`,
        [
          {
            text: "ตกลง",
            onPress: () => router.replace("/mission")
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error?.message ?? "ไม่สามารถรับรางวัลได้"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 items-center px-4 pt-8 pb-32 bg-background">
        {/* Mission banner */}
        <Image
          source={missionRewardBanner}
          className="w-80 h-80 mt-2"
          resizeMode="contain"
        />

        <Text className="text-3xl text-primary font-bold mt-4">
          ยินดีด้วย!
        </Text>

        <Text className="text-lg text-text font-regular text-center mt-2 font-foreground">
          คุณได้รับรางวัลสุดพิเศษแล้ว!
        </Text>

        {/* Reward Cards */}
        <View className="flex-row justify-between w-full mt-8 px-1 gap-2">
          {rewards.energy > 0 && (
            <View className="flex-1 flex-col rounded-xl bg-primary min-h-28">
              <Text className="text-body text-background font-bold mt-3 text-center px-2">
                พลังงาน
              </Text>

              <View className="rounded-xl bg-background py-4 m-2 flex-row items-center justify-center">
                <Text className="text-body text-primary font-bold">+</Text>
                <Image
                  source={AppIcons.HEADERS.NORMAL.ENERGY}
                  className="w-7 h-7 mx-1"
                  resizeMode="contain"
                />
                <Text className="text-body text-primary font-bold">
                  {rewards.energy}
                </Text>
              </View>
            </View>
          )}

          {rewards.xp > 0 && (
            <View className="flex-1 flex-col rounded-xl bg-alert min-h-28">
              <Text className="text-body text-background font-bold mt-3 text-center px-2">
                XP
              </Text>

              <View className="rounded-xl bg-background py-4 m-2 flex-row items-center justify-center">
                <Text className="text-body text-alert font-bold">+</Text>
                <Image
                  source={AppIcons.HEADERS.NORMAL.XP}
                  className="w-7 h-7 mx-1"
                  resizeMode="contain"
                />
                <Text className="text-body text-alert font-bold">
                  {rewards.xp}
                </Text>
              </View>
            </View>
          )}

          {rewards.coins > 0 && (
            <View className="flex-1 flex-col rounded-xl bg-secondary min-h-28">
              <Text className="text-body text-background font-bold mt-3 text-center px-2">
                เหรียญ
              </Text>

              <View className="rounded-xl bg-white py-4 m-2 flex-row items-center justify-center">
                <Text className="text-body text-secondary font-bold">+</Text>
                <Image
                  source={AppIcons.HEADERS.NORMAL.COIN}
                  className="w-7 h-7 mx-1"
                  resizeMode="contain"
                />
                <Text className="text-body text-secondary font-bold">
                  {rewards.coins}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>

    {/* Fixed Claim Button */}
    <View className="absolute bottom-0 left-0 right-0 bg-background px-6 py-5">
      <TouchableOpacity
        onPress={handleClaimReward}
        disabled={claimed || loading}
        className={`px-6 py-3 rounded-full flex-row justify-center items-center ${
          claimed || loading ? "bg-disabletext" : "bg-primary"
        }`}
      >
        <Text className="text-body text-white font-bold">
          {claimed
            ? "รับรางวัลแล้ว"
            : loading
            ? "กำลังรับรางวัล..."
            : "รับรางวัล"}
        </Text>

        {!claimed && !loading && (
          <Image
            source={AppIcons.MISSION.NORMAL.REWARD}
            className="w-7 h-7 ml-2"
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    </View>
  </View>
);
}
