import { AppIcons } from "@/src/constants/icons";
import {
    Image,
    ImageSourcePropType,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type CourseStatus = "locked" | "unlocked" | "enrolled" | "completed";

interface CourseStageCardProps {
  courseImage: ImageSourcePropType;
  avatarImage?: ImageSourcePropType;
  courseName: string;
  coins?: number | null;
  sequenceOrder: number;
  isRequired?: boolean;
  status?: CourseStatus;
  progressPercent?: number;
  onPress?: () => void;
  showTopConnector?: boolean;
  showBottomConnector?: boolean;
}

// ── Circle (เหมือนเดิมทุกอย่าง) ──────────────────────────────────────────────
function StageCircle({ status }: { status: CourseStatus }) {
  const circleStyle = {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderBottomWidth: 4,
  };

  if (status === "locked") {
    return (
      <View
        style={[circleStyle, { backgroundColor: "#D1D5DB", borderBottomColor: "#D1D5DB" }]}
        className="items-center justify-center"
      >
        <Text style={{ fontSize: 24 }}>🔒</Text>
      </View>
    );
  }

  if (status === "completed") {
    return (
      <View
        style={[circleStyle, { backgroundColor: "#22C55E", borderBottomColor: "#22C55E" }]}
        className="items-center justify-center"
      >
        <Text style={{ fontSize: 24 }}>✅</Text>
      </View>
    );
  }

  if (status === "enrolled") {
    return (
      <View
        style={[circleStyle, { backgroundColor: "#6366F1", borderBottomColor: "#6366F1" }]}
        className="items-center justify-center"
      >
        <Image
          source={require("../../assets/images/nav/learn-icon.png")}
          style={{ width: 28, height: 28 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // unlocked
  return (
    <View
      style={[circleStyle, { backgroundColor: "#6366F1", borderBottomColor: "#6366F1" }]}
      className="items-center justify-center"
    >
      <Image
        source={AppIcons.HEADERS.NORMAL.COIN}
        style={{ width: 28, height: 28 }}
        resizeMode="contain"
      />
    </View>
  );
}

// ── Status metadata (ขวาของ circle) ──────────────────────────────────────────
function StatusMetadata({
  status,
  progressPercent = 0,
  coins,
}: {
  status: CourseStatus;
  progressPercent?: number;
  coins?: number | null;
}) {
  if (status === "completed") {
    return (
      <View
        style={{
          backgroundColor: "#DCFCE7",
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Text style={{ color: "#16A34A", fontWeight: "700", fontSize: 13 }}>
          เสร็จแล้ว
        </Text>
      </View>
    );
  }

  if (status === "enrolled") {
    const pct = Math.min(Math.max(progressPercent, 0), 100);
    return (
      <View style={{ width: 100 }}>
        <View
          style={{
            height: 8,
            backgroundColor: "#E5E7EB",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${pct}%`,
              backgroundColor: "#78350F",
              borderRadius: 4,
            }}
          />
        </View>
        <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 4 }}>
          {pct}% · กำลังเรียน
        </Text>
      </View>
    );
  }

  if (status === "locked") {
    return (
      <View
        style={{
          backgroundColor: "#F3F4F6",
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Text style={{ color: "#6B7280", fontWeight: "600", fontSize: 13 }}>
          ล็อก
        </Text>
      </View>
    );
  }

  // unlocked — coin badge
  return (
    <View
      style={{
        backgroundColor: "#EEF2FF",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Image
        source={AppIcons.HEADERS.NORMAL.COIN}
        style={{ width: 15, height: 15 }}
        resizeMode="contain"
      />
      <Text style={{ color: "#4F46E5", fontWeight: "700", fontSize: 13 }}>
        {coins ?? 0}
      </Text>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CourseStageCard({
  courseImage,
  avatarImage,
  courseName,
  coins = 0,
  sequenceOrder,
  isRequired = true,
  status = "locked",
  progressPercent = 0,
  onPress,
  showTopConnector = false,
  showBottomConnector = false,
}: CourseStageCardProps) {
  const isLocked = status === "locked";
  const CIRCLE_SIZE = 56;
  const RIGHT_METADATA_WIDTH = 110;
  const ROOT_PADDING_RIGHT = 16;
  const CIRCLE_MARGIN_RIGHT = 10;

  const circleCenterFromRight =
    ROOT_PADDING_RIGHT +
    RIGHT_METADATA_WIDTH +
    CIRCLE_MARGIN_RIGHT +
    CIRCLE_SIZE / 2;

  return (
    <View
      className="flex-row items-center w-full px-4 py-2 relative"
      style={{ opacity: isLocked ? 0.55 : 1 }}
    >
       {(showTopConnector || showBottomConnector) && (
  <View
    pointerEvents="none"
    style={{
      position: "absolute",
      right: circleCenterFromRight - 1,
      top: showTopConnector ? 0 : "50%",
      bottom: showBottomConnector ? 0 : "50%",
      borderLeftWidth: 2,
      borderStyle: "dashed",
      borderColor: "#C7C7D1",
      zIndex: 0,
    }}
  />
)}
      {/* ── Left: Original course card ───────────────────────────── */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={isLocked ? 1 : 0.85}
        disabled={isLocked}
        style={{ flex: 1 }}
      >
        <View className="bg-card rounded-[18px] p-2 shadow-sm">
          {/* Cover image — เหมือนเดิม แค่ลด height ให้พอดีกับ row */}
          <Image
            source={courseImage}
            className="w-full rounded-[14px]"
            style={{ height: 110 }}
            resizeMode="cover"
          />
          {/* Avatar + Name + Coins — layout เหมือนเดิมทุกอย่าง */}
          <View className="pt-2 px-1">
            <View className="flex-row items-center justify-between mt-2">
              {avatarImage ? (
                <Image
                  source={avatarImage}
                  className="w-7 h-7 rounded-full border border-primary"
                />
              ) : (
                <View className="w-7 h-7 rounded-full bg-gray-200" />
              )}
              <Text
                className="text-text font-regular flex-1 mx-2"
                style={{ fontSize: 12 }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {courseName}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Middle: Circle ───────────────────────────────────────── */}
      <TouchableOpacity
        style={{ marginHorizontal: 10, zIndex: 2 }}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={isLocked ? 1 : 0.85}
      >
        <StageCircle status={status} />
      </TouchableOpacity>

      {/* ── Right: Status metadata ───────────────────────────────── */}
      <View style={{ width: 110, alignItems: "flex-start" }}>
        <StatusMetadata
          status={status}
          progressPercent={progressPercent}
          coins={coins}
        />
      </View>
    </View>
  );
}

