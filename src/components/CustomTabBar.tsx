import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CustomTabBarProps extends BottomTabBarProps {}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) {
  return (
    <View className="relative h-[70px] bg-background">
      {/* Tab Bar Background */}
      <View className="absolute bottom-0 left-0 right-0 h-24 flex-row bg-background rounded-t-[20px] shadow-custom pb-2.5 pt-1 ">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const isCenter = route.name === "learn";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Skip center tab in normal flow
          if (isCenter) {
            return <View key={route.key} className="flex-1" />;
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="flex-1 justify-center items-center gap-1 relative"
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              {/* Top Indicator Bar */}
              {isFocused && (
                <View className="absolute top-0 w-8 h-0.5 bg-primary rounded-b-full mt-1 ml-0.5" />
              )}

              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? "bg-primary" : "bg-background",
                size: 24,
              })}
              <Text
                className={`font-regular text-small ${
                  isFocused ? "text-primary" : "text-disabletext"
                }`}
              >
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Center Floating Button */}
      <TouchableOpacity
        className="absolute -top-14 left-1/2 -ml-[35px] items-center"
        onPress={() => navigation.navigate("learn")}
        activeOpacity={1}
      >
        <View className="w-[70px] h-[70px] rounded-full bg-primary justify-center items-center shadow-custom border-4 border-background">
          {descriptors[state.routes[2].key]?.options.tabBarIcon?.({
            focused: state.index === 2,
            color: "#FFFFFF",
            size: 32,
          })}
        </View>
        <Text
          className={`font-regular text-small mt-1 ${
            state.index === 2 ? "text-primary" : "text-disabletext"
          }`}
        >
          เรียนรู้
        </Text>
      </TouchableOpacity>
    </View>
  );
}
