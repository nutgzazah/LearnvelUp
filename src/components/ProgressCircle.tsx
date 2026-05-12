import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface ProgressCircleProps {
  title: string;
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  borderColor?: string;
}

export default function ProgressCircle({
  title,
  completed,
  total,
  size = 140,
  strokeWidth = 14,
  color = "#6C5CE7",
  trackColor = "#E0E0E0",
  borderColor = "#6C5CE7",
}: ProgressCircleProps) {
  const outerBorderWidth = 2;
  const gap = 3; // ช่องว่างระหว่าง border กับ progress

  // Outer border radius
  const outerRadius = size / 2 - outerBorderWidth;

  // Progress ring radius
  const progressRadius =
    outerRadius - outerBorderWidth / 2 - gap - strokeWidth / 2;
  const circumference = 2 * Math.PI * progressRadius;
  const percentage = total > 0 ? completed / total : 0;
  const progressOffset = circumference - percentage * circumference;

  return (
    <View className="items-center gap-2">
      <Text className="text-body font-regular text-text">{title}</Text>

      <View
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 1. Outer border ring */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={outerRadius}
            stroke={borderColor}
            strokeWidth={outerBorderWidth}
            fill="none"
          />

          {/* 2. Progress track (background) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={progressRadius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* 3. Progress arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={progressRadius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center text */}
        <View className="absolute items-center">
          <Text className="text-body font-bold text-primary">
            {completed}/{total}
          </Text>
        </View>
      </View>
    </View>
  );
}
