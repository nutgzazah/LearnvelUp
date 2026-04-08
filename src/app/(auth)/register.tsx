import { Feather } from "@expo/vector-icons";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  //  Logic (Validation)
  // ==========================================

  // 1. Check Email Format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);
  const showEmailError = emailTouched && email.length > 0 && !isValidEmail;

  //  2. Check password
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);

  const isValidPassword = hasMinLength && hasLetter && hasDigit;
  const showPasswordError =
    passwordTouched && password.length > 0 && !isValidPassword;

  const getPasswordErrorMessage = () => {
    if (!hasMinLength) return "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร";
    if (!hasLetter || !hasDigit)
      return "ต้องมีตัวอักษรภาษาอังกฤษและตัวเลขอย่างน้อย 1 ตัว";
    return "";
  };

  // 3. Check confirm password
  const isValidConfirm =
    confirmPassword.length > 0 && password === confirmPassword;
  const showConfirmError =
    confirmTouched &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  // 4. Enable button when all fields are valid
  const isFormReady = isValidEmail && isValidPassword && isValidConfirm;

  const handleRegister = async () => {
    if (!isFormReady) return;

    try {
      setLoading(true);
      await register(email, password);
      Alert.alert("สำเร็จ", "สร้างบัญชีเรียบร้อยแล้ว", [
        {
          text: "ตกลง",
          onPress: () => router.replace("/(protected)/onboarding"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", error.message || "ไม่สามารถลงทะเบียนได้");
    } finally {
      setLoading(false);
    }
  };

  const showPasswordInfo = () => {
    Alert.alert(
      "ข้อกำหนดการตั้งรหัสผ่าน",
      "1. ความยาว 8 ตัวอักษรขึ้นไป\n2. ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ และตัวเลข อย่างน้อย 1 ตัว",
    );
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
            {/* 1. Email */}
            <View>
              <TextInput
                className={`bg-card border rounded-full px-6 py-4 text-body font-regular ${
                  showEmailError
                    ? "border-alert text-alert"
                    : "border-text text-text"
                }`}
                placeholder="อีเมล"
                placeholderTextColor={showEmailError ? "#E76C5C" : "#9CA3AF"}
                value={email}
                onChangeText={setEmail}
                onBlur={() => setEmailTouched(true)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {/* Red Color for Error */}
              {showEmailError && (
                <Text className="text-alert text-small font-regular ml-4 mt-2">
                  รูปแบบอีเมลไม่ถูกต้อง
                </Text>
              )}
            </View>

            {/* 2. Password */}
            <View>
              <View
                className={`bg-card border rounded-full px-6 py-4 flex-row items-center ${
                  showPasswordError ? "border-alert" : "border-text"
                }`}
              >
                <TextInput
                  className={`flex-1 text-body font-regular p-0 ${
                    showPasswordError ? "text-alert" : "text-text"
                  }`}
                  placeholder="รหัสผ่าน"
                  placeholderTextColor={
                    showPasswordError ? "#E76C5C" : "#9CA3AF"
                  }
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => setPasswordTouched(true)}
                  secureTextEntry={!showPassword}
                />
                <View className="flex-row gap-4 items-center">
                  <TouchableOpacity onPress={showPasswordInfo}>
                    <Feather name="info" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Feather
                      name={showPassword ? "eye" : "eye-off"}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Error Message for Password */}
              {showPasswordError && (
                <Text className="text-alert text-small font-regular ml-4 mt-2">
                  {getPasswordErrorMessage()}
                </Text>
              )}
            </View>

            {/* 3.Confirm Password */}
            <View>
              <TextInput
                className={`bg-card border rounded-full px-6 py-4 text-body font-regular ${
                  showConfirmError
                    ? "border-alert text-alert"
                    : "border-text text-text"
                }`}
                placeholder="ยืนยันรหัสผ่าน"
                placeholderTextColor={showConfirmError ? "#E76C5C" : "#9CA3AF"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onBlur={() => setConfirmTouched(true)}
                secureTextEntry
              />
              {/* Error Message for Confirm Password */}
              {showConfirmError && (
                <Text className="text-alert text-small font-regular ml-4 mt-2">
                  รหัสผ่านไม่ตรงกัน
                </Text>
              )}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={!isFormReady || loading}
            className={`w-full rounded-full py-4 items-center mt-8 shadow-custom active:opacity-90 ${
              !isFormReady || loading ? "bg-disablebg" : "bg-primary"
            }`}
          >
            <Text
              className={`font-bold text-h5 ${
                !isFormReady || loading ? "text-disabletext" : "text-white"
              }`}
            >
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
