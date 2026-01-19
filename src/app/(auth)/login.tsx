import { Link } from "expo-router";
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

import otterLogo from "../../../assets/avatar/otterPrimaryBG.png";
const otterImage = otterLogo;

import { useAuthStore } from "../../stores/useAuthStore";

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      let errorMessage = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      const msg = error.message || "";

      if (msg.includes("Invalid login credentials")) {
        errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      } else if (msg.includes("Email not confirmed")) {
        errorMessage = "กรุณายืนยันอีเมลของท่าน";
      } else if (msg.includes("Too many requests")) {
        errorMessage = "ทำรายการถี่เกินไป กรุณารอสักครู่";
      } else {
        errorMessage = msg;
      }

      Alert.alert("เข้าสู่ระบบไม่สำเร็จ", errorMessage);
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
        <View className="h-[24vh] bg-primary items-center justify-end pb-10"></View>

        <View className="flex-1 bg-background px-8 pt-24">
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
            เข้าสู่ระบบ
          </Text>

          <View className="gap-4">
            <TextInput
              className="bg-card border border-text rounded-full px-6 py-4 text-body font-regular text-text"
              placeholder="อีเมล"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View>
              <TextInput
                className="bg-card border border-text rounded-full px-6 py-4 text-body font-regular text-text"
                placeholder="รหัสผ่าน"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity className="self-end mt-2">
                <Text className="text-primary font-bold text-small">
                  ลืมรหัสผ่าน?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`w-full bg-primary rounded-full py-4 items-center mt-8 shadow-custom active:opacity-90 ${loading ? "opacity-70" : ""}`}
          >
            <Text className="text-white font-bold text-h5">
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-8 gap-2 mb-10">
            <Text className="text-text font-regular">ยังไม่มีบัญชีใช่ไหม,</Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary font-bold">ลงทะเบียน</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
