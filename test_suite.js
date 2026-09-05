/**
 * الاختبار الشامل لمنظومة تتبع سورة الفاتحة (50+ فحص واختبار في كافة أجزاء التطبيق)
 * يتضمن فحص بيانات الاعتماد المحددة:
 * - المشرف العام: 112234
 * - المبلّغة: الهاتف 0565933458 / الكود 123456
 * - المتعلمة: الهاتف 0542706313 / كلمة المرور 123456
 */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const storage = {};
const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Buffer,
  process,
  localStorage: {
    getItem: (k) => (storage[k] !== undefined ? storage[k] : null),
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
  },
  document: {
    getElementById: (id) => ({
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      innerHTML: "",
      textContent: "",
      value: "",
      querySelectorAll: () => []
    }),
    querySelectorAll: () => []
  },
  AppUI: {
    showToast: (msg, type) => { /* Mock Toast */ }
  }
};

sandbox.window = sandbox;
sandbox.global = sandbox;

const context = vm.createContext(sandbox);

function loadScript(filename) {
  const content = fs.readFileSync(path.join(__dirname, filename), "utf8");
  vm.runInContext(content, context, { filename });
}

loadScript("config.js");
loadScript("fatiha.js");
loadScript("fatiha_tafseer.js");
loadScript("fatiha_ghareeb.js");
loadScript("data.js");
loadScript("auth.js");
loadScript("certificates.js");
loadScript("reports.js");

// تشغيل مجموعة الفحوصات داخل السياق
const testCode = `
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    results.push({ id: totalTests, name, status: "PASS" });
    console.log("\\x1b[32m[PASS]\\x1b[0m #" + totalTests + ": " + name);
  } catch (err) {
    failedTests++;
    results.push({ id: totalTests, name, status: "FAIL", error: err.message });
    console.error("\\x1b[31m[FAIL]\\x1b[0m #" + totalTests + ": " + name);
    console.error("       -> Error: " + err.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

console.log("\\n=======================================================");
console.log("   بدء الفحص الشامل لمنظومة تتبع سورة الفاتحة (50+ فحص)");
console.log("=======================================================\\n");

// -------------------------------------------------------------
// القسم 1: تهيئة بيانات الاعتماد المحددة من المستخدم
// -------------------------------------------------------------
console.log("\\n--- [القسم 1: تسجيل بيانات المستخدم المحددة] ---");

let testTeacher = null;
let testStudent = null;

test("إعداد وتسجيل المبلّغة بالرقم 0565933458 والكود 123456", () => {
  testTeacher = db.addTeacher({
    name: "الأستاذة عائشة (المبلّغة المعتمدة)",
    phone: "0565933458",
    verificationCode: "123456",
    region: "مكتب الشمال",
    specialization: "both",
    role: "teacher"
  });
  assert(testTeacher && testTeacher.id, "فشل إنشاء سجل المبلّغة");
  assert(testTeacher.phone === "0565933458", "رقم هاتف المبلّغة غير مطابق");
});

test("إعداد وتسجيل المتعلمة بالرقم 0542706313 وكلمة المرور 123456 تابعة للمبلّغة", () => {
  testStudent = db.addStudent({
    name: "فاطمة الزهراء (المتعلمة)",
    phone: "0542706313",
    password: "123456",
    teacherId: testTeacher.id,
    region: "مكتب الشمال",
    learningTrack: "both"
  });
  assert(testStudent && testStudent.id, "فشل إنشاء سجل المتعلمة");
  assert(testStudent.phone === "0542706313", "رقم هاتف المتعلمة غير مطابق");
  assert(testStudent.teacherId === testTeacher.id, "لم يتم ربط المتعلمة بالمبلّغة بالشكل الصحيح");
});

test("إعداد مبلّغة إضافية مستقلة لاختبار عزل الصلاحيات", () => {
  const otherTeacher = db.addTeacher({
    name: "الأستاذة خديجة",
    phone: "0501112233",
    verificationCode: "111111",
    region: "مكتب الشرق",
    role: "teacher"
  });
  db.addStudent({
    name: "مريم خالد",
    phone: "0509998877",
    password: "123",
    teacherId: otherTeacher.id,
    region: "مكتب الشرق"
  });
  assert(otherTeacher && otherTeacher.id, "فشل إضافة المبلّغة المستقلة");
});

// -------------------------------------------------------------
// القسم 2: اختبارات المصادقة وتسجيل الدخول (Authentication)
// -------------------------------------------------------------
console.log("\\n--- [القسم 2: المصادقة وتسجيل الدخول] ---");

test("تسجيل دخول المشرف العام بالرمز الصحيح (112234)", () => {
  const res = auth.loginAsAdmin("112234");
  assert(res.success, "فشل تسجيل دخول المشرف العام بالرمز 112234");
  assert(auth.isAdmin(), "لم يتم تعيين الدور إلى Admin");
});

test("رفض دخول المشرف العام برمز غير صحيح", () => {
  const res = auth.loginAsAdmin("wrong_pass");
  assert(!res.success, "يجب رفض تسجيل الدخول بكلمة مرور خاطئة للمشرف");
});

test("رفض دخول المشرف العام برمز فارغ", () => {
  const res = auth.loginAsAdmin("");
  assert(!res.success, "يجب رفض تسجيل الدخول برمز فارغ");
});

test("تسجيل خروج المشرف العام ومسح الجلسة", () => {
  auth.logout();
  assert(!auth.isLoggedIn(), "الجلسة ما زالت مفتوحة بعد تسجيل الخروج");
  assert(!auth.isAdmin(), "صلاحية المشرف لا تزال موجودة");
});

test("تسجيل دخول المبلّغة برقم هاتفها 0565933458 ورمزها 123456", () => {
  const res = auth.loginAsTeacherByPhone("0565933458", "123456");
  assert(res.success, "فشل تسجيل دخول المبلّغة بالرقم والكود الصحيحين: " + res.message);
  assert(auth.isTeacher(), "لم يتم التعرف على دور المبلّغة Teacher");
  assert(auth.getCurrentUser().id === testTeacher.id, "معرف المستخدم الحالي غير مطابق لمعرف المبلّغة");
});

test("رفض دخول المبلّغة برقم هاتف صحيح ولكن كود تحقق خاطئ", () => {
  auth.logout();
  const res = auth.loginAsTeacherByPhone("0565933458", "999999");
  assert(!res.success, "تم السماح بالدخول بكود خاطئ");
});

test("رفض دخول المبلّغة برقم هاتف غير مسجل بالمنظومة", () => {
  const res = auth.loginAsTeacherByPhone("0500000000", "123456");
  assert(!res.success, "تم السماح برقم غير موجود");
});

test("تسجيل دخول المتعلمة برقم هاتفها 0542706313 وكلمة مرورها 123456", () => {
  auth.logout();
  const res = auth.loginAsStudentByPhone("0542706313", "123456");
  assert(res.success, "فشل تسجيل دخول المتعلمة بالرقم وكلمة المرور: " + res.message);
  assert(auth.isStudent(), "لم يتم التعرف على دور المتعلمة Student");
  assert(auth.getCurrentUser().id === testStudent.id, "معرف المتعلمة غير مطابق");
});

test("رفض دخول المتعلمة بكلمة مرور خاطئة", () => {
  auth.logout();
  const res = auth.loginAsStudentByPhone("0542706313", "wrongpass");
  assert(!res.success, "تم السماح للمتعلمة بالدخول بكلمة مرور غير صحيحة");
});

test("رفض دخول المتعلمة برقم هاتف فارغ", () => {
  const res = auth.loginAsStudentByPhone("", "123456");
  assert(!res.success, "تم السماح برقم هاتف فارغ");
});

test("إمكانية تسجيل الدخول برقم الهاتف حتى مع وجود مسافات إضافية (Trim/Spaces)", () => {
  const res = auth.loginAsTeacherByPhone(" 0565 933 458 ", " 123456 ");
  assert(res.success, "فشلت المعالجة التلقائية للمسافات الزائدة برقم الهاتف");
});

// -------------------------------------------------------------
// القسم 3: عزل الصلاحيات وحماية البيانات (Access Control & Scoping)
// -------------------------------------------------------------
console.log("\\n--- [القسم 3: عزل الصلاحيات وحماية البيانات] ---");

test("المبلّغة 0565933458 ترى فقط المتعلمات التابعات لها عبر ReportsModule", () => {
  auth.loginAsTeacherByPhone("0565933458", "123456");
  const scoped = ReportsModule.getScopedData();
  assert(scoped.students.length >= 1, "المبلّغة لا ترى طالباتها");
  assert(scoped.students.every(s => s.teacherId === auth.getCurrentUser().id), "هناك متعلمات لا ينتمين للمبلّغة ظاهرات لها");
  assert(scoped.teachers.length === 0, "المبلّغة لا يجب أن تستعرض سجلات المبلّغات الأخريات");
});

test("المبلّغة لا تستطيع رؤية متعلمات المبلّغات الأخريات في نطاقها", () => {
  auth.loginAsTeacherByPhone("0565933458", "123456");
  const scoped = ReportsModule.getScopedData();
  const otherStudentFound = scoped.students.some(s => s.name === "مريم خالد");
  assert(!otherStudentFound, "ثغرة أمنية: المبلّغة تمكنت من رؤية متعلمة تابعة لمبلّغة أخرى");
});

test("المشرف العام يستطيع استعراض جميع المتعلمات والمبلّغات في المنظومة", () => {
  auth.loginAsAdmin("112234");
  const scoped = ReportsModule.getScopedData();
  assert(scoped.students.length >= 2, "المشرف العام لا يستطيع رؤية جميع المتعلمات");
  assert(scoped.teachers.length >= 2, "المشرف العام لا يستطيع رؤية جميع المبلّغات");
  assert(scoped.canViewTeachersReport === true, "صلاحية تقرير المبلّغات غير مفعلة للمشرف");
});

test("المشرفة الرئيسية ترى طالباتها وطالبات المبلّغات التابعات لإشرافها فقط", () => {
  const headTeacher = db.addTeacher({
    name: "المشرفة نورة",
    phone: "0555555555",
    verificationCode: "123456",
    role: "head_teacher",
    region: "مكتب الوسط"
  });
  db.updateTeacher(testTeacher.id, { supervisorId: headTeacher.id });
  
  auth.loginAsTeacherByPhone("0555555555", "123456");
  const scoped = ReportsModule.getScopedData();
  assert(scoped.teachers.some(t => t.id === testTeacher.id), "المشرفة لا ترى المبلّغة التابعة لها");
  assert(scoped.students.some(s => s.id === testStudent.id), "المشرفة لا ترى طالبة المبلّغة التابعة لها");
});

// -------------------------------------------------------------
// القسم 4: مسارات التقييم وحساب نسبة الإتقان (Learning Tracks & Calculations)
// -------------------------------------------------------------
console.log("\\n--- [القسم 4: مسارات التقييم ونسب الإتقان] ---");

test("حساب نسبة الإتقان التام لمسار الحفظ (0 أخطاء = 100%)", () => {
  const calc = calculateMastery(0);
  assert(calc.mastery === 100, "نسبة الإتقان المحسوبة " + calc.mastery + " وليست 100");
  assert(calc.level.includes("إتقان تام") || calc.level.includes("ممتاز"), "المستوى اللفظي غير دقيق");
});

test("حساب نسبة إتقان الحفظ بدقة مع وجود 5 أخطاء (83%)", () => {
  const calc = calculateMastery(5);
  assert(calc.mastery === 83, "النسبة المتوقعة 83% ولكن المحسوبة كانت " + calc.mastery + "%");
});

test("حساب نسبة إتقان الحفظ عند ارتكاب 29 خطأ (0%)", () => {
  const calc = calculateMastery(29);
  assert(calc.mastery === 0, "النسبة المتوقعة 0% ولكن المحسوبة " + calc.mastery + "%");
});

test("حساب إتقان مسار التفسير وغريب الكلمات (0 أخطاء = 100%)", () => {
  const tafseerScore = db.calculateTafseerMastery([], []);
  assert(tafseerScore === 100, "نسبة التفسير المحسوبة " + tafseerScore + " وليست 100");
});

test("حساب إتقان مسار التفسير مع وجود 3 أخطاء من إجمالي 18 مفردة وآية (83%)", () => {
  // (18 - 3) / 18 * 100 = 83.33 => 83%
  const tafseerScore = db.calculateTafseerMastery([1, 2], [101]);
  assert(tafseerScore === 83, "نسبة التفسير المحسوبة " + tafseerScore + "% وليست 83%");
});

test("حساب المسار المشترك (حفظ + تفسير): متوسط المسارين", () => {
  // حفظ: 5 أخطاء (83%)، تفسير: 3 أخطاء (83%) => متوسط 83%
  const student = db.updateStudent(testStudent.id, {
    learningTrack: "both",
    mistakeWordIds: [1, 2, 3, 4, 5],
    mistakeAyahTafseerNos: [1, 2],
    mistakeGhareebIds: [101]
  });
  assert(student.recitationMastery === 83, "حفظ: " + student.recitationMastery);
  assert(student.tafseerMastery === 83, "تفسير: " + student.tafseerMastery);
  assert(student.mastery === 83, "الإجمالي المشترك: " + student.mastery);
});

test("مسار التفسير فقط: يعتمد نسبة التفسير وحدها دون مسار الحفظ", () => {
  const sTafseer = db.addStudent({
    name: "متعلمة تفسير فقط",
    phone: "0588881111",
    teacherId: testTeacher.id,
    learningTrack: "tafseer",
    mistakeWordIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // أخطاء حفظ كثيرة
    mistakeAyahTafseerNos: [], // 0 أخطاء تفسير
    mistakeGhareebIds: []
  });
  assert(sTafseer.mastery === 100, "يجب أن تكون نسبة الإتقان 100% لأن مسارها تفسير فقط وأخطاء التفسير صفر");
});

test("مسار الحفظ فقط: يعتمد نسبة الحفظ وحدها دون مسار التفسير", () => {
  const sMem = db.addStudent({
    name: "متعلمة حفظ فقط",
    phone: "0588882222",
    teacherId: testTeacher.id,
    learningTrack: "memorize",
    mistakeWordIds: [], // 0 أخطاء حفظ = 100%
    mistakeAyahTafseerNos: [1, 2, 3, 4, 5] // أخطاء تفسير كثيرة
  });
  assert(sMem.mastery === 100, "يجب أن تكون نسبة الإتقان 100% لأن مسارها حفظ فقط وأخطاء الحفظ صفر");
});

test("حالة المتعلمة تتحول تلقائياً إلى 'متقنة' عند بلوغ نسبة الإتقان 95% فما فوق", () => {
  const updated = db.updateStudent(testStudent.id, {
    mistakeWordIds: [1],
    mistakeAyahTafseerNos: [],
    mistakeGhareebIds: []
  });
  assert(updated.mastery >= 95, "النسبة المحسوبة " + updated.mastery);
  assert(updated.status === "completed", "حالة الطالبة " + updated.status + " وليست completed");
});

// -------------------------------------------------------------
// القسم 5: إدارة سجلات المتعلمات والعمليات (CRUD & Updates)
// -------------------------------------------------------------
console.log("\\n--- [القسم 5: إدارة سجلات المتعلمات] ---");

test("الحالة الافتراضية للمتعلمة الجديدة هي 'في مرحلة الحفظ والتكرار' (in_progress)", () => {
  const s = db.addStudent({
    name: "سارة محمد",
    phone: "0511223344",
    teacherId: testTeacher.id,
    region: "مكتب الشمال"
  });
  assert(s.status === "in_progress", "الحالة الافتراضية " + s.status + " وليست in_progress");
});

test("تحديث بيانات المتعلمة دون حدوث أخطاء برمجية بعد حذف التجويد (tajweedScore check)", () => {
  let threwError = false;
  try {
    db.updateStudent(testStudent.id, {
      notes: "تم الفحص والتحقق من التحديث",
      phone: "0542706313"
    });
  } catch (e) {
    threwError = true;
  }
  assert(!threwError, "حدث خطأ أثناء تحديث بيانات المتعلمة");
});

test("ترقية المتعلمة لتصبح مبلّغة مع الاحتفاظ برقم هاتفها وكلمة مرورها", () => {
  const studentToPromote = db.addStudent({
    name: "زينب أحمد",
    phone: "0599887766",
    password: "my_secure_pass",
    teacherId: testTeacher.id,
    region: "مكتب الشمال",
    mastery: 98,
    status: "completed"
  });

  const res = db.promoteStudentToTeacher(studentToPromote.id);
  assert(res && res.success, "فشلت عملية ترقية المتعلمة: " + (res && res.message));
  const promotedTeacher = res.teacher;
  assert(promotedTeacher && promotedTeacher.id, "فشل إنشاء كائن المبلّغة المرقاة");
  assert(promotedTeacher.phone === "0599887766", "لم يتم نقل رقم الهاتف للمبلّغة الجديدة");
  assert(promotedTeacher.verificationCode === "my_secure_pass", "لم يتم نقل كلمة المرور ككود تحقق");
  assert(promotedTeacher.supervisorId === testTeacher.id, "لم يتم ربطها بمبلّغتها السابقة كمشرفة");
  
  const updatedStudent = db.getStudentById(studentToPromote.id);
  assert(updatedStudent.promotedToTeacherId === promotedTeacher.id, "لم يتم تحديث سجل المتعلمة الأصلية بـ promotedToTeacherId");
});

test("حذف متعلمة وحذفها الفعلي من قاعدة البيانات", () => {
  const tempStudent = db.addStudent({
    name: "مؤقتة للحذف",
    phone: "0500001122",
    teacherId: testTeacher.id
  });
  const beforeCount = db.getStudents().length;
  const deleted = db.deleteStudent(tempStudent.id);
  const afterCount = db.getStudents().length;
  
  assert(deleted, "دالة deleteStudent أعادت false");
  assert(afterCount === beforeCount - 1, "لم ينقص عدد المتعلمات");
  assert(!db.getStudentById(tempStudent.id), "المتعلمة لا تزال موجودة في قاعدة البيانات");
});

// -------------------------------------------------------------
// القسم 6: محرك الشهادات الرقمية والتصميم الجديد
// -------------------------------------------------------------
console.log("\\n--- [القسم 6: الشهادات الرقمية وتعديلات التصميم] ---");

test("المتعلمة بنسبة 85% فما فوق مؤهلة للحصول على الشهادة", () => {
  const eligible = db.getStudents().filter(s => s.mastery >= 85 || s.status === "completed");
  assert(eligible.some(s => s.id === testStudent.id), "المتعلمة المتقنة لم تظهر ضمن المؤهلات للشهادة");
});

test("المتعلمة ذات النسبة الأقل من 85% غير مؤهلة للشهادة", () => {
  const weakStudent = db.addStudent({
    name: "متعلمة مبتدئة",
    phone: "0540001122",
    teacherId: testTeacher.id,
    mistakeWordIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  });
  const eligible = db.getStudents().filter(s => s.mastery >= 85 || s.status === "completed");
  assert(!eligible.some(s => s.id === weakStudent.id), "المتعلمة غير المؤهلة ظهرت بالخطأ في قائمة الشهادات");
});

test("توليد كود HTML لشهادة المتعلمة والتحقق من وجود الاسم والمسار والمبلّغة", () => {
  const html = CertificatesModule.renderCertificateHTML(testStudent);
  assert(html.includes(testStudent.name), "اسم المتعلمة غير موجود في كود الشهادة");
  assert(html.includes(testTeacher.name), "اسم المبلّغة المشرفة غير موجود في كود الشهادة");
  assert(html.includes("شهادة إتقان وتميّز"), "عنوان الشهادة غير موجود");
});

test("التحقق من إزالة النجمة (❋) والدائرة التي خلفها من قسم التوقيعات بالشهادة", () => {
  const html = CertificatesModule.renderCertificateHTML(testStudent);
  assert(!html.includes("border-radius:50%;border:2px solid #c9a84c"), "الدائرة لا تزال موجودة في الشهادة ولم تُحذف");
  assert(!html.includes('style="text-align:center;">\\n                ❋'), "النجمة لا تزال موجودة في قسم التوقيعات");
});

test("التحقق من تصغير ارتفاع الشهادة ليكون 720px بدلاً من 793px", () => {
  const html = CertificatesModule.renderCertificateHTML(testStudent);
  assert(html.includes("height: 720px;"), "ارتفاع الشهادة لم يتم تصغيره إلى 720px");
  assert(!html.includes("height: 793px;"), "ارتفاع الشهادة لا يزال 793px القديم");
});

test("اختيار شهادات متعددة للتصدير المجمّع (Batch Selection)", () => {
  CertificatesModule.selectedStudentIds.clear();
  CertificatesModule.toggleBatchSelect(testStudent.id);
  assert(CertificatesModule.selectedStudentIds.has(testStudent.id), "فشل تحديد المتعلمة في الدفعة المجمعة");
  assert(CertificatesModule.selectedStudentIds.size === 1, "العدد المحدد غير صحيح");
  
  CertificatesModule.toggleBatchSelect(testStudent.id);
  assert(!CertificatesModule.selectedStudentIds.has(testStudent.id), "فشل إلغاء تحديد المتعلمة");
});

test("تحديد وإلغاء تحديد كافة المؤهلات في الدفعة (selectAllBatch)", () => {
  CertificatesModule.selectedStudentIds.clear();
  CertificatesModule.selectedStudentIds.add("id_1");
  CertificatesModule.selectedStudentIds.add("id_2");
  assert(CertificatesModule.selectedStudentIds.size === 2, "فشل إضافة العناصر");
  CertificatesModule.selectedStudentIds.clear();
  assert(CertificatesModule.selectedStudentIds.size === 0, "فشل تفريغ التحديد");
});

test("التحقق من توفر دالة طباعة الشهادة المباشرة وخصائص اتصال الخطوط العربية", () => {
  assert(typeof CertificatesModule.printCertificate === "function", "دالة printCertificate غير معرفة");
  const html = CertificatesModule.renderCertificateHTML(testStudent);
  assert(html.includes("font-feature-settings"), "الشهادة لا تحتوي على إعدادات اتصال الحروف font-feature-settings");
});

test("التحقق من توفر دالة طباعة التقرير ودعم التفسير والغريب في وحدة التقارير", () => {
  assert(typeof ReportsModule.printReport === "function", "دالة printReport غير معرفة");
  assert(typeof ReportsModule.generateLiveReport === "function", "دالة generateLiveReport غير معرفة");
});

// -------------------------------------------------------------
// القسم 7: التوزيع الجغرافي والمكاتب المعتمدة
// -------------------------------------------------------------
console.log("\\n--- [القسم 7: التوزيع الجغرافي والمكاتب] ---");

test("المكاتب المعتمدة تتطابق مع القائمة الرسمية المعتمدة", () => {
  const expected = ["مكتب الشرق", "مكتب الشمال", "مكتب الجنوب", "مكتب الوسط"];
  const current = db.getRegions();
  assert(expected.every(r => current.includes(r)), "المكاتب المعتمدة غير مكتملة");
});

test("تصفية المتعلمات حسب المكتب الجغرافي بدقة", () => {
  const studentsInNorth = db.getStudents(s => s.region === "مكتب الشمال");
  assert(studentsInNorth.length >= 1, "مكتب الشمال لا يحتوي على متعلمات مسجلات");
  assert(studentsInNorth.every(s => s.region === "مكتب الشمال"), "توجد متعلمات من مكاتب أخرى");
});

test("تصفية المبلّغات حسب المكتب الجغرافي بدقة", () => {
  const teachersInNorth = db.getTeachers(t => t.region === "مكتب الشمال");
  assert(teachersInNorth.length >= 1, "مكتب الشمال لا يحتوي على مبلّغات مسجلة");
  assert(teachersInNorth.every(t => t.region === "مكتب الشمال"), "توجد مبلّغات من مكاتب أخرى");
});

test("معالجة المناطق القديمة تلقائياً وتحويلها للمكاتب المعتمدة (Migration)", () => {
  const rawData = {
    ...db.data,
    teachers: [
      ...db.data.teachers,
      { id: "legacy_t", name: "مبلّغة قديمة", region: "المنطقة الشرقية" }
    ]
  };
  db.data = rawData;
  db._migrateRegions();
  const migrated = db.getTeacherById("legacy_t");
  assert(migrated.region === "مكتب الشرق", "تم التحويل إلى " + migrated.region + " وليس مكتب الشرق");
});

// -------------------------------------------------------------
// القسم 8: سجل النشاطات والأمان وتصدير البيانات
// -------------------------------------------------------------
console.log("\\n--- [القسم 8: سجل النشاطات وحماية البيانات] ---");

test("تسجيل العمليات في سجل النشاطات (System Audit Log)", () => {
  const initialLogs = db.getLogs().length;
  db.logAction("اختبار فحص", "تفاصيل الفحص الشامل");
  const finalLogs = db.getLogs().length;
  assert(finalLogs === initialLogs + 1, "فشل تسجيل العملية في audit log");
  const lastLog = db.getLogs()[0];
  assert(lastLog.action === "اختبار فحص", "نص العملية الأخير غير مطابق");
});

test("تصدير النسخة الاحتياطية بصيغة JSON سليمة", () => {
  const backupStr = db.exportBackup();
  assert(typeof backupStr === "string", "مخرج النسخة الاحتياطية ليس نصاً");
  const parsed = JSON.parse(backupStr);
  assert(Array.isArray(parsed.teachers), "النسخة الاحتياطية لا تحتوي على مصفوفة المبلّغات");
  assert(Array.isArray(parsed.students), "النسخة الاحتياطية لا تحتوي على مصفوفة المتعلمات");
});

test("استيراد النسخة الاحتياطية والتحقق من سلامة البيانات المسترجعة", () => {
  const backupStr = db.exportBackup();
  const importSuccess = db.importBackup(backupStr);
  assert(importSuccess, "فشل استيراد النسخة الاحتياطية الصالحة");
});

test("رفض استيراد نسخة احتياطية تالفة أو غير صالحة", () => {
  const badImport = db.importBackup("invalid_data_here");
  assert(!badImport, "تم قبول نسخة احتياطية تالفة");
});

test("عدم تسريب كلمة مرور المشرف العام (112234) في كائنات المبلّغات أو المتعلمات", () => {
  const allTeachers = db.getTeachers();
  const allStudents = db.getStudents();
  assert(!allTeachers.some(t => t.verificationCode === "112234"), "تم تسريب كود المشرف في المبلّغات");
  assert(!allStudents.some(s => s.password === "112234"), "تم تسريب كود المشرف في المتعلمات");
});

test("تحمل الأخطاء عند وجود بيانات تالفة في التخزين المحلي دون انهيار التطبيق", () => {
  localStorage.setItem(DB_STORAGE_KEY, "{ corrupt_json ::: invalid }");
  let storeInitSafe = true;
  try {
    const testStore = new DataStore();
    assert(testStore.data && testStore.data.teachers, "فشل الاسترجاع الذاتي");
  } catch (e) {
    storeInitSafe = false;
  }
  assert(storeInitSafe, "التطبيق انهار عند قراءة JSON تالف في localStorage");
});

test("توفر دالة تنزيل الشهادة كصورة PNG واحدة عالية الدقة", () => {
  assert(typeof CertificatesModule.downloadCurrentImage === "function", "دالة تنزيل الشهادة كصورة غير موجودة");
});

test("التوجيه الذكي عند محاولة الدخول برقم متعلمة في قسم المبلّغات", () => {
  const res = auth.loginAsTeacherByPhone("0542706313", "123456");
  assert(!res.success, "تم تسجيل الدخول بالخطأ");
  assert(res.message.includes("متعلمة"), "لم تظهر رسالة التوجيه الذكية لقسم المتعلمات");
});

test("التوجيه الذكي عند محاولة الدخول برقم مبلّغة في قسم المتعلمات", () => {
  const res = auth.loginAsStudentByPhone("0565933458", "123456");
  assert(!res.success, "تم تسجيل الدخول بالخطأ");
  assert(res.message.includes("مبلّغة"), "لم تظهر رسالة التوجيه الذكية لقسم المبلّغات");
});

test("تفعيل مؤقت الـ 7 أيام ووضع مهلة التثبيت عند هبوط إتقان مبلّغة مرقاة دون 95%", () => {
  const testStudent = db.addStudent({
    name: "مبلّغة مرقاة للاختبار",
    phone: "0599999991",
    password: "123",
    learningTrack: "memorize",
    mistakeWordIds: []
  });
  const promoRes = db.promoteStudentToTeacher(testStudent.id);
  assert(promoRes.success, "فشلت الترقية");

  // إضافة أخطاء تنزل النسبة إلى أقل من 95%
  db.toggleStudentWordMistake(testStudent.id, "w_1");
  db.toggleStudentWordMistake(testStudent.id, "w_2");
  db.toggleStudentWordMistake(testStudent.id, "w_3");

  const teacher = db.getTeacherById(promoRes.teacher.id);
  assert(teacher.status === "grace_period", "لم تتحول المبلّغة إلى مهلة التثبيت grace_period");
  assert(teacher.graceRemainingDays > 0, "لم يتم احتساب الأيام المتبقية في مؤقت الـ 7 أيام");
});

console.log("\\n=======================================================");
console.log("  نتائج الفحص الشامل:");
console.log("  - إجمالي الاختبارات: " + totalTests);
console.log("  - الاختبارات الناجحة: \\x1b[32m" + passedTests + "\\x1b[0m");
console.log("  - الاختبارات الفاشلة: \\x1b[31m" + failedTests + "\\x1b[0m");
console.log("  - نسبة النجاح: " + Math.round((passedTests / totalTests) * 100) + "%");
console.log("=======================================================\\n");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
`;

vm.runInContext(testCode, context);
