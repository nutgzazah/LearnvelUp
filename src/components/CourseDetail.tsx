import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { AppIcons } from "../constants/icons";
import { mockCourseData } from "../constants/mockCourseData";

// Mock chapter data
const mockChapters = [
  {
    id: 1,
    title: "ตอนที่ 1 ทำไมต้อง Python? (เริ่มจากศูนย์)",
    duration: "02:10",
    locked: false,
  },
  {
    id: 2,
    title: "ตอนที่ 2 ติดตั้ง VS Code แบบจับมือทำ",
    duration: "02:43",
    locked: true,
  },
  {
    id: 3,
    title: "ตอนที่ 3 ตัวแปร (Variable) คืออะไร?",
    duration: "02:57",
    locked: true,
  },
  {
    id: 4,
    title: "ตอนที่ 4 สั่งคอมฯ ให้ตัดสินใจด้วย If-Else",
    duration: "02:20",
    locked: true,
  },
  {
    id: 5,
    title: "ตอนที่ 5 สั่งคอมฯ ให้วนลูปด้วย While",
    duration: "02:42",
    locked: true,
  },
];

const TOTAL_CHAPTERS = 10;
const TOTAL_DURATION = "30 นาที";

const CourseDetail = () => {
  // Use course id=3 to match the images (Python Zero to Hero)
  const course = mockCourseData.find((c) => c.id === 3)!;
  const [activeTab, setActiveTab] = React.useState<"description" | "chapter">(
    "description",
  );
  const chatIcon = require("../../assets/images/course/course-chat-icon.png");

  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "DARK" : "LIGHT";

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        className="bg-background"
      >
        {/* ---(Course Thumbnail)--- */}
        <View className="items-center">
          <Image
            source={course.thumbnail}
            className="w-[400px] h-[220px]"
            resizeMode="stretch"
          />
        </View>

        {/* ---(Course Title + Category)--- */}
        <View className="px-4 mt-4">
          <Text className="text-h6 text-text font-regular">{course.title}</Text>
          <Text className="self-start text-white font-regular text-tiny rounded-[10px] bg-primary px-2 py-1 mt-2">
            โปรแกรมมิ่ง {/*{course.category}*/}
          </Text>
        </View>

        {/* ---(Teacher + Learner Count)--- */}
        <View className="flex-row items-center justify-between px-4 mt-4">
          <TouchableOpacity onPress={() => router.push("/course/teacher/[id]")}>
            <View className="flex-row items-center gap-2">
              <Image
                source={course.teacherAvatar}
                className="w-10 h-10 rounded-full"
              />
              <View className="flex-row items-center gap-1">
                <Text className="text-text font-regular text-body">
                  DevMastery
                </Text>
                {/*Check mark icon*/}
              </View>
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center gap-1">
            <Text className="text-text font-regular text-body">
              ผู้เรียน 2,080 {/* Hardcoded learner count */}
            </Text>
            <Image
              source={AppIcons.COURSE.NORMAL.LEARNERS}
              className="w-7 h-7"
            />
          </View>
        </View>

        {/* ---(Tab Bar)--- */}
        <View className="flex-row mt-4 px-4 items-center gap-6 justify-center ">
          <TouchableOpacity
            className={`border-b-2 px-6 ${activeTab === "description" ? "border-primary" : "border-transparent"}`}
            onPress={() => setActiveTab("description")}
          >
            <Text
              className={`font-regular text-body mb-2 ${activeTab === "description" ? "text-primary" : "text-text"}`}
            >
              รายละเอียด
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`border-b-2 px-6 ${activeTab === "chapter" ? "border-primary" : "border-transparent"}`}
            onPress={() => setActiveTab("chapter")}
          >
            <Text
              className={`font-regular text-body mb-2 ${activeTab === "chapter" ? "text-primary" : "text-text"}`}
            >
              บททั้งหมด
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---(Tab Content)--- */}
        {activeTab === "description" ? (
          <DescriptionTab description={course.description} />
        ) : (
          <ChapterTab />
        )}
      </ScrollView>

      {/* ---(Bottom Buy Bar)--- */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-between px-4 py-4 bg-background border-t border-gray-200">
        <TouchableOpacity className="flex-1 bg-primary rounded-xl py-4 items-center mr-3 my-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-white font-bold text-body">
              ซื้อคอร์สเรียน
            </Text>
            <Image
              source={AppIcons.COURSE.NORMAL.BUY}
              className="w-7 h-7"
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center px-1 py-3 gap-1">
          <Text className="text-secondary text-body font-bold">
            {course.price_coin}
          </Text>
        </View>
        <Image
          source={AppIcons.HEADERS.NORMAL.COIN}
          className="w-7 h-7"
          resizeMode="contain"
        />

        <TouchableOpacity className="m-2 p-1">
          <Image
            source={AppIcons.COURSE.NORMAL.WISHLIST[theme]} // มี LIGHT/DARK
            className="w-7 h-7"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ---(Description Tab)---
const DescriptionTab = ({ description }: { description: string }) => (
  <View className="px-4 mt-4">
    <Text className="text-text font-regular text-body leading-relaxed">
      🚀 DevMastery คือ{"\n"}
      พื้นที่ของคนอยากย้ายสายงานและเริ่มต้นเขียนโปรแกรมแบบไม่เครียด เราเชื่อว่า
      "Coding" คือทักษะพื้นฐานใหม่ของโลกอนาคต ที่ใครๆ ก็เขียนได้
      ไม่จำเป็นต้องจบตรงสาย
    </Text>

    <Text className="text-text font-regular text-body leading-relaxed mt-4">
      ▲ สิ่งที่จะได้เรียนรู้ในคอร์สนี้ 💡 พื้นฐานภาษา Python
      ตั้งแต่ติดตั้งโปรแกรม ไปจนถึงการเขียนสคริปต์ช่วยทำงานอัตโนมัติ
      (Automation) ง่ายๆ
    </Text>

    <Text className="text-text font-regular text-body leading-relaxed mt-4">
      เปลี่ยนเรื่อง Syntax ที่ซีบซ้อน ให้กลายเป็นเรื่องกล้วยๆ
      ด้วยการเปรียบเทียบกับชีวิตประจำวัน
      เรียนจบคุณจะเขียนโค้ดสั่งงานคอมพิวเตอร์ได้จริง และต่อยอดไปทำ Data หรือ AI
      ได้ในอนาคต!
    </Text>

    <Text className="text-text font-regular text-body leading-relaxed mt-4">
      ▲ ติดต่อสอบถาม หรือส่งการบ้านได้ที่:{"\n"}
      support@devmastery.com
    </Text>
  </View>
);

// ---(Chapter Tab)---
const ChapterTab = () => (
  <View className="px-4 mt-4">
    {/* Summary Row */}
    <View className="flex-row justify-between mb-4">
      <Text className="text-text font-regular text-body">
        จำนวน {TOTAL_CHAPTERS} บท
      </Text>
      <Text className="text-text font-regular text-body">
        ความยาวรวม {TOTAL_DURATION}
      </Text>
    </View>

    {/* Chapter List */}
    {mockChapters.map((chapter) => (
      <ChapterItem key={chapter.id} chapter={chapter} />
    ))}

    {/* Placeholder for remaining chapters */}
    {Array.from({ length: TOTAL_CHAPTERS - mockChapters.length }).map(
      (_, i) => (
        <ChapterItem
          key={`placeholder-${i}`}
          chapter={{
            id: mockChapters.length + i + 1,
            title: `ตอนที่ ${mockChapters.length + i + 1} (เร็วๆ นี้)`,
            duration: "--:--",
            locked: true,
          }}
        />
      ),
    )}
  </View>
);

// ---(Chapter Item)---
const ChapterItem = ({
  chapter,
}: {
  chapter: { id: number; title: string; duration: string; locked: boolean };
}) => (
  <View className="flex-row items-center bg-background rounded-xl mb-3 overflow-hidden shadow-sm border border-gray-200">
    {/* Thumbnail placeholder */}
    <View className="w-[100px] h-[80px] bg-gray justify-center items-center">
      <Ionicons name="play-circle-outline" size={28} color="#aaa" />
      {/* MOCK IMAGE */}
    </View>

    {/* Info */}
    <View className="flex-1 px-3">
      <Text className="text-text font-regular text-tiny" numberOfLines={2}>
        {chapter.title}
      </Text>
      <Text className="text-gray-400 font-regular text-tiny mt-1">
        {chapter.duration}
      </Text>
    </View>

    {/* Lock icon */}
    {chapter.locked && (
      <View className="pr-2">
        <Image
          source={AppIcons.COURSE.NORMAL.LOCK}
          className="w-7 h-7"
          resizeMode="contain"
        />
      </View>
    )}

    {/* Play icon for unlocked chapters */}
    {!chapter.locked && (
      <View className="pr-2">
        <Image
          source={AppIcons.COURSE.NORMAL.PLAY}
          className="w-7 h-7"
          resizeMode="contain"
        />
      </View>
    )}
  </View>
);

export default CourseDetail;
