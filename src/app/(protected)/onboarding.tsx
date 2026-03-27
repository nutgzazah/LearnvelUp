import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { supabase } from "@/src/lib/supabase";
import { updateUserProfile } from "@/src/services/authService";
import { useAuthStore } from "@/src/stores/useAuthStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setProfileComplete = useAuthStore((state) => state.setProfileComplete);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColor = isDark ? "#FFFFFF" : "#000000";
  // ==========================================
  // ✨ States สำหรับเก็บข้อมูลแต่ละหน้า
  // ==========================================
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");

  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios"); // iOS โชว์ spinner ตลอดได้ แต่ Android ต้องกดปุ่มก่อน

  const [ageGroup, setAgeGroup] = useState("");

  // ==========================================
  // ✨ Logic การเปลี่ยนหน้าและตรวจสอบข้อมูล
  // ==========================================
  const handleNext = async () => {
    // ==========================================
    // 🔍 STEP 1: ตรวจสอบชื่อผู้ใช้ด้วย RPC (ปลอดภัย 100%)
    // ==========================================
    if (step === 1) {
      const cleanUsername = username.trim();

      if (!cleanUsername || cleanUsername.length < 3) {
        Alert.alert("แจ้งเตือน", "กรุณาตั้งชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร");
        return;
      }

      setLoading(true);

      try {
        // ✨ ยิงไปถาม "ตู้ยาม" ที่เราสร้างไว้
        const { data: isAvailable, error } = await supabase.rpc(
          "check_username_available",
          { requested_username: cleanUsername }, // ส่งชื่อที่พิมพ์ไปให้ตู้ยาม
        );

        setLoading(false);

        if (error) throw error;

        // ถ้าตู้ยามบอกว่า "ไม่ว่าง (false)"
        if (!isAvailable) {
          Alert.alert("แจ้งเตือน", "ชื่อผู้ใช้นี้มีคนใช้แล้ว กรุณาเปลี่ยนใหม่");
          return;
        }

        // ถ้าผ่าน (isAvailable === true) ให้ลุยต่อ!
        setUsername(cleanUsername);
      } catch (err: any) {
        setLoading(false);
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถตรวจสอบชื่อได้ กรุณาลองใหม่");
        return;
      }
    }

    // ==========================================
    // 🔍 STEP 2: ตรวจสอบเพศ
    // ==========================================
    if (step === 2 && !gender) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกเพศของคุณ");
      return;
    }

    // ไปหน้าถัดไป หรือ บันทึกข้อมูล
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    if (!ageGroup) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกกลุ่มเป้าหมายของคุณ");
      return;
    }

    try {
      setLoading(true);
      // แปลง Date object เป็นสตริง YYYY-MM-DD
      const formattedDate = birthdate.toISOString().split("T")[0];

      // ✨ 1. สร้างตัวแมปปิ้ง กลุ่มเป้าหมาย -> ID ไอเทม
      // (อิงจาก ID ในฐานข้อมูลที่คุณสร้างไว้: 4=นักเรียน, 5=นักศึกษา, 6=ออฟฟิศ, 7=ทั่วไป)
      const defaultAvatarMap: Record<string, number> = {
        high_school: 4,
        university: 5,
        working: 6,
        general: 7,
      };

      // หา ID อวตารเริ่มต้น ถ้าหาไม่เจอให้ใช้ 7 (ทั่วไป) เป็นค่ากันเหนียว
      const initialAvatarId = defaultAvatarMap[ageGroup] || 7;

      // ✨ 2. ส่ง equipped_avatar_id ไปบันทึกลง Database
      await updateUserProfile(user!.id, {
        username,
        gender,
        birthdate: formattedDate,
        age_group: ageGroup,
        equipped_avatar_id: initialAvatarId, // เพิ่มบรรทัดนี้เข้ามาครับ!
      });

      if (setProfileComplete) setProfileComplete();

      Alert.alert("สำเร็จ!", "ยินดีต้อนรับสู่แอปของเรา", [
        {
          text: "เริ่มลุยกันเลย!",
          onPress: () => router.replace("/(protected)/(tabs)"),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error.message || "ไม่สามารถบันทึกข้อมูลได้",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ✨ UI Components ย่อยแต่ละหน้า
  // ==========================================
  const renderStep1 = () => (
    <View className="flex-1 justify-center animate-fade-in">
      <Text className="text-h2 font-bold text-text text-center mb-4">
        ตั้งชื่อผู้ใช้ของคุณ
      </Text>
      <Text className="text-body font-regular text-text text-center mb-10">
        ชื่อนี้จะแสดงให้เพื่อนๆ และคนอื่นเห็นในระบบ
      </Text>
      <TextInput
        className="bg-card border border-text rounded-2xl px-6 py-5 text-body font-regular text-text text-center"
        placeholder="เช่น LearnvelUpMaster"
        placeholderTextColor="#9CA3AF"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        maxLength={20}
      />
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1 justify-center animate-fade-in">
      <Text className="text-h2 font-bold text-text text-center mb-4">
        คุณคือเพศอะไร?
      </Text>
      <Text className="text-body font-regular text-text text-center mb-10">
        ข้อมูลนี้จะช่วยให้เราแนะนำคอร์สได้ดีขึ้น
      </Text>
      <View className="gap-4">
        {[
          { id: "male", label: "ชาย", icon: "user" },
          { id: "female", label: "หญิง", icon: "user" },
          { id: "other", label: "อื่นๆ / ไม่ระบุ", icon: "users" },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setGender(item.id)}
            className={`flex-row items-center justify-between p-5 rounded-2xl border-2 ${
              gender === item.id
                ? "bg-primary border-primary"
                : "bg-card border-text"
            }`}
          >
            <View className="flex-row items-center gap-4">
              <Feather
                name={item.icon as any}
                size={24}
                color={gender === item.id ? "white" : "#9CA3AF"}
              />
              <Text
                className={`text-h5 font-bold ${gender === item.id ? "text-white" : "text-text"}`}
              >
                {item.label}
              </Text>
            </View>
            {gender === item.id && (
              <Feather name="check-circle" size={24} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1 justify-center animate-fade-in">
      <Text className="text-h2 font-bold text-text text-center mb-4">
        วันเกิดของคุณ
      </Text>
      <Text className="text-body font-regular text-text text-center mb-10">
        เพื่อใช้ในการมอบของขวัญวันเกิดสุดพิเศษ
      </Text>

      {Platform.OS === "android" && (
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-card border-2 border-primary rounded-2xl p-5 items-center mb-6"
        >
          <Text className="text-h5 font-bold text-primary">
            {birthdate.toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </TouchableOpacity>
      )}

      {(showDatePicker || Platform.OS === "ios") && (
        <View className="bg-card rounded-2xl p-4 border border-text">
          <DateTimePicker
            value={birthdate}
            mode="date"
            display="spinner"
            // 👇 เพิ่ม 2 บรรทัดนี้เข้าไปครับ
            themeVariant={isDark ? "dark" : "light"}
            textColor={themeColor}
            onChange={(event, selectedDate) => {
              if (Platform.OS === "android") setShowDatePicker(false);
              if (selectedDate) setBirthdate(selectedDate);
            }}
            maximumDate={new Date()}
          />
        </View>
      )}
    </View>
  );

  const renderStep4 = () => (
    <View className="flex-1 justify-center animate-fade-in">
      <Text className="text-h2 font-bold text-text text-center mb-4">
        สถานะปัจจุบันของคุณ
      </Text>
      <Text className="text-body font-regular text-text text-center mb-10">
        เลือกกลุ่มที่ตรงกับตัวคุณมากที่สุด
      </Text>
      <View className="flex-row flex-wrap gap-4 justify-between">
        {[
          { id: "high_school", label: "นักเรียนมัธยม", icon: "book" },
          { id: "university", label: "นักศึกษามหาลัย", icon: "award" },
          { id: "working", label: "คนทำงาน", icon: "briefcase" },
          { id: "general", label: "บุคคลทั่วไป", icon: "globe" },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setAgeGroup(item.id)}
            className={`w-[47%] p-6 rounded-2xl border-2 items-center gap-4 ${
              ageGroup === item.id
                ? "bg-primary border-primary"
                : "bg-card border-text"
            }`}
          >
            <Feather
              name={item.icon as any}
              size={32}
              color={ageGroup === item.id ? "white" : "#9CA3AF"}
            />
            <Text
              className={`text-body font-bold text-center ${ageGroup === item.id ? "text-white" : "text-text"}`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-8 pt-16 pb-10">
        {/* ✨ Header: ปุ่มย้อนกลับ */}
        <View className="flex-row items-center h-12">
          {step > 1 && (
            <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
              {/* เปลี่ยนสีไอคอนตรงนี้ 👇 */}
              <Feather name="chevron-left" size={28} color={themeColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* ✨ Content Area */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}

        {/* ✨ Footer: Dots และปุ่มถัดไป */}
        <View className="mt-auto pt-6">
          <View className="flex-row justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((dot) => (
              <View
                key={dot}
                className={`h-2 rounded-full ${
                  step === dot ? "w-8 bg-primary" : "w-2 bg-text opacity-30"
                }`}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            disabled={loading}
            className={`w-full rounded-full py-4 items-center shadow-custom active:opacity-90 ${
              loading ? "bg-disablebg" : "bg-primary"
            }`}
          >
            <Text
              className={`font-bold text-h5 ${loading ? "text-disabletext" : "text-white"}`}
            >
              {loading ? "กำลังโหลด..." : step === 4 ? "ยืนยันข้อมูล" : "ถัดไป"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
