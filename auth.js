/**
 * وحدة المصادقة وإدارة الأدوار والصلاحيات (Authentication & Authorization)
 * تدعم: المشرف العام (112234)، المعلمة (بكود التحقق)، الطالبة (بكلمة المرور)
 */

const AUTH_SESSION_KEY = "al_fatiha_auth_session_v2";

class AuthService {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  saveSession() {
    if (this.currentUser) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }

  /**
   * تسجيل الدخول كمشرف عام (112234)
   */
  loginAsAdmin(password) {
    const cleanPass = (password || "").trim();
    if (cleanPass === "112234") {
      this.currentUser = {
        id: "admin_root",
        name: "المشرف العام",
        role: APP_CONFIG.roles.ADMIN,
        username: "admin"
      };
      this.saveSession();
      return { success: true, user: this.currentUser };
    }
    return { success: false, message: "كلمة مرور المشرف غير صحيحة (112234)" };
  }

  /**
   * تسجيل الدخول كمبلّغة عن طريق رقم الهاتف + كلمة المرور
   */
  loginAsTeacherByPhone(phone, verificationCode) {
    const cleanPhone = (phone || "").trim().replace(/\s/g, "");
    const cleanCode  = (verificationCode || "").trim();

    if (!cleanPhone) return { success: false, message: "يرجى إدخال رقم الهاتف" };
    if (!cleanCode)  return { success: false, message: "يرجى إدخال كلمة المرور / كود التحقق" };

    const teacher = db.getTeachers().find(t =>
      (t.phone || "").trim().replace(/\s/g, "") === cleanPhone
    );

    if (!teacher) {
      return { success: false, message: "لم يتم العثور على مبلّغة بهذا الرقم" };
    }

    const expectedCode = (teacher.verificationCode || teacher.password || "123456").trim();
    if (cleanCode !== expectedCode) {
      return { success: false, message: "كلمة المرور / كود التحقق غير صحيح" };
    }

    this.currentUser = {
      id: teacher.id,
      name: teacher.name,
      role: teacher.role || APP_CONFIG.roles.TEACHER,
      supervisorId: teacher.supervisorId || null,
      specialization: teacher.specialization,
      region: teacher.region
    };
    this.saveSession();
    return { success: true, user: this.currentUser };
  }

  /**
   * تسجيل الدخول كمتعلمة عن طريق رقم الهاتف + كلمة المرور
   */
  loginAsStudentByPhone(phone, password) {
    const cleanPhone = (phone || "").trim().replace(/\s/g, "");
    const cleanPass  = (password || "").trim();

    if (!cleanPhone) return { success: false, message: "يرجى إدخال رقم الهاتف" };
    if (!cleanPass)  return { success: false, message: "يرجى إدخال كلمة المرور" };

    const student = db.getStudents().find(s =>
      (s.phone || "").trim().replace(/\s/g, "") === cleanPhone
    );

    if (!student) {
      return { success: false, message: "لم يتم العثور على متعلمة بهذا الرقم" };
    }

    const expectedPass = (student.password || "123456").trim();
    if (cleanPass !== expectedPass) {
      return { success: false, message: "كلمة المرور غير صحيحة" };
    }

    this.currentUser = {
      id: student.id,
      name: student.name,
      role: APP_CONFIG.roles.STUDENT
    };
    this.saveSession();
    return { success: true, user: this.currentUser };
  }

  /**
   * تسجيل الدخول كمعلمة بالتحقق من كود المعلمة / كلمة المرور (بالـ ID - للاستخدام الداخلي)
   */
  loginAsTeacher(teacherId, verificationCode) {
    const teachers = db.getTeachers();
    const teacher = teachers.find((t) => t.id === teacherId);

    if (!teacher) {
      return { success: false, message: "يرجى اختيار المبلّغة من القائمة" };
    }

    const expectedCode = (teacher.verificationCode || teacher.password || "123456").trim();
    const enteredCode = (verificationCode || "").trim();

    if (!enteredCode) {
      return { success: false, message: "يرجى إدخال كود التحقق" };
    }

    if (enteredCode !== expectedCode) {
      return { success: false, message: "كود التحقق غير صحيح" };
    }

    this.currentUser = {
      id: teacher.id,
      name: teacher.name,
      role: teacher.role || APP_CONFIG.roles.TEACHER,
      supervisorId: teacher.supervisorId || null,
      specialization: teacher.specialization,
      region: teacher.region
    };

    this.saveSession();
    return { success: true, user: this.currentUser };
  }

  /**
   * تسجيل الدخول كطالبة مع التحقق من كلمة المرور
   */
  loginAsStudent(studentId, password) {
    const student = db.getStudentById(studentId);

    if (!student) {
      return { success: false, message: "يرجى اختيار الطالبة من القائمة" };
    }

    const expectedPass = (student.password || "123456").trim();
    const enteredPass = (password || "").trim();

    if (!enteredPass) {
      return { success: false, message: "يرجى إدخال كلمة المرور الخاصة بالطالبة (الافتراضية: 123456)" };
    }

    if (enteredPass !== expectedPass) {
      return { success: false, message: "كلمة مرور الطالبة غير صحيحة" };
    }

    this.currentUser = {
      id: student.id,
      name: student.name,
      role: APP_CONFIG.roles.STUDENT
    };

    this.saveSession();
    return { success: true, user: this.currentUser };
  }

  logout() {
    this.currentUser = null;
    this.saveSession();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === APP_CONFIG.roles.ADMIN;
  }

  isHeadTeacher() {
    return this.currentUser && this.currentUser.role === APP_CONFIG.roles.HEAD_TEACHER;
  }

  isTeacher() {
    return (
      this.currentUser &&
      (this.currentUser.role === APP_CONFIG.roles.TEACHER ||
        this.currentUser.role === APP_CONFIG.roles.HEAD_TEACHER)
    );
  }

  isStudent() {
    return this.currentUser && this.currentUser.role === APP_CONFIG.roles.STUDENT;
  }

  canManageTeachers() {
    return this.isAdmin() || this.isHeadTeacher();
  }

  canViewAllStudents() {
    return this.isAdmin();
  }

  canAccessAdminPanel() {
    return this.isAdmin();
  }
}

const auth = new AuthService();
