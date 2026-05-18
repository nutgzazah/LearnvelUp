import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

interface CardLearnPathProps {
  coverImage: ImageSourcePropType;
  title: string;
  courseCount?: number;
  onPress?: () => void;
}

export default function CardLearnPath({
  coverImage,
  title,
  courseCount,
  onPress,
}: CardLearnPathProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // สลับ border color ตาม theme
  const layerBorderFar = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const layerBorderNear = isDark
    ? "rgba(255,255,255,0.20)"
    : "rgba(0,0,0,0.16)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const badgeBorder = isDark
    ? "rgba(255,255,255,0.15)"
    : "rgba(255,255,255,0.25)";

  return (
    <TouchableOpacity onPress={onPress} className="mx-2 my-1">
      <View className="items-center" style={{ paddingBottom: 10 }}>
        {/* Layer 3 — ล่างสุด */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: 370,
            height: "100%",
            backgroundColor: "transparent",
            borderRadius: 15,
            borderWidth: 1.5,
            borderColor: layerBorderFar,
            zIndex: 0,
          }}
        />

        {/* Layer 2 */}
        <View
          style={{
            position: "absolute",
            bottom: 5,
            width: 380,
            height: "100%",
            backgroundColor: "transparent",
            borderRadius: 15,
            borderWidth: 1.5,
            borderColor: layerBorderNear,
            zIndex: 1,
          }}
        />

        {/* Card หลัก */}
        <View
          className="bg-card p-2 rounded-[15px] items-center w-[390px]"
          style={{
            zIndex: 2,
            borderWidth: 1,
            borderColor: cardBorder,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.15 : 0.08,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <View style={{ width: 380, height: 190 }}>
            <Image
              source={coverImage}
              style={{ width: "100%", height: "100%", borderRadius: 10 }}
            />

            {courseCount !== undefined && (
              <View
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.72)",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  gap: 5,
                  borderWidth: 1,
                  borderColor: badgeBorder,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: 4.5,
                        height: 4.5,
                        backgroundColor: "white",
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </View>
                <Text
                  style={{ color: "white", fontSize: 11, fontWeight: "600" }}
                >
                  {courseCount} คอร์ส
                </Text>
              </View>
            )}
          </View>

          <View className="w-full p-2 mt-1 mb-1">
            <Text
              className="text-text font-regular text-body mx-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
