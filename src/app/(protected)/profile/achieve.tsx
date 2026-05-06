import AchievementCard from "@/src/components/AchieveCard";
import { AppIcons } from "@/src/constants/icons";
import { supabase } from "@/src/lib/supabase";
import {
  equipBadge,
  fetchAchievements,
  unequipBadge,
  type Achievement,
} from "@/src/services/archieveService";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

const ProfileAchievementScreen = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const loadAchievements = useCallback(async (currentUserId?: string) => {
    const targetUserId = currentUserId ?? userId;
    if (!targetUserId) return;

    try {
      const result = await fetchAchievements(targetUserId);
      setAchievements(result);
    } catch (error) {
      console.error("loadAchievements error:", error);
    }
  }, [userId]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);
      await loadAchievements(user.id);
    };

    init();
  }, [loadAchievements]);

  const handleEquipPress = async (badgeId: number) => {
    if (!userId) return;

    try {
      await equipBadge(userId, badgeId);
      await loadAchievements(userId);
    } catch (error) {
      console.error("equip badge error:", error);
    }
  };

  const handleUnequipPress = async (badgeId: number) => {
    if (!userId) return;

    try {
      await unequipBadge(userId, badgeId);
      await loadAchievements(userId);
    } catch (error) {
      console.error("unequip badge error:", error);
    }
  };

  return (
    <View className="flex-1 bg-background px-4">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row px-4 items-center gap-2">
          <Text className="text-text font-regular text-h6">ได้รับแล้ว</Text>
          <Image
            source={AppIcons.PROFILE.NORMAL.ACHIEVEMENT}
            className="w-7 h-7"
          />
        </View>

        <View className="pt-2 mb-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingEnd: 16 }}
          >
            <View className="flex-row gap-4">
              {achievements
                .filter((achieve) => achieve.is_claimed)
                .map((achieve) => (
                  <View key={achieve.id} className="items-center">
                    <AchievementCard
                      achievement={achieve}
                      onEquipPress={handleEquipPress}
                      onUnequipPress={handleUnequipPress}
                    />
                  </View>
                ))}
            </View>
          </ScrollView>
        </View>

        <View className="mb-2">
          <View className="flex-row px-4 items-center gap-2">
            <Text className="text-text font-regular text-h6">ยังไม่ได้รับ</Text>
            <Image source={AppIcons.PROFILE.NORMAL.LOCK} className="w-7 h-7" />
          </View>
        </View>

        <View className="gap-2">
          {achievements
            .filter((achieve) => !achieve.is_claimed)
            .map((achieve) => (
              <AchievementCard
                key={achieve.id}
                achievement={achieve}
                onClaimPress={(id) =>
                  router.push(`/(protected)/profile/achieveReward/${id}`)
                }
              />
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileAchievementScreen;