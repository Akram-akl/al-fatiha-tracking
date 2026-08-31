/**
 * بيانات سورة الفاتحة الكاملة ومصفوفة الكلمات الـ 29 للتقييم والتصحيح
 * المصدر: مجمع الملك فهد لطباعة المصحف الشريف (KFGQPC Hafs Uthmanic Script v2.0)
 * الخط: uthmanic_hafs_v20.ttf
 */

const FATIHA_DATA = {
  sura_no: 1,
  sura_name_ar: "الفَاتِحة",
  sura_name_en: "Al-Fatiha",
  jozz: 1,
  page: 1,

  /**
   * إجمالي عدد كلمات سورة الفاتحة — 29 كلمة
   */
  total_words: 29,

  ayat: [
    {
      id: 1,
      aya_no: 1,
      line_start: 2,
      line_end: 2,
      aya_text: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ﰀ",
      aya_text_emlaey: "بسم الله الرحمن الرحيم",
      word_count: 4,
      end_glyph: "ﰀ"
    },
    {
      id: 2,
      aya_no: 2,
      line_start: 3,
      line_end: 3,
      aya_text: "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ ﰁ",
      aya_text_emlaey: "الحمد لله رب العالمين",
      word_count: 4,
      end_glyph: "ﰁ"
    },
    {
      id: 3,
      aya_no: 3,
      line_start: 4,
      line_end: 4,
      aya_text: "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ ﰂ",
      aya_text_emlaey: "الرحمن الرحيم",
      word_count: 2,
      end_glyph: "ﰂ"
    },
    {
      id: 4,
      aya_no: 4,
      line_start: 4,
      line_end: 4,
      aya_text: "مَٰلِكِ يَوۡمِ ٱلدِّينِ ﰃ",
      aya_text_emlaey: "مالك يوم الدين",
      word_count: 3,
      end_glyph: "ﰃ"
    },
    {
      id: 5,
      aya_no: 5,
      line_start: 5,
      line_end: 5,
      aya_text: "إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ ﰄ",
      aya_text_emlaey: "إياك نعبد وإياك نستعين",
      word_count: 4,
      end_glyph: "ﰄ"
    },
    {
      id: 6,
      aya_no: 6,
      line_start: 5,
      line_end: 6,
      aya_text: "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ ﰅ",
      aya_text_emlaey: "اهدنا الصراط المستقيم",
      word_count: 3,
      end_glyph: "ﰅ"
    },
    {
      id: 7,
      aya_no: 7,
      line_start: 6,
      line_end: 8,
      aya_text: "صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ ﰆ",
      aya_text_emlaey: "صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين",
      word_count: 9,
      end_glyph: "ﰆ"
    }
  ],

  /**
   * مصفوفة الكلمات الـ 29 الفردية برسم المصحف العثماني لتحديد الأخطاء بدقة
   */
  words: [
    // الآية 1
    { id: "w_1_1", aya_no: 1, word_no: 1, text: "بِسۡمِ" },
    { id: "w_1_2", aya_no: 1, word_no: 2, text: "ٱللَّهِ" },
    { id: "w_1_3", aya_no: 1, word_no: 3, text: "ٱلرَّحۡمَٰنِ" },
    { id: "w_1_4", aya_no: 1, word_no: 4, text: "ٱلرَّحِيمِ" },
    // الآية 2
    { id: "w_2_1", aya_no: 2, word_no: 1, text: "ٱلۡحَمۡدُ" },
    { id: "w_2_2", aya_no: 2, word_no: 2, text: "لِلَّهِ" },
    { id: "w_2_3", aya_no: 2, word_no: 3, text: "رَبِّ" },
    { id: "w_2_4", aya_no: 2, word_no: 4, text: "ٱلۡعَٰلَمِينَ" },
    // الآية 3
    { id: "w_3_1", aya_no: 3, word_no: 1, text: "ٱلرَّحۡمَٰنِ" },
    { id: "w_3_2", aya_no: 3, word_no: 2, text: "ٱلرَّحِيمِ" },
    // الآية 4
    { id: "w_4_1", aya_no: 4, word_no: 1, text: "مَٰلِكِ" },
    { id: "w_4_2", aya_no: 4, word_no: 2, text: "يَوۡمِ" },
    { id: "w_4_3", aya_no: 4, word_no: 3, text: "ٱلدِّينِ" },
    // الآية 5
    { id: "w_5_1", aya_no: 5, word_no: 1, text: "إِيَّاكَ" },
    { id: "w_5_2", aya_no: 5, word_no: 2, text: "نَعۡبُدُ" },
    { id: "w_5_3", aya_no: 5, word_no: 3, text: "وَإِيَّاكَ" },
    { id: "w_5_4", aya_no: 5, word_no: 4, text: "نَسۡتَعِينُ" },
    // الآية 6
    { id: "w_6_1", aya_no: 6, word_no: 1, text: "ٱهۡدِنَا" },
    { id: "w_6_2", aya_no: 6, word_no: 2, text: "ٱلصِّرَٰطَ" },
    { id: "w_6_3", aya_no: 6, word_no: 3, text: "ٱلۡمُسۡتَقِيمَ" },
    // الآية 7
    { id: "w_7_1", aya_no: 7, word_no: 1, text: "صِرَٰطَ" },
    { id: "w_7_2", aya_no: 7, word_no: 2, text: "ٱلَّذِينَ" },
    { id: "w_7_3", aya_no: 7, word_no: 3, text: "أَنۡعَمۡتَ" },
    { id: "w_7_4", aya_no: 7, word_no: 4, text: "عَلَيۡهِمۡ" },
    { id: "w_7_5", aya_no: 7, word_no: 5, text: "غَيۡرِ" },
    { id: "w_7_6", aya_no: 7, word_no: 6, text: "ٱلۡمَغۡضُوبِ" },
    { id: "w_7_7", aya_no: 7, word_no: 7, text: "عَلَيۡهِمۡ" },
    { id: "w_7_8", aya_no: 7, word_no: 8, text: "وَلَا" },
    { id: "w_7_9", aya_no: 7, word_no: 9, text: "ٱلضَّآلِّينَ" }
  ]
};

/**
 * حساب نسبة الإتقان بناءً على عدد الأخطاء
 * @param {number} errors - عدد أخطاء الطالبة (من 0 إلى 29)
 * @returns {{ mastery: number, level: string, errors: number }}
 */
function calculateMastery(errors) {
  const totalWords = FATIHA_DATA.total_words; // 29 كلمة
  const safeErrors = Math.max(0, Math.min(errors, totalWords));
  const correctWords = totalWords - safeErrors;
  const mastery = Math.round((correctWords / totalWords) * 100);

  let level;
  if (mastery >= 95) level = "ممتاز";
  else if (mastery >= 80) level = "جيد جداً";
  else if (mastery >= 65) level = "جيد";
  else if (mastery >= 50) level = "مقبول";
  else level = "يحتاج متابعة";

  return { mastery, level, errors: safeErrors };
}
