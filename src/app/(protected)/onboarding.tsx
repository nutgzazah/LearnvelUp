import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import {
  checkUsernameAvailable,
  updateUserProfile,
} from "@/src/services/authService";
import { fetchAllCategories } from "@/src/services/categoryService";
import { saveUserInterests } from "@/src/services/userService";
import { useAuthStore } from "@/src/stores/useAuthStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setProfileComplete = useAuthStore((state) => state.setProfileComplete);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const themeColor = isDark ? "#FFFFFF" : "#000000";
  const MAX_INTERESTS = 3;
  // ==========================================
  // States
  // ==========================================
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === "ios");
  const [ageGroup, setAgeGroup] = useState("");

  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Load categories from backend when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchAllCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  // Function to toggle category selection
  const toggleCategory = (id: number) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((catId) => catId !== id));
    } else {
      // ถ้าจะเลือกเพิ่ม -> ต้องเช็คโควต้าก่อน
      if (selectedCategories.length >= MAX_INTERESTS) {
        Alert.alert(
          "โควต้าเต็มแล้ว!",
          `คุณสามารถเลือกความสนใจได้สูงสุด ${MAX_INTERESTS} หมวดหมู่`,
        );
        return; // หยุดการทำงาน ไม่ให้เลือกเพิ่ม
      }
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  // ==========================================
  // Logic for handling steps and submission
  // ==========================================
  const handleNext = async () => {
    if (step === 1) {
      const cleanUsername = username.trim();
      if (!cleanUsername || cleanUsername.length < 3) {
        Alert.alert("แจ้งเตือน", "กรุณาตั้งชื่อผู้ใช้อย่างน้อย 3 ตัวอักษร");
        return;
      }
      setLoading(true);
      try {
        const isAvailable = await checkUsernameAvailable(cleanUsername);

        setLoading(false);

        if (!isAvailable) {
          Alert.alert("แจ้งเตือน", "ชื่อผู้ใช้นี้มีคนใช้แล้ว กรุณาเปลี่ยนใหม่");
          return;
        }
        setUsername(cleanUsername);
      } catch (err: any) {
        setLoading(false);
        Alert.alert("ข้อผิดพลาด", "ไม่สามารถตรวจสอบชื่อได้");
        return;
      }
    }

    if (step === 2 && !gender) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกเพศของคุณ");
      return;
    }

    if (step === 4 && !ageGroup) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกกลุ่มเป้าหมายของคุณ");
      return;
    }

    // If all validations pass, move to next step or finish
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    // Validation: Ensure at least one category is selected
    if (selectedCategories.length === 0) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกความสนใจอย่างน้อย 1 หมวดหมู่");
      return;
    }

    try {
      setLoading(true);
      const formattedDate = birthdate.toISOString().split("T")[0];

      const defaultAvatarMap: Record<string, number> = {
        high_school: 7,
        university: 7,
        working: 7,
        general: 7,
      };
      const initialAvatarId = defaultAvatarMap[ageGroup] || 7;

      // 1. Save user's interests (selected categories) to the database
      await saveUserInterests(user!.id, selectedCategories);

      // 2. update user profile with the collected information
      await updateUserProfile(user!.id, {
        username,
        gender: gender as "male" | "female" | "other",
        birthdate: formattedDate,
        age_group: ageGroup as
          | "high_school"
          | "university"
          | "working"
          | "general",
        equipped_avatar_id: initialAvatarId,
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
  // UI Components for each step
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

  // Interest Selection
  const renderStep5 = () => (
    <View className="flex-1 animate-fade-in pt-8">
      <Text className="text-h2 font-bold text-text text-center mb-2">
        เรื่องที่คุณสนใจ
      </Text>
      <Text className="text-body font-regular text-text text-center mb-4">
        เลือกหมวดหมู่ที่คุณอยากเรียนรู้ เพื่อให้เราจัดคอร์สที่ใช่สำหรับคุณ
      </Text>

      <View className="items-center mb-10">
        <View
          className={`px-4 py-1.5 rounded-full border ${
            selectedCategories.length === MAX_INTERESTS
              ? "bg-primary/10 border-primary"
              : "bg-card border-disabletext"
          }`}
        >
          <Text
            className={`font-bold ${
              selectedCategories.length === MAX_INTERESTS
                ? "text-primary"
                : "text-disabletext"
            }`}
          >
            เลือกแล้ว {selectedCategories.length} / {MAX_INTERESTS}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="flex-row flex-wrap justify-center gap-3">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => toggleCategory(category.id)}
                className={`px-5 py-3 rounded-full border-2 ${
                  isSelected
                    ? "bg-primary border-primary"
                    : "bg-card border-text"
                }`}
              >
                <Text
                  className={`font-bold text-center ${isSelected ? "text-white" : "text-text"}`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-8 pt-16 pb-10">
        {/* Header */}
        <View className="flex-row items-center h-12">
          {step > 1 && (
            <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
              <Feather name="chevron-left" size={28} color={themeColor} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}

        {/* Footer */}
        <View className="mt-auto pt-6">
          <View className="flex-row justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((dot) => (
              <View
                key={dot}
                className={`h-2 rounded-full ${step === dot ? "w-8 bg-primary" : "w-2 bg-text opacity-30"}`}
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
              {loading
                ? "กำลังโหลด..."
                : step === 5
                  ? "เริ่มต้นการผจญภัย!"
                  : "ถัดไป"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
