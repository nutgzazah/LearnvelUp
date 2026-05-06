// Custom hook สำหรับ track ว่า user อยู่หน้านี้นานแค่ไหน
// track เฉพาะถ้ามาจาก recommendation
//
// วิธีใช้:
//   useTimeOnPage({ userId, courseId, fromRecommendation: true })

import { useEffect, useRef } from "react";
import { trackBackQuickly, trackTimeOnPage } from "../lib/recommendationEvents";

interface Props {
  userId: string;
  courseId: number;
  fromRecommendation: boolean;
}

const BACK_QUICKLY_THRESHOLD = 5; // วินาที

export function useTimeOnPage({ userId, courseId, fromRecommendation }: Props) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // track เฉพาะถ้ามาจาก recommendation
    if (!fromRecommendation) return;

    startTimeRef.current = Date.now();

    return () => {
      const durationSeconds = Math.round(
        (Date.now() - startTimeRef.current) / 1000,
      );

      if (durationSeconds < BACK_QUICKLY_THRESHOLD) {
        trackBackQuickly(userId, courseId);
      } else {
        trackTimeOnPage(userId, courseId, durationSeconds);
      }
    };
  }, [userId, courseId, fromRecommendation]);
}
