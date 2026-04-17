
from supabase import create_client, Client
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import asyncio
from typing import List, Set
from app.schemas import CourseScore
from pythainlp import word_tokenize

# ─── TF-IDF Repetition Weights ────────────────────────────────────────────────
W_TITLE       = 3
W_DESCRIPTION = 1
W_OUTCOME     = 1
W_MAIN_CAT    = 5
W_SUB_CAT_1   = 3
W_SUB_CAT_2   = 3

# ─── Category Bonus (ใช้กับ enrollment score เท่านั้น) ───────────────────────
BONUS_MAIN_CAT  = 0.20
BONUS_SUB_CAT_1 = 0.10
BONUS_SUB_CAT_2 = 0.10

# ─── Blend Weights ────────────────────────────────────────────────────────────
# enrollment = implicit feedback (จ่ายเงินเรียนจริง = strong signal)
# interests  = explicit feedback (กดเลือกตอนสมัคร = weak signal)
BLEND_ENROLLMENT = 0.7
BLEND_INTERESTS  = 0.3


class Recommender:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.sb: Client = create_client(supabase_url, supabase_key)
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            stop_words=None,
            max_features=5000,
        )
        self.tfidf_matrix         = None
        self.course_ids:          List[int]       = []
        self.course_titles:       List[str]       = []
        self.course_main_cats:    List[str]       = []
        self.course_sub_cats:     List[List[str]] = []
        self.course_category_ids: List[dict]      = []
        self.course_teacher_avatars: List[str]    = []
        self.course_images:       List[str]       = []
        self.course_prices:       List[int]       = []
        self.course_count: int = 0
        self._built = False

    def _tokenize_thai(self, text: str) -> str:
        """
        ตัดคำภาษาไทยแล้วคืนเป็น string คั่นด้วย space
        ภาษาอังกฤษและตัวเลข PyThaiNLP จัดการให้เองอยู่แล้ว
        """
        if not text or not text.strip():
            return ""
        tokens = word_tokenize(text, engine="newmm", keep_whitespace=False)
        return " ".join(tokens)

    # ─── Build Document ───────────────────────────────────────────────────────
    def _build_document(
        self,
        title: str,
        description: str,
        outcome: str,
        main_cat: str,
        sub_cat_1: str,
        sub_cat_2: str,
    ) -> str:
        # ตัดคำทุก field ก่อน
        title       = self._tokenize_thai(title)
        description = self._tokenize_thai(description)
        outcome     = self._tokenize_thai(outcome)
        main_cat    = self._tokenize_thai(main_cat)
        sub_cat_1   = self._tokenize_thai(sub_cat_1)
        sub_cat_2   = self._tokenize_thai(sub_cat_2)

        parts = (
            [title]       * W_TITLE       +
            [description] * W_DESCRIPTION +
            [outcome]     * W_OUTCOME     +
            [main_cat]    * W_MAIN_CAT    +
            [sub_cat_1]   * W_SUB_CAT_1  +
            [sub_cat_2]   * W_SUB_CAT_2
        )
        return " ".join(p for p in parts if p and p.strip())

    # ─── Category Bonus ───────────────────────────────────────────────────────
    def _apply_category_bonus(
        self,
        base_score: float,
        cat_ids: dict,
        user_main_cat_ids: Set[int],
        user_sub_cat_ids: Set[int],
    ) -> float:
        bonus = 0.0
        if cat_ids.get("main") in user_main_cat_ids:
            bonus += BONUS_MAIN_CAT
        if cat_ids.get("sub1") and cat_ids["sub1"] in user_sub_cat_ids:
            bonus += BONUS_SUB_CAT_1
        if cat_ids.get("sub2") and cat_ids["sub2"] in user_sub_cat_ids:
            bonus += BONUS_SUB_CAT_2
        return min(base_score + bonus, 1.0)

    # ─── Interest Score ───────────────────────────────────────────────────────
    def _calc_interest_score(
        self,
        cat_ids: dict,
        interest_cat_ids: Set[int],
    ) -> float:
        """
        คำนวณ score จาก user_interests (explicit feedback)
        ตรง main_category → 1.0
        ตรง sub_category  → 0.5
        ไม่ตรงเลย         → 0.0
        """
        if cat_ids.get("main") in interest_cat_ids:
            return 1.0
        if cat_ids.get("sub1") in interest_cat_ids:
            return 0.5
        if cat_ids.get("sub2") in interest_cat_ids:
            return 0.5
        return 0.0

    # ─── Build Index ──────────────────────────────────────────────────────────
    async def build_index(self):
        loop = asyncio.get_event_loop()

        res = await loop.run_in_executor(
            None,
            lambda: self.sb.table("courses")
            .select(
                "id, title, description, learning_outcome,"
                "cover_image_url, price_coins,"
                "category_id, sub_category_1_id, sub_category_2_id,"
                "main_cat:category_id(name),"
                "sub1:sub_category_1_id(name),"
                "sub2:sub_category_2_id(name),"
                "instructor_id, instructors(avatar_url)"
            )
            .eq("status", "published")
            .execute(),
        )
        courses = res.data or []

        if not courses:
            self._built = False
            return

        documents: List[str] = []
        self.course_ids          = []
        self.course_titles       = []
        self.course_main_cats    = []
        self.course_sub_cats     = []
        self.course_category_ids = []
        self.course_teacher_avatars = []
        self.course_images       = []
        self.course_prices       = []
        
        for c in courses:
            main_cat_name = (c.get("main_cat") or {}).get("name", "")
            sub1_name     = (c.get("sub1") or {}).get("name", "")
            sub2_name     = (c.get("sub2") or {}).get("name", "")

            teacher_avatar = ""
            if c.get("instructors") and isinstance(c.get("instructors"), dict):
                teacher_avatar = c.get("instructors", {}).get("avatar_url", "") or ""
            self.course_teacher_avatars.append(teacher_avatar)

            doc = self._build_document(
                title       = c.get("title", ""),
                description = c.get("description", ""),
                outcome     = c.get("learning_outcome", ""),
                main_cat    = main_cat_name,
                sub_cat_1   = sub1_name,
                sub_cat_2   = sub2_name,
            )

            documents.append(doc)
            self.course_ids.append(c["id"])
            self.course_titles.append(c.get("title", ""))
            self.course_main_cats.append(main_cat_name)
            self.course_sub_cats.append(
                [s for s in [sub1_name, sub2_name] if s]
            )
            self.course_category_ids.append({
                "main": c.get("category_id"),
                "sub1": c.get("sub_category_1_id"),
                "sub2": c.get("sub_category_2_id"),
            })
            self.course_images.append(c.get("cover_image_url") or "")
            self.course_prices.append(c.get("price_coins") or 0)

        self.tfidf_matrix = self.vectorizer.fit_transform(documents)
        self.course_count = len(documents)
        self._built = True

    # ─── Get Recommendations ─────────────────────────────────────────────────
    async def get_recommendations(
        self,
        user_id: str,
        top_k: int = 10,
    ) -> tuple[List[CourseScore], bool]:
        if not self._built:
            await self.build_index()
        if not self._built:
            return [], False

        loop = asyncio.get_event_loop()

        # ── ดึงทั้ง enrollment และ interests พร้อมกัน ──
        enroll_res, interest_res = await asyncio.gather(
            loop.run_in_executor(
                None,
                lambda: self.sb.table("enrollments")
                .select("course_id")
                .eq("user_id", user_id)
                .execute(),
            ),
            loop.run_in_executor(
                None,
                lambda: self.sb.table("user_interests")
                .select("category_id")
                .eq("user_id", user_id)
                .execute(),
            ),
        )

        enrolled_ids: Set[int] = {
            row["course_id"] for row in (enroll_res.data or [])
        }
        interest_cat_ids: Set[int] = {
            row["category_id"] for row in (interest_res.data or [])
        }

        # ════════════════════════════════════════════════════════
        # LEVEL 1: ไม่มีทั้ง enrollment และ interests → popular
        # ════════════════════════════════════════════════════════
        if not enrolled_ids and not interest_cat_ids:
            popular = await self._get_popular(top_k, exclude_ids=set())
            return popular, True

        # ════════════════════════════════════════════════════════
        # LEVEL 2: มีแค่ interests ยังไม่มี enrollment
        #          → content-based by category preference
        # ════════════════════════════════════════════════════════
        if not enrolled_ids and interest_cat_ids:
            results = await self._get_by_preference(
                top_k=top_k,
                category_ids=interest_cat_ids,
            )
            return results, False

        # ════════════════════════════════════════════════════════
        # LEVEL 3: มีทั้ง enrollment (และอาจมี interests)
        #          → Weighted Blend
        #          0.7 × enrollment_score + 0.3 × interest_score
        # ════════════════════════════════════════════════════════

        # ── 3.1 Enrollment score (implicit feedback) ──
        enrolled_indices = [
            i for i, cid in enumerate(self.course_ids) if cid in enrolled_ids
        ]

        user_matrix  = self.tfidf_matrix[enrolled_indices]
        user_profile = np.asarray(user_matrix.mean(axis=0))

        # category ids จาก enrollment สำหรับ bonus
        user_main_cat_ids: Set[int] = set()
        user_sub_cat_ids:  Set[int] = set()
        for i in enrolled_indices:
            cat = self.course_category_ids[i]
            if cat.get("main"): user_main_cat_ids.add(cat["main"])
            if cat.get("sub1"): user_sub_cat_ids.add(cat["sub1"])
            if cat.get("sub2"): user_sub_cat_ids.add(cat["sub2"])

        base_scores = cosine_similarity(user_profile, self.tfidf_matrix)[0]

        # ── 3.2 คำนวณ final score แต่ละ course ──
        final_scores = []
        for i, base in enumerate(base_scores):
            # enrollment score = cosine similarity + category bonus
            enrollment_score = self._apply_category_bonus(
                base_score        = float(base),
                cat_ids           = self.course_category_ids[i],
                user_main_cat_ids = user_main_cat_ids,
                user_sub_cat_ids  = user_sub_cat_ids,
            )

            # interest score = explicit preference match
            interest_score = self._calc_interest_score(
                cat_ids          = self.course_category_ids[i],
                interest_cat_ids = interest_cat_ids,
            )

            # weighted blend
            # ถ้าไม่มี interests → interest_score = 0 ทุกตัว
            # blend จะเท่ากับ enrollment_score × 0.7 เท่านั้น
            blended = (
                BLEND_ENROLLMENT * enrollment_score +
                BLEND_INTERESTS  * interest_score
            )

            final_scores.append((i, round(blended, 4)))

        final_scores.sort(key=lambda x: x[1], reverse=True)

        # ── 3.3 กรอง enrolled ออก → top K ──
        results: List[CourseScore] = []
        for idx, score in final_scores:
            cid = self.course_ids[idx]
            if cid in enrolled_ids:
                continue
            results.append(
                CourseScore(
                    course_id       = cid,
                    title           = self.course_titles[idx],
                    score           = score,
                    main_category   = self.course_main_cats[idx] or None,
                    sub_categories  = self.course_sub_cats[idx],
                    teacher_avatar_url = self.course_teacher_avatars[idx] or None,
                    cover_image_url = self.course_images[idx] or None,
                    price_coins     = self.course_prices[idx] or None,
                )
            )
            if len(results) >= top_k:
                break

        return results, False

    # ─── Recommend by user_interests ─────────────────────────────────────────
    async def _get_by_preference(
        self,
        top_k: int,
        category_ids: Set[int],
    ) -> List[CourseScore]:
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(
            None,
            lambda: self.sb.table("courses")
            .select(
                "id, title, cover_image_url, price_coins, total_enrolled,"
                "category_id, sub_category_1_id, sub_category_2_id,"
                "instructor_id, instructors(avatar_url),"
                "main_cat:category_id(name),"
                "sub1:sub_category_1_id(name),"
                "sub2:sub_category_2_id(name)"
            )
            .eq("status", "published")
            .in_("category_id", list(category_ids))
            .order("total_enrolled", desc=True)
            .limit(top_k)
            .execute(),
        )

        results: List[CourseScore] = []
        for row in res.data or []:
            main_cat = (row.get("main_cat") or {}).get("name", "")
            sub1     = (row.get("sub1") or {}).get("name", "")
            sub2     = (row.get("sub2") or {}).get("name", "")
            teacher_avatar = ""
            if row.get("instructors") and isinstance(row.get("instructors"), dict):
                teacher_avatar = row.get("instructors", {}).get("avatar_url", "") or ""
            results.append(
                CourseScore(
                    course_id       = row["id"],
                    title           = row["title"],
                    score           = round(BLEND_INTERESTS * 1.0, 4),
                    # interest score เต็ม × BLEND_INTERESTS weight = 0.30
                    main_category   = main_cat or None,
                    sub_categories  = [s for s in [sub1, sub2] if s],
                    teacher_avatar_url = teacher_avatar or None,
                    cover_image_url = row.get("cover_image_url"),
                    price_coins     = row.get("price_coins"),
                )
            )
        return results

    # ─── Popular fallback ─────────────────────────────────────────────────────
    async def _get_popular(
        self,
        top_k: int,
        exclude_ids: Set[int],
    ) -> List[CourseScore]:
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(
            None,
            lambda: self.sb.table("courses")
            .select(
                "id, title, cover_image_url, price_coins, total_enrolled,"
                "instructor_id, instructors(avatar_url),"
                "main_cat:category_id(name),"
                "sub1:sub_category_1_id(name),"
                "sub2:sub_category_2_id(name)"
            )
            .eq("status", "published")
            .order("total_enrolled", desc=True)
            .limit(top_k + len(exclude_ids) + 10)
            .execute(),
        )

        results: List[CourseScore] = []
        for row in res.data or []:
            if row["id"] in exclude_ids:
                continue
            main_cat = (row.get("main_cat") or {}).get("name", "")
            sub1     = (row.get("sub1") or {}).get("name", "")
            sub2     = (row.get("sub2") or {}).get("name", "")
            teacher_avatar = ""
            if row.get("instructors") and isinstance(row.get("instructors"), dict):
                teacher_avatar = row.get("instructors", {}).get("avatar_url", "") or ""
            results.append(
                CourseScore(
                    course_id       = row["id"],
                    title           = row["title"],
                    score           = 0.0,
                    main_category   = main_cat or None,
                    sub_categories  = [s for s in [sub1, sub2] if s],
                    teacher_avatar_url = teacher_avatar or None,
                    cover_image_url = row.get("cover_image_url"),
                    price_coins     = row.get("price_coins"),
                )
            )
            if len(results) >= top_k:
                break
        return results