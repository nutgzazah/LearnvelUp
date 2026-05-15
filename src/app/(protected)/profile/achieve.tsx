import AchievementCard from "@/src/components/AchieveCard";
import { AppIcons } from "@/src/constants/icons";
import {
  equipBadge,
  fetchAchievements,
  unequipBadge,
} from "@/src/services/archieveService";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LottieView from "lottie-react-native";
import React from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

const LOADING_ANIM = require("@/assets/json/loadingOtter.json");

export default function ProfileAchievementScreen() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: () => fetchAchievements(user?.id as string),
    enabled: !!user?.id,
  });

  const equipMutation = useMutation({
    mutationFn: (badgeId: number) => equipBadge(user?.id as string, badgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements", user?.id] });
    },
    onError: (error: any) => {
      Alert.alert("แจ้งเตือน", error.message || "ไม่สามารถสวมใส่ได้");
    },
  });

  const unequipMutation = useMutation({
    mutationFn: (badgeId: number) => unequipBadge(user?.id as string, badgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements", user?.id] });
    },
  });

  const handleEquipPress = (badgeId: number) => {
    const equippedCount = achievements.filter((a) => a.is_equipped).length;
    if (equippedCount >= 3) {
      Alert.alert(
        "สวมใส่เต็มแล้ว",
        "คุณสามารถโชว์เหรียญตราได้สูงสุด 3 อันเท่านั้น กรุณาถอดอันเดิมออกก่อนนะ 🦦",
      );
      return;
    }
    equipMutation.mutate(badgeId);
  };

  const handleUnequipPress = (badgeId: number) => {
    unequipMutation.mutate(badgeId);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <LottieView
          source={LOADING_ANIM}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
        <Text className="text-primary font-bold mt-2 text-body">
          กำลังโหลดเหรียญตรา...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---( ส่วน: ได้รับแล้ว )--- */}
        <View className="flex-row px-6 items-center gap-2 mb-2">
          <Text className="text-text font-bold text-h6">ได้รับแล้ว</Text>
          <Image
            source={AppIcons.PROFILE.NORMAL.ACHIEVEMENT}
            className="w-7 h-7"
          />
        </View>

        <View className="pt-2 mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <View className="flex-row gap-4">
              {achievements
                .filter((achieve) => achieve.is_claimed)
                .map((achieve) => (
                  <View key={achieve.id} className="items-center w-32">
                    <AchievementCard
                      achievement={achieve}
                      onEquipPress={handleEquipPress}
                      onUnequipPress={handleUnequipPress}
                    />
                  </View>
                ))}
              {achievements.filter((achieve) => achieve.is_claimed).length ===
                0 && (
                <View className="px-4 py-8">
                  <Text className="text-disabletext">
                    ยังไม่มีเหรียญตรา ลองไปเรียนหรือทำภารกิจดูสิ!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>

        {/* ---( ส่วน: ยังไม่ได้รับ )--- */}
        <View className="mb-4">
          <View className="flex-row px-6 items-center gap-2 border-t border-disablebg pt-6">
            <Text className="text-text font-bold text-h6">ยังไม่ได้รับ</Text>
            <Image
              source={AppIcons.PROFILE.NORMAL.LOCK}
              className="w-6 h-6 opacity-80"
            />
          </View>
        </View>

        <View className="gap-2">
          {achievements
            .filter((achieve) => !achieve.is_claimed)
            .map((achieve) => (
              <AchievementCard key={achieve.id} achievement={achieve} />
            ))}
        </View>
      </ScrollView>
    </View>
  );
}
