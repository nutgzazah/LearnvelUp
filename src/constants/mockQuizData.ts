export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  question: string;
  choices: Choice[];
  correctId: string;
}

export interface Quiz {
  id: number;
  courseId: number;
  triggerAfterLessonId: number;
  title: string;
  costToCheck: number; // เหรียญที่ใช้กดตรวจ
  questions: Question[];
}

export const mockQuizzes: Quiz[] = [
  {
    id: 1,
    courseId: 3,
    triggerAfterLessonId: 1,
    title: "ควิซ บทที่ 1",
    costToCheck: 1,
    questions: [
      {
        id: 1,
        question:
          "ข้อใดคือเหตุผลหลักที่แนะนำให้มือใหม่เริ่มต้นเรียนเขียนโปรแกรมด้วยภาษา Python?",
        choices: [
          { id: "a", text: "ก. เพราะเป็นภาษาที่ทำงานได้เร็วที่สุดในโลก" },
          {
            id: "b",
            text: "ข. เพราะมีไวยากรณ์ (Syntax) ที่อ่านง่ายคล้ายภาษาอังกฤษ",
          },
          {
            id: "c",
            text: "ค. เพราะไม่ต้องติดตั้งโปรแกรมอะไรเลยก็เขียนได้",
          },
          { id: "d", text: "ง. เพราะใช้สร้างเว็บไซต์ได้อย่างเดียว" },
        ],
        correctId: "b",
      },
      {
        id: 2,
        question: "Python ถูกสร้างขึ้นโดยใคร?",
        choices: [
          { id: "a", text: "ก. Linus Torvalds" },
          { id: "b", text: "ข. Guido van Rossum" },
          { id: "c", text: "ค. James Gosling" },
          { id: "d", text: "ง. Brendan Eich" },
        ],
        correctId: "b",
      },
      {
        id: 3,
        question: "ข้อใดคือนามสกุลไฟล์ของ Python?",
        choices: [
          { id: "a", text: "ก. .java" },
          { id: "b", text: "ข. .js" },
          { id: "c", text: "ค. .py" },
          { id: "d", text: "ง. .cpp" },
        ],
        correctId: "c",
      },
    ],
  },
];
