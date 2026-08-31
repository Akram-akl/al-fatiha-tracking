/**
 * ملف التهيئة والإعدادات العامة للمنظومة (Application Configuration)
 * يدعم: تخصيص الألوان، المناطق المعتمدة، الحالات الموسعة لإتقان الطالبة، والصلاحيات
 */

const APP_CONFIG = {
  appName: "بلغوا عني ولو آية",
  appSubtitle: "مبادرة متابعة وإتقان سورة الفاتحة",
  version: "2.5.0",

  /**
   * المناطق الجغرافية الثابتة والمعتمدة للجمعية
   */
  defaultRegions: [
    "المنطقة الوسطى",
    "المنطقة الغربية",
    "المنطقة الشرقية",
    "المنطقة الجنوبية",
    "المنطقة الشمالية"
  ],

  /**
   * حالات إتقان ومتابعة الطالبة الموسعة والتربوية
   */
  studentStatuses: [
    {
      id: "completed",
      label: "أتمت الإتقان والتجويد (متقنة)",
      badgeClass: "status-completed",
      color: "#2e7d32",
      icon: "verified"
    },
    {
      id: "near_completion",
      label: "قاربت على الإتقان (تصويبات يسيرة)",
      badgeClass: "status-in_progress",
      color: "#516447",
      icon: "task_alt"
    },
    {
      id: "in_progress",
      label: "في مرحلة الحفظ والتكرار",
      badgeClass: "status-in_progress",
      color: "#516447",
      icon: "trending_up"
    },
    {
      id: "tajweed_focus",
      label: "ضبط مخارج الحروف والتجويد",
      badgeClass: "status-tajweed",
      color: "#735c00",
      icon: "record_voice_over"
    },
    {
      id: "needs_help",
      label: "تحتاج لمتابعة مكثفة ومساعدة",
      badgeClass: "status-needs_help",
      color: "#ba1a1a",
      icon: "priority_high"
    },
    {
      id: "new_registered",
      label: "مسجلة حديثاً (بانتظار التقييم)",
      badgeClass: "status-new",
      color: "#775464",
      icon: "fiber_new"
    },
    {
      id: "absent_stopped",
      label: "متوقفة مؤقتاً / بانتظار الاستئناف",
      badgeClass: "status-stopped",
      color: "#5f635a",
      icon: "pause_circle"
    }
  ],

  /**
   * مستويات التقييم اللفظي
   */
  masteryLevels: [
    { min: 95, label: "ممتاز (إتقان تام)", color: "#2e7d32" },
    { min: 80, label: "جيد جداً", color: "#516447" },
    { min: 65, label: "جيد", color: "#735c00" },
    { min: 50, label: "مقبول", color: "#d97706" },
    { min: 0, label: "يحتاج متابعة وتصحيح", color: "#ba1a1a" }
  ],

  roles: {
    ADMIN: "admin",
    HEAD_TEACHER: "head_teacher",
    TEACHER: "teacher",
    STUDENT: "student"
  },

  specializations: [
    { id: "both", label: "كلاهما (ناطقين وغير ناطقين بالعربية)" },
    { id: "arabic", label: "ناطقين بالعربية فقط" },
    { id: "non_arabic", label: "غير ناطقين بالعربية فقط" }
  ]
};
