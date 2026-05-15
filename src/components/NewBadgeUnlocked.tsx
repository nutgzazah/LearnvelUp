import React from "react";
import { Animated, Image, ScrollView, Text, View } from "react-native";

interface Badge {
  id: number;
  name: string;
  image_url?: string;
}

interface NewBadgeUnlockedProps {
  badges: Badge[];
  opacity: Animated.Value;
  translateY: Animated.Value;
}

export default function NewBadgeUnlocked({
  badges,
  opacity,
  translateY,
}: NewBadgeUnlockedProps) {
  if (!badges || badges.length === 0) return null;

  return (
    <Animated.View
      style={{ opacity, transform: [{ translateY }] }}
      className="mt-6 w-full"
    >
      <Text className="text-secondary font-bold text-body text-center mb-3">
        ปลดล็อกเหรียญตราใหม่!
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 12,
          paddingHorizontal: 24,
          // ถ้ามีอันเดียวให้จัดกึ่งกลาง
          flexGrow: 1,
          justifyContent: badges.length === 1 ? "center" : "flex-start",
        }}
      >
        {badges.map((badge) => (
          <View
            key={badge.id}
            className="bg-background border border-secondary/40 rounded-2xl p-4 items-center w-36 shadow-sm"
          >
            <View className="w-16 h-16 rounded-full border-2 border-secondary overflow-hidden items-center justify-center mb-2 bg-background shadow-sm">
              {badge.image_url ? (
                <Image
                  source={{ uri: badge.image_url }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              ) : (
                <Text className="text-h6">🏆</Text>
              )}
            </View>
            <Text
              className="text-text font-bold text-tiny text-center"
              numberOfLines={2}
            >
              {badge.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}
