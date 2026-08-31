/**
 * طبقة إدارة البيانات والتخزين (Data Access & Persistence Layer)
 * منظومة "بلغوا عني ولو آية" لمتابعة تحفيظ وإتقان سورة الفاتحة
 */

const DB_STORAGE_KEY = "al_fatiha_tracking_data_v2";

class DataStore {
  constructor() {
    this.data = this._getInitialStructure();
    this.listeners = [];
    this.init();
  }

  _getInitialStructure() {
    return {
      version: "2.5.0",
      settings: {
        adminPassword: "112234",
        regions: [...APP_CONFIG.defaultRegions]
      },
      teachers: [],
      students: [],
      logs: []
    };
  }

  init() {
    try {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = {
          ...this._getInitialStructure(),
          ...parsed,
          settings: {
            ...this._getInitialStructure().settings,
            ...(parsed.settings || {}),
            adminPassword: "112234",
            regions: [...APP_CONFIG.defaultRegions]
          }
        };
        this._migrateRegions();
        this.save();
      } else {
        this.save();
      }
    } catch (e) {
      console.error("خطأ في قراءة البيانات المحلية:", e);
      this.data = this._getInitialStructure();
      this.save();
    }
  }

  _migrateRegions() {
    const regionMap = {
      "المنطقة الوسطى": "مكتب الوسط",
      "المنطقة الشرقية": "مكتب الشرق",
      "المنطقة الشمالية": "مكتب الشمال",
      "المنطقة الجنوبية": "مكتب الجنوب",
      "المنطقة الغربية": "مكتب الوسط",
      "الوسطى": "مكتب الوسط",
      "الشرقية": "مكتب الشرق",
      "الشمالية": "مكتب الشمال",
      "الجنوبية": "مكتب الجنوب",
      "الغربية": "مكتب الوسط"
    };

    if (Array.isArray(this.data.teachers)) {
      this.data.teachers.forEach(t => {
        if (regionMap[t.region]) t.region = regionMap[t.region];
        else if (!APP_CONFIG.defaultRegions.includes(t.region)) t.region = APP_CONFIG.defaultRegions[0];
      });
    }

    if (Array.isArray(this.data.students)) {
      this.data.students.forEach(s => {
        if (regionMap[s.region]) s.region = regionMap[s.region];
        else if (!APP_CONFIG.defaultRegions.includes(s.region)) s.region = APP_CONFIG.defaultRegions[0];
      });
    }
  }

  save() {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.data));
      this._notify();
      return true;
    } catch (e) {
      console.error("خطأ في حفظ البيانات المحلية:", e);
      return false;
    }
  }

  subscribe(callback) {
    if (typeof callback === "function") {
      this.listeners.push(callback);
    }
  }

  _notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.data);
      } catch (err) {
        console.error("Error in data listener callback:", err);
      }
    });
  }

  // ==================== المعلمات (Teachers) ====================

  getTeachers(filterFn) {
    let list = [...(this.data.teachers || [])];
    if (typeof filterFn === "function") {
      list = list.filter(filterFn);
    }
    return list;
  }

  getTeachersByRegion(region) {
    if (!region) return this.getTeachers();
    return this.getTeachers((t) => t.region === region);
  }

  getTeacherById(id) {
    return this.data.teachers.find((t) => t.id === id) || null;
  }

  addTeacher(teacherData) {
    const code = (teacherData.verificationCode || teacherData.password || "123456").trim();
    const newTeacher = {
      id: "tch_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      name: teacherData.name.trim(),
      phone: (teacherData.phone || "").trim(),
      verificationCode: code,
      password: code,
      role: teacherData.role || APP_CONFIG.roles.TEACHER,
      supervisorId: teacherData.supervisorId || null,
      specialization: teacherData.specialization || "both",
      region: teacherData.region || this.data.settings.regions[0],
      createdAt: new Date().toISOString()
    };

    this.data.teachers.push(newTeacher);
    this.logAction("إضافة معلمة جديدة", `تمت إضافة المعلمة: ${newTeacher.name} بالمنطقة: ${newTeacher.region}`);
    this.save();
    return newTeacher;
  }

  updateTeacher(id, updates) {
    const index = this.data.teachers.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = this.data.teachers[index];
    const code = (updates.verificationCode !== undefined ? updates.verificationCode : (updates.password || current.verificationCode || "123456")).trim();

    this.data.teachers[index] = {
      ...current,
      ...updates,
      id,
      verificationCode: code,
      password: code
    };

    this.logAction("تحديث بيانات معلمة", `تم تعديل بيانات: ${this.data.teachers[index].name}`);
    this.save();
    return this.data.teachers[index];
  }

  deleteTeacher(id) {
    const teacher = this.getTeacherById(id);
    if (!teacher) return false;

    this.data.students.forEach((s) => {
      if (s.teacherId === id) {
        s.teacherId = null;
      }
    });

    this.data.teachers.forEach((t) => {
      if (t.supervisorId === id) {
        t.supervisorId = null;
      }
    });

    this.data.teachers = this.data.teachers.filter((t) => t.id !== id);
    this.logAction("حذف معلمة", `تم حذف المعلمة: ${teacher.name}`);
    this.save();
    return true;
  }

  // ==================== الطالبات (Students) ====================

  getStudents(filterFn) {
    let list = [...(this.data.students || [])];
    if (typeof filterFn === "function") {
      list = list.filter(filterFn);
    }
    return list;
  }

  getStudentById(id) {
    return this.data.students.find((s) => s.id === id) || null;
  }

  addStudent(studentData) {
    const mistakeWordIds = Array.isArray(studentData.mistakeWordIds) ? studentData.mistakeWordIds : [];
    const errorsCount = mistakeWordIds.length || 0;
    const masteryCalc = calculateMastery(errorsCount);
    const tajweedScore = studentData.tajweedScore !== undefined ? parseInt(studentData.tajweedScore, 10) : 100;
    const status = studentData.status || "in_progress";

    const newStudent = {
      id: "std_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      name: studentData.name.trim(),
      phone: (studentData.phone || "").trim(),
      password: (studentData.password || "123456").trim(),
      teacherId: studentData.teacherId || null,
      region: studentData.region || this.data.settings.regions[0],
      isArabicSpeaker: studentData.isArabicSpeaker === true || studentData.isArabicSpeaker === "true",
      mistakeWordIds: mistakeWordIds,
      errorsCount: errorsCount,
      mastery: masteryCalc.mastery,
      masteryLevel: masteryCalc.level,
      tajweedScore: tajweedScore,
      status: status,
      notes: studentData.initialNote ? [{ id: "note_" + Date.now(), text: studentData.initialNote, date: new Date().toISOString(), author: "المعلمة" }] : [],
      joinedDate: new Date().toISOString().split("T")[0],
      lastFollowUpDate: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    };

    this.data.students.push(newStudent);
    this.logAction("إضافة طالبة", `تم تسجيل الطالبة: ${newStudent.name}`);
    this.save();
    return newStudent;
  }

  updateStudent(id, updates) {
    const index = this.data.students.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const current = this.data.students[index];
    const mistakeWordIds = updates.mistakeWordIds !== undefined
      ? (Array.isArray(updates.mistakeWordIds) ? updates.mistakeWordIds : [])
      : (current.mistakeWordIds || []);

    let errorsCount = updates.errorsCount !== undefined
      ? parseInt(updates.errorsCount, 10)
      : (updates.mistakeWordIds !== undefined ? mistakeWordIds.length : current.errorsCount);
    
    errorsCount = Math.max(0, Math.min(29, errorsCount || 0));

    const masteryCalc = calculateMastery(errorsCount);
    let tajweedScore = updates.tajweedScore !== undefined ? parseInt(updates.tajweedScore, 10) : current.tajweedScore;
    tajweedScore = Math.min(100, Math.max(0, tajweedScore || 0));

    let status = updates.status || current.status;

    this.data.students[index] = {
      ...current,
      ...updates,
      id,
      password: updates.password !== undefined ? updates.password.trim() : (current.password || "123456"),
      mistakeWordIds,
      errorsCount,
      mastery: masteryCalc.mastery,
      masteryLevel: masteryCalc.level,
      tajweedScore,
      status,
      lastFollowUpDate: new Date().toISOString().split("T")[0]
    };

    this.logAction("تحديث بيانات طالبة", `تم تعديل سجل: ${this.data.students[index].name}`);
    this.save();
    return this.data.students[index];
  }

  /**
   * تبديل حالة الخطأ لكلمة قرآنية معينة مباشرة في ملف الطالبة وحفظها لحظياً
   */
  toggleStudentWordMistake(studentId, wordId) {
    const student = this.getStudentById(studentId);
    if (!student) return null;

    if (!Array.isArray(student.mistakeWordIds)) {
      student.mistakeWordIds = [];
    }

    const idx = student.mistakeWordIds.indexOf(wordId);
    if (idx === -1) {
      student.mistakeWordIds.push(wordId);
    } else {
      student.mistakeWordIds.splice(idx, 1);
    }

    const errorsCount = student.mistakeWordIds.length;
    const masteryCalc = calculateMastery(errorsCount);

    student.errorsCount = errorsCount;
    student.mastery = masteryCalc.mastery;
    student.masteryLevel = masteryCalc.level;
    student.lastFollowUpDate = new Date().toISOString().split("T")[0];

    // تحديث الحالة التلقائي بناءً على الأخطاء
    if (errorsCount === 0 && (student.tajweedScore || 100) >= 95) {
      student.status = "completed";
    } else if (errorsCount <= 2) {
      student.status = "near_completion";
    } else if (errorsCount >= 10) {
      student.status = "needs_help";
    } else {
      student.status = "in_progress";
    }

    this.save();
    return student;
  }

  addStudentNote(studentId, noteText, authorName) {
    const student = this.getStudentById(studentId);
    if (!student) return false;

    if (!Array.isArray(student.notes)) {
      student.notes = [];
    }

    const note = {
      id: "note_" + Date.now(),
      text: noteText.trim(),
      author: authorName || "المعلمة",
      date: new Date().toISOString()
    };

    student.notes.unshift(note);
    student.lastFollowUpDate = new Date().toISOString().split("T")[0];
    this.save();
    return note;
  }

  deleteStudent(id) {
    const student = this.getStudentById(id);
    if (!student) return false;

    this.data.students = this.data.students.filter((s) => s.id !== id);
    this.logAction("حذف طالبة", `تم حذف سجل الطالبة: ${student.name}`);
    this.save();
    return true;
  }

  // ==================== المناطق والإعدادات ====================

  getRegions() {
    return [...APP_CONFIG.defaultRegions];
  }

  getSettings() {
    return { ...this.data.settings, adminPassword: "112234", regions: [...APP_CONFIG.defaultRegions] };
  }

  logAction(action, details) {
    if (!Array.isArray(this.data.logs)) this.data.logs = [];
    this.data.logs.unshift({
      id: "log_" + Date.now(),
      action,
      details,
      timestamp: new Date().toISOString()
    });
    if (this.data.logs.length > 100) {
      this.data.logs = this.data.logs.slice(0, 100);
    }
  }

  getLogs() {
    return [...(this.data.logs || [])];
  }

  resetAllData() {
    this.data = this._getInitialStructure();
    this.save();
    return true;
  }

  exportBackup() {
    return JSON.stringify(this.data, null, 2);
  }

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.teachers)) {
        this.data = {
          ...this._getInitialStructure(),
          ...parsed
        };
        this.save();
        return true;
      }
      return false;
    } catch (e) {
      console.error("فشل استيراد النسخة الاحتياطية:", e);
      return false;
    }
  }
}

const db = new DataStore();
