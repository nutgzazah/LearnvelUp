import LoadingScreen from "@/src/components/LoadingScreen";
import { AppIcons } from "@/src/constants/icons";
import { getQuestionsWithAnswers } from "@/src/services/quizService";
import { fetchUserStats } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SecureVideoPlayer, {
  SecureVideoPlayerRef,
} from "@/src/components/SecureVideoPlayer";

import { getCurrentUserWithAvatar } from "@/src/services/authService";
import {
  createComment,
  deleteCommentById,
  getChapterComments,
  getChapterWithInstructor,
} from "@/src/services/lessonService";

const { height: SH } = Dimensions.get("window");

const fmt = (sec: number) => {
  if (isNaN(sec) || !sec) return "00:00";
  return `${Math.floor(sec / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(sec % 60)
    .toString()
    .padStart(2, "0")}`;
};

const formatRelativeTime = (dateInput: string) => {
  const past = new Date(dateInput);
  if (isNaN(past.getTime())) return dateInput;

  const diffMs = new Date().getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return "เมื่อสักครู่";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;

  return past.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export interface LessonComment {
  id: number;
  chapter_id: number;
  user_id: string | null;
  parent_id: number | null;
  content: string;
  created_at: string;
  username: string;
  avatar_url?: string | null;
}

const Avatar = ({
  imageUrl,
  name,
  size = 36,
}: {
  imageUrl?: string | null;
  name: string;
  size?: number;
}) => {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className=" overflow-hidden"
    >
      <Image
        source={
          imageUrl
            ? { uri: imageUrl }
            : require("../../../../../assets/avatar/generalOtter.png")
        }
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        cachePolicy="disk"
        transition={200}
      />
    </View>
  );
};

const CommentItem = ({
  comment,
  allComments,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: LessonComment;
  allComments: LessonComment[];
  currentUserId: string;
  onReply: (commentId: number, username: string) => void;
  onDelete: (id: number) => void;
}) => {
  const [showReplies, setShowReplies] = useState(false);

  const replies = allComments
    .filter((c) => c.parent_id === comment.id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

  const handleDelete = (id: number) => {
    Alert.alert("ยืนยันการลบ", "คุณต้องการลบคอมเมนต์นี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      { text: "ลบ", style: "destructive", onPress: () => onDelete(id) },
    ]);
  };

  return (
    <View className="mb-6">
      <View className="flex-row gap-3">
        <Avatar
          name={comment.username}
          imageUrl={comment.avatar_url}
          size={38}
        />
        <View className="flex-1">
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-text font-bold text-small">
              {comment.username}
            </Text>

            {comment.user_id === null && (
              <View className="w-3.5 h-3.5 rounded-full bg-primary items-center justify-center -ml-1">
                <Ionicons name="checkmark" size={9} color="white" />
              </View>
            )}

            <Text className="text-disabletext font-regular text-small">
              {formatRelativeTime(comment.created_at)}
            </Text>
          </View>
          <Text className="text-text font-regular text-small mt-1 leading-relaxed">
            {comment.content}
          </Text>

          <View className="flex-row items-center gap-4 mt-2">
            {currentUserId === comment.user_id && (
              <TouchableOpacity
                onPress={() => {
                  setShowReplies(true);
                  onReply(comment.id, comment.username);
                }}
              >
                <Text className="text-primary text-small font-bold">
                  ตอบกลับ
                </Text>
              </TouchableOpacity>
            )}

            {currentUserId === comment.user_id && comment.user_id !== null && (
              <TouchableOpacity onPress={() => handleDelete(comment.id)}>
                <Text className="text-alert text-small font-bold">ลบ</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {replies.length > 0 && (
        <TouchableOpacity
          className="ml-14 mt-2 flex-row items-center gap-1"
          onPress={() => setShowReplies((v) => !v)}
        >
          <View className="h-px w-4 bg-primary" />
          <Text className="text-primary text-small font-regular">
            {showReplies
              ? "ซ่อนการตอบกลับ"
              : `ดูการตอบกลับ ${replies.length} รายการ`}
          </Text>
          <Ionicons
            name={showReplies ? "chevron-up" : "chevron-down"}
            size={12}
            color="#4F46E5"
          />
        </TouchableOpacity>
      )}

      {showReplies &&
        replies.map((r) => (
          <View key={r.id} className="ml-14 mt-4 flex-row gap-3">
            <Avatar name={r.username} imageUrl={r.avatar_url} size={28} />
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-text font-bold text-small">
                  {r.username}
                </Text>

                {r.user_id === null && (
                  <View className="w-3.5 h-3.5 rounded-full bg-primary items-center justify-center -ml-1">
                    <Ionicons name="checkmark" size={9} color="white" />
                  </View>
                )}

                {r.user_id === comment.user_id && r.user_id !== null && (
                  <View className="bg-text/10 px-1.5 py-1 rounded">
                    <Text className="text-text text-[10px] font-bold">
                      ผู้ถาม
                    </Text>
                  </View>
                )}

                <Text className="text-disabletext font-regular text-small">
                  {formatRelativeTime(r.created_at)}
                </Text>
              </View>
              <Text className="text-text font-regular text-small mt-1 leading-relaxed">
                {r.content}
              </Text>

              <View className="flex-row items-center gap-4 mt-1.5">
                {currentUserId === comment.user_id && (
                  <TouchableOpacity
                    onPress={() => {
                      setShowReplies(true);
                      onReply(comment.id, r.username);
                    }}
                  >
                    <Text className="text-primary text-[12px] font-bold">
                      ตอบกลับ
                    </Text>
                  </TouchableOpacity>
                )}

                {currentUserId === r.user_id && r.user_id !== null && (
                  <TouchableOpacity onPress={() => handleDelete(r.id)}>
                    <Text className="text-alert text-[12px] font-bold">ลบ</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
    </View>
  );
};

const CommentSheet = ({
  chapterId,
  visible,
  comments,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onClose,
  onRefresh,
}: {
  chapterId: string;
  visible: boolean;
  comments: LessonComment[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
  onClose: () => void;
  onRefresh: () => Promise<void>;
}) => {
  const theme = useColorScheme() === "dark" ? "DARK" : "LIGHT";
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: number;
    username: string;
  } | null>(null);

  const inputRef = useRef<TextInput>(null);
  const panY = useRef(new Animated.Value(0)).current;
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleReplyPress = (commentId: number, username: string) => {
    setReplyTo({ id: commentId, username });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      keyboardPadding.setValue(0);
    } else {
      const timer = setTimeout(() => {
        panY.setValue(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 0,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 1.0) {
          onClose();
          Keyboard.dismiss();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            tension: 65,
            friction: 9,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handleSend = async () => {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createComment(
        Number(chapterId),
        currentUserId,
        text.trim(),
        replyTo ? replyTo.id : null,
      );

      setText("");
      setReplyTo(null);
      Keyboard.dismiss();
      await onRefresh();
    } catch (error: any) {
      // console.error(error);
      Alert.alert("ผิดพลาด", error.message || "ไม่สามารถส่งคอมเมนต์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteCommentById(id);
      await onRefresh();
    } catch (error) {
      // console.error(error);
      Alert.alert("ผิดพลาด", "ไม่สามารถลบคอมเมนต์ได้");
    }
  };

  const mainComments = comments
    .filter((c) => c.parent_id === null)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <TouchableOpacity
          className="absolute inset-0 bg-transparent"
          activeOpacity={1}
          onPress={() => {
            onClose();
            Keyboard.dismiss();
          }}
        />

        <Animated.View
          style={{ transform: [{ translateY: panY }], height: SH * 0.65 }}
          className="bg-background border-t border-text/20 rounded-t-3xl shadow-lg flex-col w-full"
        >
          <View className="flex-1">
            <View
              {...panResponder.panHandlers}
              className="pt-3 pb-3 px-5 bg-background rounded-t-3xl"
            >
              <View className="w-12 h-1.5 bg-disablebg rounded-full self-center mb-4" />
              <Text className="text-text font-bold text-body text-center">
                {mainComments.length} ความคิดเห็น
              </Text>
            </View>

            <ScrollView
              className="px-5 pt-2"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {mainComments.length > 0 ? (
                mainComments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    allComments={comments}
                    currentUserId={currentUserId}
                    onReply={handleReplyPress}
                    onDelete={handleDeleteComment}
                  />
                ))
              ) : (
                <View className="flex-1 items-center justify-center py-12 mt-8">
                  <View className="w-20 h-20 rounded-full bg-text/10 items-center justify-center mb-4">
                    <Ionicons
                      name="chatbubbles-outline"
                      size={40}
                      color={theme === "DARK" ? "white" : "black"}
                    />
                  </View>
                  <Text className="text-text font-bold text-h5 mb-1">
                    ยังไม่มีความคิดเห็น
                  </Text>
                  <Text className="text-disabletext font-regular text-small text-center">
                    มาเป็นคนแรกที่เริ่มต้นบทสนทนาในบทเรียนนี้สิ!
                  </Text>
                </View>
              )}
              <View className="h-4" />
            </ScrollView>

            <Animated.View style={{ paddingBottom: keyboardPadding }}>
              <View className="px-4 pt-3 pb-6 bg-background border-t border-text/20">
                {replyTo && (
                  <View className="flex-row items-center justify-between mb-2 px-1">
                    <Text className="text-primary text-small font-bold">
                      กำลังตอบกลับ @{replyTo.username}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setReplyTo(null)}
                      className="bg-text/10 rounded-full p-1"
                    >
                      <Ionicons
                        name="close"
                        size={14}
                        color={theme === "DARK" ? "white" : "black"}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                <View className="flex-row items-end gap-3">
                  <View className="">
                    <Avatar
                      name={currentUserName}
                      imageUrl={currentUserAvatar}
                      size={36}
                    />
                  </View>
                  <View className="flex-1 bg-background border border-disablebg rounded-3xl px-4 py-2 min-h-[40px] justify-center">
                    <TextInput
                      ref={inputRef}
                      value={text}
                      onChangeText={setText}
                      placeholder="เพิ่มความคิดเห็น..."
                      placeholderTextColor="#9CA3AF"
                      className="text-text text-small font-regular p-0 m-0"
                      multiline
                      maxLength={300}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={isSubmitting}
                    className="pb-2.5 pl-1"
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#4F46E5" />
                    ) : (
                      <Ionicons
                        name="send"
                        size={24}
                        color={text.trim() ? "#4F46E5" : "#ccc"}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const ProgressBar = ({
  progress,
  onSeek,
}: {
  progress: number;
  onSeek: (ratio: number) => void;
}) => {
  const barWidthRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState(0);

  const onSeekRef = useRef(onSeek);
  useEffect(() => {
    onSeekRef.current = onSeek;
  }, [onSeek]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDragging(true);
        const x = evt.nativeEvent.locationX;
        const width = barWidthRef.current;
        if (width > 0) setDragRatio(Math.min(Math.max(x / width, 0), 1));
      },
      onPanResponderMove: (evt) => {
        const x = evt.nativeEvent.locationX;
        const width = barWidthRef.current;
        if (width > 0) setDragRatio(Math.min(Math.max(x / width, 0), 1));
      },
      onPanResponderRelease: (evt) => {
        setIsDragging(false);
        const x = evt.nativeEvent.locationX;
        const width = barWidthRef.current;
        if (width > 0) onSeekRef.current(Math.min(Math.max(x / width, 0), 1));
      },
      onPanResponderTerminate: (evt) => {
        setIsDragging(false);
        const x = evt.nativeEvent.locationX;
        const width = barWidthRef.current;
        if (width > 0) onSeekRef.current(Math.min(Math.max(x / width, 0), 1));
      },
    }),
  ).current;

  const safeProgress = isNaN(progress) ? 0 : progress;
  const displayRatio = isDragging ? dragRatio : safeProgress;
  const pct = `${Math.round(displayRatio * 100)}%` as `${number}%`;

  return (
    <View
      onLayout={(e) => {
        barWidthRef.current = e.nativeEvent.layout.width;
      }}
      className="h-1.5 justify-center relative my-1 z-10"
    >
      <View
        {...panResponder.panHandlers}
        style={{ top: -24, bottom: -24 }}
        className="absolute left-0 right-0 z-20 bg-transparent"
      />
      <View
        pointerEvents="none"
        className="w-full h-full bg-text/30 rounded-full relative"
      >
        <View
          className="absolute left-0 top-0 bottom-0 bg-primary rounded-full"
          style={{ width: pct }}
        />
        <View
          className="absolute rounded-full shadow-md items-center justify-center"
          style={{
            left: pct,
            top: "50%",
            width: isDragging ? 20 : 16,
            height: isDragging ? 20 : 16,
            marginTop: isDragging ? -10 : -8,
            marginLeft: isDragging ? -10 : -8,
            backgroundColor: isDragging ? "#4F46E5" : "white",
          }}
        />
      </View>
    </View>
  );
};

// -----------------------------------------
// ✨ Main Screen
// -----------------------------------------
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [chapter, setChapter] = useState<any>(null);
  const [comments, setComments] = useState<LessonComment[]>([]);
  const theme = useColorScheme() === "dark" ? "DARK" : "LIGHT";

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserName, setCurrentUserName] = useState<string>("Me");
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(
    null,
  );
  // 📍 2. เพิ่ม useQuery 2 ตัวนี้ สำหรับดึงพลังงาน และดึงคำถามเพื่อมานับจำนวน
  const { data: userStats } = useQuery({
    queryKey: ["userStats", currentUserId],
    queryFn: () => fetchUserStats(currentUserId),
    enabled: !!currentUserId,
  });

  const { data: questions } = useQuery({
    queryKey: ["quizQuestions", Number(id)],
    queryFn: () => getQuestionsWithAnswers(Number(id)),
    enabled: !!id,
  });

  const playerRef = useRef<SecureVideoPlayerRef>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const loadComments = useCallback(
    async (instructorData: any) => {
      if (!id) return;
      try {
        const commentsData = await getChapterComments(id);

        const formattedComments: LessonComment[] = (commentsData || []).map(
          (c: any) => {
            let uname = "Unknown";
            let img = null;

            if (c.user_id === null) {
              uname = instructorData?.username || "ผู้สอน";
              img = instructorData?.avatar_url || null;
            } else {
              uname = c.username || "นักเรียน";
              img = c.avatar_url || null;
            }

            return {
              id: c.id,
              chapter_id: Number(id),
              user_id: c.user_id,
              parent_id: c.parent_id,
              content: c.content,
              created_at: c.created_at,
              username: uname,
              avatar_url: img,
            };
          },
        );

        setComments(formattedComments);
      } catch (error) {
        // console.error("Error fetching comments:", error);
      }
    },
    [id],
  );

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!id) return;
      setIsLoading(true);
      setHasError(false);

      try {
        const userProfile = await getCurrentUserWithAvatar();
        if (userProfile) {
          setCurrentUserId(userProfile.id);
          setCurrentUserName(userProfile.username);
          setCurrentUserAvatar(userProfile.avatar_url);
        }

        const chapterData = await getChapterWithInstructor(id);
        setChapter(chapterData);

        const instructor = chapterData?.courses?.instructors;
        await loadComments(instructor);

        // ถ้าโหลดสำเร็จ ค่อยปิด Loading
        setIsLoading(false);
      } catch (error) {
        // console.error("Error fetching lesson data:", error);
        setHasError(true);
        Alert.alert(
          "เกิดข้อผิดพลาด",
          "ไม่สามารถโหลดข้อมูลบทเรียนได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
          [
            {
              text: "ตกลง",
              onPress: () => router.back(),
            },
          ],
        );
      }
    };

    fetchLessonData();
  }, [id, loadComments]);

  const progressRatio = duration > 0 ? currentTime / duration : 0;

  const handleVideoProgress = (current: number, total: number) => {
    setCurrentTime(current);
    setDuration(total);
    if (!finished && total > 0 && current >= total - 0.5) {
      setFinished(true);
    }
  };

  const handleSeek = (ratio: number) => {
    if (duration === 0) return;
    const newSec = ratio * duration;
    setCurrentTime(newSec);
    playerRef.current?.seek(newSec);
  };

  const instructorData = chapter?.courses?.instructors || {};

  return (
    <View className="flex-1 bg-background rounded-3xl justify-start overflow-hidden relative">
      {/* ✨ 1. เอาเนื้อหาทั้งหมดมาครอบด้วย {chapter && ( ... )} เพื่อดักไม่ให้ UI หลักพังตอนยังไม่มีข้อมูล */}
      {chapter && (
        <>
          <View className="absolute inset-0 z-0 bg-background">
            <SecureVideoPlayer
              ref={playerRef}
              videoPath={chapter.video_url}
              className="w-full aspect-[9/16]"
              onProgress={handleVideoProgress}
            />
          </View>

          {/* ✨ 1. ปุ่ม Back มุมซ้ายบน (เปลี่ยนเป็น bg-disablebg/10 ให้เหมือน Layout เป๊ะๆ) */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute z-30 w-12 h-12 rounded-full bg-background border border-text/10 items-center justify-center"
            style={{ top: Math.max(insets.top, 16), left: 16 }}
          >
            <Image
              source={AppIcons.HEADERS.NORMAL.BACK[theme]}
              style={{ width: 20, height: 20, marginRight: 2 }} // w-5 h-5
              contentFit="contain"
            />
          </TouchableOpacity>

          {/* ✨ 2. กล่อง Energy มุมขวาบน (เปลี่ยนเป็น bg-disablebg/10 ให้เหมือน Layout เป๊ะๆ) */}
          <View
            className="absolute z-30 h-12 px-3 flex-row items-center justify-center rounded-full bg-background border border-text/10"
            style={{ top: Math.max(insets.top, 16), right: 16 }}
          >
            <Image
              source={AppIcons.HEADERS.NORMAL.ENERGY}
              style={{ width: 20, height: 20, marginRight: 4 }}
              contentFit="contain"
            />
            <Text className="text-primary font-bold text-small">
              {userStats?.energy ?? "..."}
            </Text>
          </View>

          <View className="absolute bottom-0 left-0 right-0 px-4 pt-4 pb-8 z-20 bg-background border-t border-text/20">
            <View className="mb-2">
              <View className="flex-row items-center gap-2 mb-0.5">
                <Avatar
                  name={instructorData.username}
                  imageUrl={instructorData.avatar_url}
                  size={28}
                />
                <Text className="text-text font-bold text-body">
                  {instructorData.username || "Instructor"}
                </Text>
                <View className="w-4 h-4 rounded-full bg-primary items-center justify-center">
                  <Ionicons name="checkmark" size={10} color="white" />
                </View>
              </View>
              <Text
                className="text-text font-regular text-small leading-relaxed"
                numberOfLines={2}
              >
                {chapter.title}
              </Text>
            </View>

            <ProgressBar progress={progressRatio} onSeek={handleSeek} />

            <View className="flex-row justify-between mt-1 mb-1">
              <Text className="text-disabletext text-tiny font-regular">
                {fmt(currentTime)}
              </Text>
              <Text className="text-disabletext text-tiny font-regular">
                {fmt(duration)}
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              {/* 📍 3. อัปเดตปุ่ม "เริ่มควิซ" */}
              <TouchableOpacity
                onPress={() => {
                  if (finished) {
                    const currentEnergy = userStats?.energy ?? 0;
                    const costPerQuestion =
                      chapter?.energy_cost_per_question ?? 1;
                    const totalQuestions = questions?.length ?? 0;
                    const totalCost = costPerQuestion * totalQuestions;

                    // ฟังก์ชันสำหรับกดยืนยันเพื่อไปหน้าควิซ
                    const proceedToQuiz = () => {
                      if (playerRef.current) {
                        (playerRef.current as any).pause?.();
                      }
                      router.push(`/course/quiz/${id}` as any);
                    };

                    // 🛑 เงื่อนไขที่ 1: พลังงานไม่พอแม้แต่ข้อเดียว (Block ไม่ให้เข้า)
                    if (currentEnergy < costPerQuestion) {
                      Alert.alert(
                        "พลังงานไม่เพียงพอ ⚡",
                        `คุณมีพลังงาน ${currentEnergy} หน่วย\n(ต้องการอย่างน้อย ${costPerQuestion} หน่วยเพื่อตอบคำถาม 1 ข้อ)`,
                      );
                      return;
                    }

                    // ⚠️ เงื่อนไขที่ 2: พลังงานพอเล่น แต่ไม่พอเคลียร์บอส (Warning ให้เลือก)
                    else if (totalQuestions > 0 && currentEnergy < totalCost) {
                      Alert.alert(
                        "พลังงานเหลือน้อย 🔋",
                        `ควิซนี้มีทั้งหมด ${totalQuestions} ข้อ ต้องใช้พลังงาน ${totalCost} หน่วย\n(แต่คุณมีเพียง ${currentEnergy} หน่วย)\n\nคุณอาจจะถูกเตะออกกลางคันหากตอบพลาด ต้องการลุยต่อหรือไม่?`,
                        [
                          { text: "ไว้คราวหน้า", style: "cancel" },
                          { text: "ยืนยันลุยต่อ", onPress: proceedToQuiz },
                        ],
                      );
                      return;
                    }

                    // ✅ เงื่อนไขที่ 3: พลังงานพอเคลียร์ชัวร์ๆ (ผ่านฉลุย)
                    proceedToQuiz();
                  }
                }}
                className={`flex-1 flex-row items-center justify-center rounded-full px-5 py-2.5 ${
                  finished ? "bg-primary" : "bg-text/10"
                }`}
              >
                <Text className="text-white font-regular text-body">
                  {finished ? "เริ่มควิซ! 🎉" : "เริ่มควิซ"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowComments(true)}
                className="w-12 h-12 rounded-full  items-center justify-center"
              >
                <Ionicons
                  name="chatbubble-ellipses"
                  size={26}
                  color={theme === "DARK" ? "white" : "black"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <CommentSheet
            chapterId={id}
            visible={showComments}
            comments={comments}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            onClose={() => setShowComments(false)}
            onRefresh={() => loadComments(instructorData)}
          />
        </>
      )}

      {/* ✨ 2. เอาหน้า Loading มาไว้ข้างล่างสุด ให้มันลอยทับหน้าจอ แล้วเฟดออกเองตอนโหลดเสร็จ */}
      <LoadingScreen
        visible={isLoading || !chapter || hasError}
        text="กำลังเตรียมบทเรียน..."
        onCancel={() => router.back()}
      />
    </View>
  );
}
