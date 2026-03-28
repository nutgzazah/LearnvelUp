import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { User } from "../types/types";

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setProfileComplete: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isProfileComplete: false,

      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.log("Supabase Login Error:", error.message);
            throw error;
          }

          if (data && data.user && !error) {
            const { user } = data;

            // Fetch user profile from profiles table
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("id, username, gender, birthdate, age_group")
              .eq("id", user.id)
              .single();

            if (profileError) {
              console.log(
                "Supabase Profile Fetch Error:",
                profileError.message,
              );
              throw new Error("ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
            }

            if (!profileData) {
              throw new Error("ไม่พบข้อมูลโปรไฟล์ในระบบ");
            }

            // Check if profile is complete (all fields filled)
            const profileComplete = Boolean(
              profileData.username &&
              profileData.gender &&
              profileData.birthdate &&
              profileData.age_group,
            );

            const newUser: User = {
              id: user.id,
              email: user.email!,
              username: profileData.username || "",
            };

            set({
              user: newUser,
              isAuthenticated: true,
              isProfileComplete: profileComplete,
            });
          }
        } catch (error) {
          throw error;
        }
      },

      register: async (email: string, password: string) => {
        try {
          // Register user in Supabase Auth only. Profile (and other related rows)
          // are expected to be created server-side (e.g. by a trigger).
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) {
            console.log("Supabase Sign Up Error:", error.message);
            throw error;
          }

          if (!data || !data.user) {
            throw new Error("ไม่สามารถสร้างบัญชีได้");
          }

          const { user } = data;

          const newUser: User = {
            id: user.id,
            email: user.email || "",
            username: "",
          };

          // We intentionally DO NOT insert into `profiles` from the client to
          // avoid RLS policy violations. The app will fetch the profile after
          // signup/login and onboarding will complete the profile if needed.
          set({
            user: newUser,
            isAuthenticated: true,
            isProfileComplete: false,
          });
        } catch (error) {
          throw error;
        }
      },

      logout: async () => {
        // 1. let supabase handle the sign out
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.log("Supabase Logout Error:", error.message);
        }

        // 2. fixed: clear the auth state in our store (regardless of supabase sign out success)
        set({
          user: null,
          isAuthenticated: false,
          isProfileComplete: false,
        });
      },

      setProfileComplete: () => {
        set({ isProfileComplete: true });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
