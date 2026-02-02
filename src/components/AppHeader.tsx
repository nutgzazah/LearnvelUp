import { useSegments } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ICONS = {
  fire: require("../../assets/images/fire-icon.png"),
  coin: require("../../assets/images/coin-icon.png"),
  energy: require("../../assets/images/energy-icon.png"),
  search: require("../../assets/images/search-icon.png"),
  edit: require("../../assets/images/profile-edit-icon.png"),
};

const HEADER_CONFIG = {
  index: {
    title: "หน้าหลัก",
    actions: ["fire", "coin", "energy"],
  },
  search: {
    title: "ค้นหา",
    actions: ["coin", "search"],
  },
  learn: {
    title: "เรียนรู้",
    actions: ["fire", "coin", "energy"],
  },
  mission: {
    title: "ภารกิจ",
    actions: ["coin", "energy"],
  },
  profile: {
    title: "โปรไฟล์",
    actions: ["edit"],
  },
};

export default function AppHeader() {
  const segments = useSegments();
  const current = segments.at(-1) ?? "index";

  const { title, actions } =
    HEADER_CONFIG[current as keyof typeof HEADER_CONFIG] ?? HEADER_CONFIG.index;

  const renderAction = (key: string) => {
    if (key === "fire")
      return (
        <HeaderStat key={key} icon={ICONS.fire} value="1" color="text-alert" />
      );

    if (key === "coin")
      return (
        <HeaderStat
          key={key}
          icon={ICONS.coin}
          value="0"
          color="text-secondary"
        />
      );

    if (key === "energy")
      return (
        <HeaderStat
          key={key}
          icon={ICONS.energy}
          value="20"
          color="text-primary"
        />
      );

    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.7}
        className="
        w-7 h-7 mx-2 p-1
        rounded-[15px]
        bg-gray-100
        items-center justify-center
      "
        onPress={() => {
          console.log(`${key} pressed`);
        }}
      >
        <Image
          source={ICONS[key as keyof typeof ICONS]}
          className="w-5 h-5"
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-background flex-row items-center justify-between pt-8 px-6 h-28 border-b-disablebg border-b-2 dark:border-b-black dark:border-b-2">
      <Text className="text-h6 font-regular text-text">{title}</Text>

      <View className="flex-row items-center">{actions.map(renderAction)}</View>
    </View>
  );
}

/* --- Small Components --- */

function HeaderStat({
  icon,
  value,
  color,
}: {
  icon: any;
  value: string;
  color: string;
}) {
  return (
    <View className="flex-row items-center px-1">
      <Image source={icon} className="w-5 h-5 mx-1" />
      <Text className={`text-small font-bold ${color}`}>{value}</Text>
    </View>
  );
}
