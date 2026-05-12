import React from "react";
import { Text, View } from "react-native";

interface InfoCircleProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtitle2?: string;
  size?: number;
  borderColor?: string;
}

export default function InfoCircle({
  title,
  value,
  subtitle,
  subtitle2,
  size = 140,
  borderColor = "#6C5CE7",
}: InfoCircleProps) {
  return (
    <View className="items-center gap-2">
      <Text className="text-body font-regular text-text">{title}</Text>

      <View
        className="bg-background"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text className="text-primary font-bold text-h5">{value}</Text>

        {subtitle && (
          <Text className="text-disabletext font-regular text-small">
            {subtitle}
          </Text>
        )}

        {subtitle2 && (
          <Text className="text-disabletext font-regular text-small">
            {subtitle2}
          </Text>
        )}
      </View>
    </View>
  );
}