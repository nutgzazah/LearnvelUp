import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

export default function DesignSystemScreen() {
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    if (!colorScheme) {
      setColorScheme("light");
    }
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-6 pb-20 gap-6" // เพิ่ม gap ให้แต่ละการ์ดห่างกัน
    >
      {/* ---------------------------------------------------
      (Theme Switcher)
      --------------------------------------------------- */}
      <View className="bg-card p-6 rounded-2xl shadow-custom items-center">
        <Text className="text-h3 font-bold text-primary mb-2">
          Theme Control 🎨
        </Text>
        <Text className="text-body font-medium text-text mb-4">
          Status:
          <Text className="font-bold text-secondary">
            {colorScheme === "dark" ? " 🌙 Dark Mode" : " ☀️ Light Mode"}
          </Text>
        </Text>

        <View className="flex-row items-center gap-4">
          <Switch
            value={colorScheme === "dark"}
            onValueChange={toggleColorScheme}
            trackColor={{ false: "#767577", true: "#2563EB" }}
            thumbColor={"#f4f3f4"}
          />
          <TouchableOpacity
            onPress={toggleColorScheme}
            className="bg-primary px-4 py-2 rounded-full active:opacity-80"
          >
            <Text className="text-white font-bold text-small">
              Tap to Switch
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------------------------------------------------
      (Font Sizes)
      --------------------------------------------------- */}
      <View className="bg-card p-6 rounded-2xl shadow-custom">
        <Text className="text-h4 font-bold text-primary mb-4 border-b border-disablebg pb-2">
          1. Font Sizes (H1 - Tiny)
        </Text>

        <View className="gap-2">
          <Text className="text-h1 font-bold text-text">H1: Heading 48px</Text>
          <Text className="text-h2 font-bold text-text">H2: Heading 40px</Text>
          <Text className="text-h3 font-bold text-text">H3: Heading 33px</Text>
          <Text className="text-h4 font-bold text-text">H4: Heading 28px</Text>
          <Text className="text-h5 font-bold text-text">H5: Heading 23px</Text>
          <Text className="text-h6 font-bold text-text">H6: Heading 19px</Text>

          <View className="h-[1px] bg-disablebg my-2" />

          <Text className="text-body font-regular text-text">
            Body: Regular Text 16px
          </Text>
          <Text className="text-small font-regular text-text">
            Small: Small Text 13px
          </Text>
          <Text className="text-tiny font-regular text-text">
            Tiny: Tiny Text 11px
          </Text>
        </View>
      </View>

      {/* ---------------------------------------------------
      (Font Families / Styles)
      --------------------------------------------------- */}
      <View className="bg-card p-6 rounded-2xl shadow-custom">
        <Text className="text-h4 font-bold text-primary mb-4 border-b border-disablebg pb-2">
          2. Font Styles & Weights
        </Text>

        <View className="gap-3">
          <Text className="text-body text-text font-regular">
            K2D Regular (ปกติ)
          </Text>

          <Text className="text-body text-text font-medium">
            K2D Medium (กลาง)
          </Text>

          <Text className="text-body text-text font-bold">K2D Bold (หนา)</Text>

          <View className="h-[1px] bg-disablebg my-1" />

          <Text className="text-body text-text font-italic">
            K2D Italic (เอียงปกติ)
          </Text>

          <Text className="text-body text-text font-mediumitalic">
            K2D Medium Italic (เอียงกลาง)
          </Text>

          <Text className="text-body text-text font-bolditalic">
            K2D Bold Italic (เอียงหนา)
          </Text>
        </View>
      </View>

      {/* ---------------------------------------------------
       (Status Colors)
      --------------------------------------------------- */}
      <View className="bg-card p-6 rounded-2xl shadow-custom">
        <Text className="text-h4 font-bold text-primary mb-4 border-b border-disablebg pb-2">
          3. Status Colors
        </Text>

        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-success" />
            <Text className="text-body font-bold text-success">
              Success Message
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-alert" />
            <Text className="text-body font-bold text-alert">
              Alert / Error Message
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View className="w-6 h-6 rounded-full bg-disablebg" />
            <Text className="text-body font-bold text-disabletext">
              Disabled State
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
