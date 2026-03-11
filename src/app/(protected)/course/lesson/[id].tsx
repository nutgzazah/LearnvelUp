import { mockLessons, type Comment } from "@/src/constants/mockLessonData";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const { height: SH } = Dimensions.get("window");
const MOCK_TOTAL_SECONDS = 130;

const fmt = (sec: number) =>
  `${Math.floor(sec / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(sec % 60)
    .toString()
    .padStart(2, "0")}`;

// Teacher Avatar
const Avatar = ({
  name,
  color,
  size = 36,
}: {
  name: string;
  color: string;
  size?: number;
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
    }}
    className="items-center justify-center"
  >
    <Text style={{ color: "#fff", fontSize: size * 0.38, fontWeight: "700" }}>
      {name.charAt(0).toUpperCase()}
    </Text>
  </View>
);

// Comment Item
const CommentItem = ({
  comment,
  onReply,
}: {
  comment: Comment;
  onReply: (user: string) => void;
}) => {
  const [showReplies, setShowReplies] = useState(false);
  return (
    <View className="mb-1">
      <View className="flex-row gap-3">
        <Avatar name={comment.user} color={comment.avatarColor} size={38} />
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-text font-bold text-tiny">
              {comment.user}
            </Text>
            <Text className="text-disabletext/50 font-regular text-tiny">
              {comment.date}
            </Text>
          </View>
          <Text className="text-text font-regular text-tiny mt-1 leading-relaxed">
            {comment.text}
          </Text>
          <TouchableOpacity
            className="mt-1.5"
            onPress={() => onReply(comment.user)}
          >
            <Text className="text-primary text-tiny font-bold">ตอบกลับ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {comment.replies.length > 0 && (
        <TouchableOpacity
          className="ml-14 mt-2 flex-row items-center gap-1"
          onPress={() => setShowReplies((v) => !v)}
        >
          <View className="h-px w-4 bg-primary" />
          <Text className="text-primary text-tiny font-regular">
            {showReplies
              ? "ซ่อนการตอบกลับ"
              : `ข้อการตอบกลับ ${comment.replies.length} รายการ`}
          </Text>
          <Ionicons
            name={showReplies ? "chevron-up" : "chevron-down"}
            size={12}
            color="#4F46E5"
          />
        </TouchableOpacity>
      )}
      {/* Show Reply*/}
      {showReplies &&
        comment.replies.map((r) => (
          <View key={r.id} className="ml-14 mt-3 flex-row gap-3">
            <Avatar name={r.user} color={r.avatarColor} size={28} />
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-text font-bold text-tiny">{r.user}</Text>
                <Text className="text-disabletext/50 font-regular text-tiny">
                  {r.date}
                </Text>
              </View>
              <Text className="text-text font-regular text-tiny mt-1 leading-relaxed">
                {r.text}
              </Text>
            </View>
          </View>
        ))}
    </View>
  );
};

// Comment Sheet
const CommentSheet = ({
  visible,
  comments,
  onClose,
}: {
  visible: boolean;
  comments: Comment[];
  onClose: () => void;
}) => {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    setText("");
    setReplyTo(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-background opacity-50"
        activeOpacity={1}
        onPress={onClose}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="bg-background border-t-2 border-disablebg/20 border-background/2 drop-shadow-lg"
        style={{ maxHeight: SH * 0.75 }}
      >
        {/* Handle */}
        {/* <View className="items-center pt-3 pb-1">
          <View className="w-10 h-1 bg-disablebg rounded-full" />
        </View> */}

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 mt-1 ">
          <Text className="text-text font-bold text-body">
            {comments.length} ความคิดเห็น
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView
          className="px-5 pt-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} onReply={setReplyTo} />
          ))}
          <View className="h-6" />
        </ScrollView>

        {/* Input */}
        <View className="px-4 py-5 flex-row items-center gap-3">
          <Avatar name="Me" color="#4F46E5" size={34} />
          <View className="flex-1 bg-white rounded-2xl px-4 py-2.5">
            {replyTo && (
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-primary text-tiny font-regular">
                  ตอบกลับ @{replyTo}
                </Text>
                <TouchableOpacity onPress={() => setReplyTo(null)}>
                  <Ionicons name="close-circle" size={14} color="#aaa" />
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="ความคิดเห็น..."
              placeholderTextColor="#bbb"
              className="text-black text-tiny font-regular"
              multiline
            />
          </View>
          <TouchableOpacity onPress={handleSend}>
            <Ionicons
              name="send"
              size={22}
              color={text.trim() ? "#4F46E5" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Progress
const ProgressBar = ({
  progress,
  onSeek,
}: {
  progress: number;
  onSeek: (ratio: number) => void;
}) => {
  const barRef = useRef<View>(null);

  const handlePress = (e: any) => {
    const x = e.nativeEvent.locationX;
    barRef.current?.measure((_fx, _fy, width) => {
      onSeek(Math.min(Math.max(x / width, 0), 1));
    });
  };

  const pct = `${Math.round(progress * 100)}%` as `${number}%`;

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View
        ref={barRef}
        className="h-1 bg-disablebg rounded-full justify-center"
      >
        {/* Filled */}
        <View
          className="absolute left-0 top-0 bottom-0 bg-primary rounded-full"
          style={{ width: pct }}
        />
        {/* Thumb */}
        <View
          className="absolute w-3.5 h-3.5 rounded-full bg-white -mt-1"
          style={{ left: pct, marginLeft: -7 }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

// Main Screen
export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson =
    mockLessons.find((l) => l.id === Number(lessonId)) ?? mockLessons[0];

  const [playing, setPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = currentSec / MOCK_TOTAL_SECONDS;

  const togglePlay = () => {
    if (playing) {
      clearInterval(intervalRef.current!);
      setPlaying(false);
    } else {
      if (currentSec >= MOCK_TOTAL_SECONDS) return;
      setPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentSec((prev) => {
          const next = prev + 1;
          if (next >= MOCK_TOTAL_SECONDS) {
            clearInterval(intervalRef.current!);
            setPlaying(false);
            setFinished(true);
            return MOCK_TOTAL_SECONDS;
          }
          return next;
        });
      }, 200); // 5× speed for mock demo
    }
  };

  const handleProgress = (ratio: number) => {
    const newSec = Math.round(ratio * MOCK_TOTAL_SECONDS);
    setCurrentSec(newSec);
    if (newSec < MOCK_TOTAL_SECONDS) setFinished(false);
  };

  const handleGoQuiz = () =>
    router.push(`/course/quiz/${lesson.quizIdAfter}` as any);

  return (
    <View className="flex-1 bg-background">
      {/* Full-screen mock video (กด tap เพื่อ play/pause)*/}
      <TouchableWithoutFeedback onPress={togglePlay}>
        <View className="absolute inset-0 bg-background items-center justify-center">
          {/* Mock video placeholder */}
          <View className="items-center opacity-20">
            <Ionicons name="videocam" size={72} color="white" />
            <Text className="text-text text-tiny text-center mt-3 px-10 font-regular">
              {lesson.title}
            </Text>
          </View>

          {/* Play / Pause overlay icon */}
          {!playing && (
            <View className="absolute w-16 h-16 rounded-full bg-primary/50 items-center justify-center">
              <Ionicons
                name={finished ? "refresh" : "play"}
                size={32}
                color="white"
              />
            </View>
          )}

          {/* Top shadow gradient */}
          <View className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Bottom shadow gradient */}
          <View className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-black/80 to-transparent" />
        </View>
      </TouchableWithoutFeedback>

      {/* ---(OVERLAY UI — on top of video)--- */}
      {/* Top-left- channel name + lesson title*/}
      <View className="absolute left-4 right-20">
        {/* Channel row */}
        <View className="flex-row items-center gap-2 mb-1.5">
          <Avatar name="D" color="#4F46E5" size={28} />
          <Text className="text-white font-bold text-body">DevMastery</Text>
          {/* Verified badge */}
          <View className="w-4 h-4 rounded-full bg-primary items-center justify-center">
            <Ionicons name="checkmark" size={10} color="white" />
          </View>
        </View>

        {/* Lesson subtitle */}
        <Text
          className="text-text font-regular text-tiny leading-relaxed"
          numberOfLines={2}
        >
          {lesson.title}
        </Text>
      </View>

      {/* ---(Bottom- Progress bar + time + action bar)--- */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8">
        {/* Progress bar */}
        <ProgressBar progress={progress} onSeek={handleProgress} />

        {/* Time row */}
        <View className="flex-row justify-between mt-2 mb-3">
          <Text className="text-disabletext text-tiny font-regular">
            {fmt(currentSec)}
          </Text>
          <Text className="text-disabletext text-tiny font-regular">
            {fmt(MOCK_TOTAL_SECONDS)}
          </Text>
        </View>

        {/*---(Avatar + Quiz + Comment)---*/}
        <View className="flex-row items-center gap-3">
          {/* User avatar */}
          <Avatar name="Me" color="#4F46E5" size={40} />

          {/* Quiz button */}
          <TouchableOpacity
            onPress={finished && lesson.quizIdAfter ? handleGoQuiz : undefined}
            className={`flex-1 flex-row items-center justify-between rounded-full px-5 py-3 ${
              finished && lesson.quizIdAfter ? "bg-primary" : "bg-disablebg/30"
            }`}
          >
            <Text className="text-white font-regular text-body">
              {finished && lesson.quizIdAfter ? "ทำควิซ! 🎉" : "เริ่มควิช"}
            </Text>
            {/* Help button */}
            <View className="flex-row items-center gap-1 bg-disablebg/30 rounded-full px-2 py-0.5">
              <Ionicons name="help-circle-outline" size={15} color="white" />
            </View>
          </TouchableOpacity>

          {/* Comment button */}
          <TouchableOpacity
            onPress={() => setShowComments(true)}
            className="w-11 h-11 rounded-full bg-disablebg/30 items-center justify-center"
          >
            <Ionicons name="chatbubble-ellipses" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/*---(Comment Sheet)---*/}
      <CommentSheet
        visible={showComments}
        comments={lesson.comments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}
