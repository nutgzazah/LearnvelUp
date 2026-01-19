import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../../stores/useAuthStore";

import otterLogo from "../../../assets/avatar/otterPrimaryBG.png";
const otterImage = otterLogo;

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("แจ้งเตือน", "รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      setLoading(true);
      await register(email, password, username);
      Alert.alert("สำเร็จ", "สร้างบัญชีเรียบร้อยแล้ว", [
        { text: "ตกลง", onPress: () => router.replace("/") },
      ]);
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถลงทะเบียนได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View className="h-[24vh] bg-primary items-center justify-end pb-10" />
        <View className="flex-1 bg-background px-8 pt-24 ">
          <View className="absolute self-center -top-24 ">
            <View className="w-48 h-48 rounded-full items-center justify-center overflow-hidden">
              <Image
                source={otterImage}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          <Text className="text-h2 font-bold text-text text-center mb-8 mt-4">
            ลงทะเบียน
          </Text>

          <View className="gap-4">
            <TextInput
              className="bg-card border border-text rounded-full px-6 py-4 text-body font-regular text-text"
              placeholder="ผู้ใช้งาน"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              className="bg-card border border-text rounded-full px-6 py-4 text-body font-regular text-text"
              placeholder="อีเมล"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              className="bg-card border border-text rounded-full px-6 py-4 text-body font-regular text-text"
              placeholder="รหัสผ่าน"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              className="bg-card border border-text rounded-full px-6 py-4 text-body font-regular text-text"
              placeholder="ยืนยันรหัสผ่าน"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`w-full bg-primary rounded-full py-4 items-center mt-8 shadow-custom active:opacity-90 ${loading ? "opacity-70" : ""}`}
          >
            <Text className="text-white font-bold text-h5">
              {loading ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8 gap-2 mb-10">
            <Text className="text-text font-regular">มีบัญชีแล้วใช่ไหม,</Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">เข้าสู่ระบบ</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
