import { AppIcons } from "@/src/constants/icons";
import React, { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
    mockProfileBg,
    mockProfileImg,
    mockProfilePic,
} from "../../../constants/mockProfileImg";

type ButtonState = {
  label: string;
  variant: "used" | "equip" | "buy" | "locked";
};

const getButtonState = (item: mockProfilePic): ButtonState => {
  if (item.is_used && item.is_bought)
    return { label: "สวมใส่แล้ว", variant: "used" };
  if (item.is_bought && !item.is_used)
    return { label: "สวมใส่", variant: "equip" };
  if (!item.is_bought && item.coin !== undefined)
    return { label: "ซื้อ", variant: "buy" };
  return { label: "ล็อก", variant: "locked" };
};

const btnClass: Record<string, string> = {
  used: "w-full py-2 rounded-full items-center bg-primary",
  equip:
    "w-full py-2 rounded-full items-center bg-background border-2 border-primary",
  buy: "w-full py-2 rounded-full items-center bg-primary",
  locked: "w-full py-2 rounded-full items-center bg-disablebg",
};

const btnTextClass: Record<string, string> = {
  used: "text-white text-tiny font-bold",
  equip: "text-primary text-tiny font-bold",
  buy: "text-white text-tiny font-bold",
  locked: "text-white text-tiny font-bold",
};

const EditProfileScreen = () => {
  const [tab, setTab] = useState<"profile" | "bg">("profile");
  const [profiles, setProfiles] = useState<mockProfilePic[]>(mockProfileImg);
  const [backgrounds, setBgs] = useState<mockProfilePic[]>(mockProfileBg);

  const currentProfile = profiles.find((p) => p.is_used) ?? profiles[0];
  const currentBg = backgrounds.find((b) => b.is_used) ?? backgrounds[0];

  const handleProfileAction = (id: number) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          if (p.is_bought && !p.is_used) return { ...p, is_used: true };
          if (!p.is_bought) return { ...p, is_bought: true, is_used: true };
        }
        if (p.id !== id && p.is_used) return { ...p, is_used: false };
        return p;
      }),
    );
  };

  const handleBgAction = (id: number) => {
    setBgs((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          if (b.is_bought && !b.is_used) return { ...b, is_used: true };
          if (!b.is_bought) return { ...b, is_bought: true, is_used: true };
        }
        if (b.id !== id && b.is_used) return { ...b, is_used: false };
        return b;
      }),
    );
  };

  const items = tab === "profile" ? profiles : backgrounds;
  const handleAction = tab === "profile" ? handleProfileAction : handleBgAction;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/*---(User Pic Section)---*/}
        <View className="relative mb-16">
          {/* Background banner */}
          <View className="h-48 w-full overflow-hidden">
            <Image
              source={currentBg.image}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>

          {/* Avatar circle */}
          <View className="absolute -bottom-12 self-center">
            <View className="w-36 h-36 rounded-full border-[4px] border-background bg-card items-center justify-center overflow-hidden shadow-custom">
              <Image
                source={currentProfile.image}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>
        </View>

        {/*---(Tab Section)---*/}
        <View className="mx-4 mb-4">
          <View className="flex-row bg-background rounded-full p-1 shadow-sm">
            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-full items-center ${
                tab === "profile" ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setTab("profile")}
            >
              <Text
                className={`text-small ${
                  tab === "profile"
                    ? "text-white font-bold"
                    : "text-disabletext font-regular"
                }`}
              >
                รูปโปรไฟล์
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-2.5 rounded-full items-center ${
                tab === "bg" ? "bg-primary" : "bg-transparent"
              }`}
              onPress={() => setTab("bg")}
            >
              <Text
                className={`text-small ${
                  tab === "bg"
                    ? "text-white font-bold"
                    : "text-disabletext font-regular"
                }`}
              >
                พื้นหลัง
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*---(Grid Section)---*/}
        <View className="flex-row flex-wrap px-3 gap-3">
          {items.map((item) => {
            const btn = getButtonState(item);
            return (
              <View
                key={item.id}
                className="bg-background rounded-[20px] p-3.5 items-center gap-1.5 shadow-sm"
                style={{ width: "47%" }}
              >
                {/* Image circle */}
                <View
                  className={`w-[110px] h-[110px] rounded-full border-[2px] overflow-hidden ${
                    item.is_used ? "border-primary" : "border-primary/20"
                  }`}
                >
                  <Image
                    source={item.image}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Title */}
                <Text className="text-small font-bold text-primary">
                  {item.title}
                </Text>

                {/* Owned label */}
                {item.is_bought && (
                  <Text className="text-tiny text-disabletext font-regular">
                    ครอบครองแล้ว
                  </Text>
                )}
                {!item.is_bought && (
                  <Text className="text-tiny text-disabletext font-regular">
                    ยังไม่ครอบครอง
                  </Text>
                )}

                {/* Coin price */}
                {!item.is_bought && item.coin !== undefined && (
                  <View className="flex-row items-center gap-1">
                    <Image
                      source={AppIcons.HEADERS.NORMAL.COIN}
                      className="w-5 h-5"
                    />
                    <Text className="text-tiny font-bold text-secondary">
                      {item.coin}
                    </Text>
                  </View>
                )}

                {/* Action button */}
                <TouchableOpacity
                  className={btnClass[btn.variant]}
                  onPress={() => {
                    if (btn.variant !== "used" && btn.variant !== "locked") {
                      handleAction(item.id);
                    }
                  }}
                  disabled={btn.variant === "used" || btn.variant === "locked"}
                >
                  <Text className={btnTextClass[btn.variant]}>{btn.label}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
