import AchievementCard from "@/src/components/AchieveCard";
import { AppIcons } from "@/src/constants/icons";
import { mockAchievements } from "@/src/constants/mockAchivement";
import { router } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const ProfileAchievementScreen = () => {
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
              {mockAchievements
                .filter((achieve) => achieve.is_claimed)
                .map((achieve) => (
                  <View key={achieve.id} className="items-center">
                    <AchievementCard achievement={achieve} />
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
          {mockAchievements
            .filter((achieve) => !achieve.is_claimed)
            .map((achieve) => (
              <AchievementCard
                key={achieve.id}
                achievement={achieve}
                onClaimPress={(id) =>
                  router.push(`/(protected)/profile/achieveReward/${id}`)
                }
                onRemovePress={(id) => console.log("Remove:", id)}
              />
            ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileAchievementScreen;
