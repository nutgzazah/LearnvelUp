// ✨ โครงสร้างจำลองจากตาราง comments ใน Database แบบ Flat Thread
export interface DBComment {
  id: number;
  chapter_id: number;
  user_id: string | null; // รหัสอ้างอิง user
  parent_id: number | null; // NULL = คอมเมนต์หลัก, มีค่า = การตอบกลับ
  content: string; // ตรงกับ column 'content'
  created_at: string; // ตรงกับ column 'created_at' (ISO Format)

  // 💡 ข้อมูลสมมติที่ปกติเราจะได้มาจากการเขียน SQL JOIN ตาราง Profiles
  mock_username: string;
  mock_avatar_color: string;
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  duration: string;
  locked: boolean;
  quizIdAfter?: number;
  comments: DBComment[]; // ✨ รับเป็น Flat Array เส้นเดียว
}

export const mockLessons: Lesson[] = [
  {
    id: 1,
    courseId: 3,
    title: "ตอนที่ 1 ทำไมต้อง Python? (เริ่มจากศูนย์)",
    duration: "02:10",
    locked: false,
    quizIdAfter: 1,
    comments: [
      // --- (1. คอมเมนต์หลักของ JaTingJA) ---
      {
        id: 1,
        chapter_id: 17,
        user_id: "f5a64ca1-xxx",
        parent_id: null,
        content: "ผมสงสัยจากตัวอย่างแรกครับว่าสามารถปรับสีของกล่องได้ไหมครับ",
        created_at: "2026-04-12T01:32:02Z",
        mock_username: "JaTingJA",
        mock_avatar_color: "#7C5CBF",
      },
      // --- (2. อาจารย์ตอบกลับ อ้างอิงเม้นหลัก id 1) ---
      {
        id: 6,
        chapter_id: 17,
        user_id: null,
        parent_id: 1,
        content: "ตอบกลับ 1 แบบแก้ไข สามารถเปลี่ยนได้เลยครับ",
        created_at: "2026-04-12T05:00:55Z",
        mock_username: "DevMastery",
        mock_avatar_color: "#4F46E5",
      },
      // --- (3. นักเรียนถามอาจารย์ต่อ อ้างอิงเม้นหลัก id 1 เสมอ) ---
      {
        id: 7,
        chapter_id: 17,
        user_id: "f5a64ca1-xxx",
        parent_id: 1,
        content: "เข้าใจแล้วครับ ขอบคุณครับอาจารย์",
        created_at: "2026-04-13T13:20:53Z",
        mock_username: "JaTingJA",
        mock_avatar_color: "#7C5CBF",
      },
      // --- (4. คอมเมนต์หลักของอีกคน) ---
      {
        id: 2,
        chapter_id: 17,
        user_id: "f119d8bb-xxx",
        parent_id: null,
        content:
          "กดเปิด Python ไม่ได้รับขึ้นชื่อ ว่า Python is not recognized...",
        created_at: "2026-04-12T02:56:15Z",
        mock_username: "Hutnaikung2546",
        mock_avatar_color: "#059669",
      },
      // --- (5. คอมเมนต์หลักของอีกคน) ---
      {
        id: 4,
        chapter_id: 17,
        user_id: "user-999",
        parent_id: null,
        content: "เข้าใจมากขึ้นเลยครับ อธิบายได้ดีมากๆ",
        created_at: "2026-04-15T10:00:00Z",
        mock_username: "MindSetter99",
        mock_avatar_color: "#DC2626",
      },
    ],
  },
  // ... (บทเรียนอื่นๆ)
  {
    id: 2,
    courseId: 3,
    title: "ตอนที่ 2",
    duration: "02:43",
    locked: true,
    comments: [],
  },
  {
    id: 3,
    courseId: 3,
    title: "ตอนที่ 3",
    duration: "02:57",
    locked: true,
    comments: [],
  },
];
