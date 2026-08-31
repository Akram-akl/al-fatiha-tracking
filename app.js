/**
 * الموجه والمشغل العام للمنظومة (Application Orchestrator & SPA Router)
 * منظومة "بلغوا عني ولو آية" لمتابعة تحفيظ وإتقان سورة الفاتحة
 * v3.0 — Mobile-first, No Tailwind, Invite Links with locked fields
 */

const AppUI = {
  currentView: "dashboard",
  charts: {},
  _inviteContext: null, // { type: "student"|"teacher", teacherId?, supervisorId? }

  init() {
    this.initTheme();
    this.initFontSize();

    // قراءة روابط الدعوة قبل أي شيء
    this._inviteContext = this._parseInviteParams();

    if (this._inviteContext) {
      const ctx = this._inviteContext;
      this.showLoginScreen();
      setTimeout(() => {
        if (ctx.type === "student") {
          StudentsModule.openAddModal(ctx.teacherId);
        } else if (ctx.type === "teacher") {
          TeachersModule.openAddModal(ctx.supervisorId);
        }
      }, 150);
    } else if (!auth.isLoggedIn()) {
      this.showLoginScreen();
    } else {
      this.showAppScreen();
      if (auth.isStudent()) {
        this.navigateTo("student-portal");
      } else {
        this.navigateTo(this.currentView);
        this.updateDashboardStats();
      }
    }

    db.subscribe(() => {
      this.populateGlobalDropdowns();
      if (!auth.isLoggedIn()) return;
      if (auth.isStudent()) {
        StudentsModule.renderStudentPortal();
        return;
      }
      this.updateDashboardStats();
      if (this.currentView === "students")    StudentsModule.renderStudentsTable();
      if (this.currentView === "teachers")    TeachersModule.renderTeachersList();
      if (this.currentView === "leaderboard") TeachersModule.renderLeaderboard();
      if (this.currentView === "reports")     ReportsModule.generateLiveReport();
      if (this.currentView === "analytics")   this.renderAnalyticsCharts();
    });
  },

  // ==================== روابط الدعوة ====================

  _parseInviteParams() {
    try {
      const search = window.location.search || (window.location.hash.includes("?") ? "?" + window.location.hash.split("?")[1] : "");
      const params = new URLSearchParams(search);
      const type = params.get("invite");
      if (!type) return null;
      return {
        type,
        role:         params.get("role")         || null,
        teacherId:    params.get("teacher")      || null,
        supervisorId: params.get("supervisor")   || null
      };
    } catch (_) { return null; }
  },

  // ==================== الشاشات ====================

  showLoginScreen() {
    document.getElementById("view-login-page").classList.remove("hidden");
    const wrapper = document.getElementById("app-wrapper");
    if (wrapper) wrapper.style.display = "none";
    this.populateGlobalDropdowns();
  },

  showAppScreen() {
    document.getElementById("view-login-page").classList.add("hidden");
    const wrapper = document.getElementById("app-wrapper");
    if (wrapper) wrapper.style.display = "flex";

    this.updateUserBadge();
    this.applyRolePermissions();
    this.populateGlobalDropdowns();
  },

  // ==================== التنقل ====================

  navigateTo(viewId) {
    if (!auth.isLoggedIn()) { this.showLoginScreen(); return; }

    if (auth.isStudent()) viewId = "student-portal";
    else if (viewId === "student-portal") viewId = "dashboard";

    this.currentView = viewId;

    // إخفاء كل الشاشات
    document.querySelectorAll(".spa-view").forEach(el => el.classList.remove("active"));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add("active");

    // تحديث القائمة الجانبية
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === viewId);
    });

    // تنفيذ منطق الشاشة
    const actions = {
      "dashboard":      () => this.updateDashboardStats(),
      "student-portal": () => StudentsModule.renderStudentPortal(),
      "students":       () => StudentsModule.renderStudentsTable(),
      "teachers":       () => TeachersModule.renderTeachersList(),
      "leaderboard":    () => TeachersModule.renderLeaderboard(),
      "reports":        () => ReportsModule.generateLiveReport(),
      "analytics":      () => this.renderAnalyticsCharts(),
      "settings":       () => this.renderSettingsView(),
      "geo":            () => this.renderGeoView()
    };
    if (actions[viewId]) actions[viewId]();
    this.closeMobileNav();
  },

  // ==================== تسجيل الدخول ====================

  handleLoginAdminFromPage() {
    const pass = document.getElementById("login-page-admin-password").value;
    const res  = auth.loginAsAdmin(pass);
    if (res.success) {
      this.showAppScreen();
      this.navigateTo("dashboard");
      this.showToast("تم تسجيل الدخول كمشرف عام بنجاح", "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  handleLoginTeacherFromPage() {
    const select = document.getElementById("login-page-teacher-select");
    const code   = document.getElementById("login-page-teacher-password").value;
    if (!select || !select.value) { this.showToast("يرجى اختيار المعلمة من القائمة", "warning"); return; }

    const res = auth.loginAsTeacher(select.value, code);
    if (res.success) {
      this.showAppScreen();
      this.navigateTo("students");
      this.showToast(`مرحباً بك يا أستاذة: ${res.user.name}`, "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  handleLoginStudentFromPage() {
    const select = document.getElementById("login-page-student-select");
    const pass   = document.getElementById("login-page-student-password").value;
    if (!select || !select.value) { this.showToast("يرجى اختيار اسم الطالبة من القائمة", "warning"); return; }

    const res = auth.loginAsStudent(select.value, pass);
    if (res.success) {
      this.showAppScreen();
      this.navigateTo("student-portal");
      this.showToast(`أهلاً بكِ يا بنيتي: ${res.user.name}`, "success");
    } else {
      this.showToast(res.message, "error");
    }
  },

  handleLogout() {
    auth.logout();
    this.showLoginScreen();
    this.showToast("تم تسجيل الخروج بنجاح", "info");
  },

  // ==================== القوائم المنسدلة العامة ====================

  populateGlobalDropdowns() {
    const regions = db.getRegions();

    const populateSelect = (id, prefix, items) => {
      const el = document.getElementById(id);
      if (!el) return;
      const cur = el.value;
      el.innerHTML = prefix + items.map(r => `<option value="${r}">${r}</option>`).join("");
      if (cur) el.value = cur;
    };

    populateSelect("students-region-filter", '<option value="">-- كافة المناطق --</option>', regions);
    populateSelect("report-region-select",   '<option value="">-- كل المناطق --</option>', regions);
    populateSelect("leaderboard-region-filter", '<option value="">-- كل المناطق --</option>', regions);

    // حالات الإتقان
    const statusOptions = APP_CONFIG.studentStatuses
      .map(s => `<option value="${s.id}">${s.label}</option>`).join("");

    ["students-status-filter", "report-status-select"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const cur = el.value;
      el.innerHTML = '<option value="">-- كافة الحالات --</option>' + statusOptions;
      if (cur) el.value = cur;
    });

    // قوائم صفحة الدخول
    const teachers = db.getTeachers();
    const teacherSelect = document.getElementById("login-page-teacher-select");
    if (teacherSelect) {
      teacherSelect.innerHTML = teachers.length
        ? '<option value="">-- اختر حساب المعلمة --</option>' +
          teachers.map(t => `<option value="${t.id}">${t.name} (${t.region})</option>`).join("")
        : '<option value="">-- لا توجد معلمات مسجلات --</option>';
    }

    const students = db.getStudents();
    const studentSelect = document.getElementById("login-page-student-select");
    if (studentSelect) {
      studentSelect.innerHTML = students.length
        ? '<option value="">-- اختر حساب الطالبة --</option>' +
          students.map(s => `<option value="${s.id}">${s.name} (${s.region})</option>`).join("")
        : '<option value="">-- لا توجد طالبات مسجلات --</option>';
    }
  },

  // ==================== صلاحيات الدور ====================

  applyRolePermissions() {
    const isStudent    = auth.isStudent();
    const isAdmin      = auth.isAdmin();
    const isHead       = auth.isHeadTeacher();
    const isTeacher    = auth.isTeacher();

    const navMap = {
      "student-portal": isStudent,
      "dashboard":      !isStudent,
      "students":       !isStudent,
      "teachers":       isAdmin || isHead,
      "geo":            isAdmin || isHead,
      "leaderboard":    !isStudent,
      "reports":        !isStudent,
      "analytics":      isAdmin,
      "settings":       isAdmin
    };

    document.querySelectorAll(".nav-item[data-view]").forEach(btn => {
      const show = navMap[btn.dataset.view] ?? false;
      btn.style.display = show ? "" : "none";
    });

    const addStudentBtns = document.querySelectorAll("#sidebar-add-student-btn, #dashboard-add-student-btn");
    addStudentBtns.forEach(b => { if (b) b.style.display = isStudent ? "none" : ""; });

    const addTeacherBtn = document.getElementById("add-teacher-main-btn");
    const adminInviteBtn = document.getElementById("admin-invite-btn");
    if (addTeacherBtn) addTeacherBtn.style.display = (isAdmin || isHead) ? "" : "none";
    if (adminInviteBtn) adminInviteBtn.style.display = (isAdmin || isHead) ? "" : "none";
  },

  // ==================== الإحصائيات ====================

  updateDashboardStats() {
    if (auth.isStudent()) return;

    const students = db.getStudents();
    const teachers  = db.getTeachers();
    const regions   = db.getRegions();

    const total      = students.length;
    const completed  = students.filter(s => s.status === "completed").length;
    const needsHelp  = students.filter(s => s.status === "needs_help").length;
    const arabicN    = students.filter(s => s.isArabicSpeaker).length;
    const nonArabicN = total - arabicN;

    let avgMastery = 0;
    if (total > 0) avgMastery = Math.round(students.reduce((a, s) => a + (s.mastery || 0), 0) / total);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("stat-total-students", total.toLocaleString("ar-SA"));
    set("stat-completed-students", completed.toLocaleString("ar-SA"));
    set("stat-total-teachers", teachers.length.toLocaleString("ar-SA"));
    set("stat-avg-mastery", `${avgMastery}%`);
    set("stat-needs-help", needsHelp.toLocaleString("ar-SA"));

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    set("stat-target-progress", `${pct}%`);
    set("stat-target-label", `نسبة المتقنات من الإجمالي (${total} طالبة)`);
    const bar = document.getElementById("stat-target-bar");
    if (bar) bar.style.width = `${pct}%`;

    // أفضل منطقة
    let topRegion = "-", maxCount = -1;
    regions.forEach(r => {
      const cnt = students.filter(s => s.region === r && s.status === "completed").length;
      if (cnt > maxCount && cnt > 0) { maxCount = cnt; topRegion = r; }
    });
    set("stat-top-region", topRegion);
    set("stat-top-region-desc", maxCount > 0 ? `${maxCount} متقنة` : "في انتظار استكمال الإتقان");

    this.renderRegionalBars();
    this.renderLanguageDoughnut(arabicN, nonArabicN);
    this.renderRecentAchievements();
  },

  renderRegionalBars() {
    const container = document.getElementById("dashboard-regions-bars");
    if (!container) return;

    const students = db.getStudents();
    const total = students.length || 1;
    const regions = db.getRegions();
    const colors = ["var(--color-primary)", "var(--color-secondary)", "var(--color-tertiary)", "#2e7d32", "#d97706"];

    container.innerHTML = regions.map((r, i) => {
      const cnt = students.filter(s => s.region === r).length;
      const pct = students.length > 0 ? Math.round((cnt / total) * 100) : 0;
      const color = colors[i % colors.length];
      return `
        <div>
          <div class="flex-between text-xs font-bold mb-1" style="color:var(--color-on-surface)">
            <span>${r}</span>
            <span style="color:var(--color-on-surface-variant);font-family:monospace">${pct}% (${cnt})</span>
          </div>
          <div class="mastery-bar">
            <div class="mastery-bar-fill" style="width:${pct}%;background:${color};"></div>
          </div>
        </div>
      `;
    }).join("");
  },

  renderLanguageDoughnut(arabicCount, nonArabicCount) {
    const total = arabicCount + nonArabicCount;
    const aP = total > 0 ? Math.round((arabicCount / total) * 100) : 0;
    const nP = 100 - aP;
    const circumference = 251.2;

    const labelA = document.getElementById("lang-arabic-label");
    if (labelA) labelA.textContent = `ناطقين (${aP}٪)`;
    const labelN = document.getElementById("lang-non-arabic-label");
    if (labelN) labelN.textContent = `غير ناطقين (${nP}٪)`;

    const cA = document.getElementById("svg-circle-arabic");
    if (cA) cA.style.strokeDashoffset = circumference - (aP / 100) * circumference;
  },

  renderRecentAchievements() {
    const container = document.getElementById("dashboard-recent-achievements");
    if (!container) return;

    const completed = db.getStudents(s => s.status === "completed").slice(0, 6);
    if (completed.length === 0) {
      container.innerHTML = `<div class="text-center text-xs text-muted" style="padding:2rem;grid-column:1/-1">لا توجد طالبات أتممن الإتقان حتى الآن.</div>`;
      return;
    }

    container.innerHTML = completed.map(s => `
      <div class="flex-center gap-3" style="background:var(--color-surface-container);padding:0.75rem 1rem;border-radius:0.875rem;border:1px solid var(--color-outline-variant);">
        <div class="icon-box bg-success-light" style="color:var(--color-success);width:36px;height:36px;">
          <span class="material-symbols-outlined" style="font-size:1.1rem;font-variation-settings:'FILL' 1;">verified</span>
        </div>
        <div style="flex:1;min-width:0;">
          <div class="font-bold text-sm truncate">${s.name}</div>
          <div class="text-xs text-muted">${s.region}</div>
        </div>
        <span class="font-bold text-sm text-success">${s.mastery}%</span>
      </div>
    `).join("");
  },

  renderAnalyticsCharts() {
    if (typeof Chart === "undefined") return;

    const students = db.getStudents();
    const regions  = db.getRegions();

    const ctxReg = document.getElementById("chart-region-mastery")?.getContext("2d");
    if (ctxReg) {
      if (this.charts.regionMastery) this.charts.regionMastery.destroy();
      const data = regions.map(r => {
        const inR = students.filter(s => s.region === r);
        return inR.length ? Math.round(inR.reduce((a, s) => a + (s.mastery || 0), 0) / inR.length) : 0;
      });
      this.charts.regionMastery = new Chart(ctxReg, {
        type: "bar",
        data: { labels: regions, datasets: [{ label: "متوسط الإتقان ٪", data, backgroundColor: "#516447", borderRadius: 8 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
      });
    }

    const ctxMas = document.getElementById("chart-mastery-distribution")?.getContext("2d");
    if (ctxMas) {
      if (this.charts.masteryDist) this.charts.masteryDist.destroy();
      this.charts.masteryDist = new Chart(ctxMas, {
        type: "doughnut",
        data: {
          labels: ["ممتاز", "جيد جداً", "جيد", "يحتاج متابعة"],
          datasets: [{
            data: [
              students.filter(s => s.mastery >= 95).length,
              students.filter(s => s.mastery >= 80 && s.mastery < 95).length,
              students.filter(s => s.mastery >= 65 && s.mastery < 80).length,
              students.filter(s => s.mastery < 65).length
            ],
            backgroundColor: ["#2e7d32", "#516447", "#d97706", "#ba1a1a"]
          }]
        },
        options: { 
          responsive: true,
          onClick: (e, elements) => {
            if (elements.length > 0) {
              const idx = elements[0].index;
              let targetStatus = "";
              if (idx === 0) targetStatus = "completed"; // ممتاز = متقنة
              else if (idx === 1) targetStatus = "near_completion"; // جيد جدا = قاربت
              else if (idx === 2) targetStatus = "in_progress"; // جيد = في مرحلة الحفظ
              else if (idx === 3) targetStatus = "needs_help"; // يحتاج متابعة = تحتاج لمتابعة
              
              if (targetStatus) {
                AppUI.navigateTo("students");
                StudentsModule.setFilter("status", targetStatus);
              }
            }
          }
        }
      });
    }
  },

  renderGeoView() {
    const container = document.getElementById("geo-regions-container");
    if (!container) return;

    const regions  = db.getRegions();
    const students = db.getStudents();
    const teachers = db.getTeachers();

    container.innerHTML = regions.map(region => {
      const rs = students.filter(s => s.region === region);
      const rt = teachers.filter(t => t.region === region);
      const completed  = rs.filter(s => s.status === "completed").length;
      const avgMastery = rs.length
        ? Math.round(rs.reduce((a, s) => a + (s.mastery || 0), 0) / rs.length) : 0;

      return `
        <div class="card" style="display:flex;flex-direction:column;gap:1rem;">
          <div class="flex-between">
            <div class="flex-center gap-2">
              <span class="material-symbols-outlined text-primary" style="font-size:1.5rem;">location_on</span>
              <span class="font-black text-lg" style="color:var(--color-on-surface)">${region}</span>
            </div>
            <span class="badge badge-primary">${rs.length} طالبة</span>
          </div>
          <div class="space-y-2 text-sm text-muted">
            <div class="flex-between"><span>المعلمات النشطات</span><strong style="color:var(--color-on-surface)">${rt.length}</strong></div>
            <div class="flex-between"><span>المتقنات</span><strong style="color:var(--color-success)">${completed}</strong></div>
            <div class="flex-between"><span>متوسط إتقان المنطقة</span><strong style="color:var(--color-primary)">${avgMastery}%</strong></div>
          </div>
          <button onclick="AppUI.navigateTo('students'); StudentsModule.setFilter('region','${region}')" class="btn btn-ghost btn-sm btn-full">
            استعراض طالبات ${region}
          </button>
        </div>
      `;
    }).join("");
  },

  renderSettingsView() {
    const el = document.getElementById("settings-regions-list");
    if (!el) return;
    const regions = db.getRegions();
    el.innerHTML = regions.map(r => `
      <div class="flex-between" style="padding:0.6rem 0.875rem;background:var(--color-surface-container);border-radius:0.75rem;font-size:0.8rem;">
        <strong>${r}</strong>
        <span class="text-xs text-muted">معتمدة</span>
      </div>
    `).join("");
  },

  // ==================== الثيم والإعدادات ====================

  initTheme() {
    const t = localStorage.getItem("al_fatiha_theme") || "light";
    if (t === "dark") document.documentElement.classList.add("dark");
    const icon = document.getElementById("dark-mode-icon");
    if (icon) icon.textContent = t === "dark" ? "light_mode" : "dark_mode";
  },

  toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("al_fatiha_theme", isDark ? "dark" : "light");
    const icon = document.getElementById("dark-mode-icon");
    if (icon) icon.textContent = isDark ? "light_mode" : "dark_mode";
    this.showToast(isDark ? "تم تفعيل الوضع الليلي" : "تم تفعيل الوضع النهاري", "info");
  },

  initFontSize() {
    const s = localStorage.getItem("al_fatiha_fontsize") || "md";
    document.documentElement.setAttribute("data-font-size", s);
  },

  changeFontSize(delta) {
    const sizes = ["sm", "md", "lg", "xl"];
    const labels = { sm: "صغير", md: "افتراضي", lg: "كبير", xl: "كبير جداً" };
    const cur = document.documentElement.getAttribute("data-font-size") || "md";
    let idx = Math.max(0, Math.min(sizes.length - 1, sizes.indexOf(cur) + delta));
    const ns = sizes[idx];
    document.documentElement.setAttribute("data-font-size", ns);
    localStorage.setItem("al_fatiha_fontsize", ns);
    this.showToast(`حجم الخط: ${labels[ns]}`, "info");
  },

  updateUserBadge() {
    const u = auth.getCurrentUser();
    if (!u) return;
    const nameEl = document.getElementById("header-user-name");
    const roleEl = document.getElementById("header-user-role");
    if (nameEl) nameEl.textContent = u.name;
    if (roleEl) roleEl.textContent = {
      admin: "مشرف عام", head_teacher: "معلمة رئيسية",
      teacher: "معلمة", student: "طالبة"
    }[u.role] || u.role;
  },

  // ==================== الشريط الجانبي (موبايل) ====================

  toggleMobileNav() {
    const sidebar  = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar) return;
    const isOpen = sidebar.classList.toggle("mobile-open");
    if (backdrop) backdrop.classList.toggle("visible", isOpen);
    // منع تمرير الخلفية
    document.body.style.overflow = isOpen ? "hidden" : "";
  },

  closeMobileNav() {
    const sidebar  = document.getElementById("app-sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (sidebar) sidebar.classList.remove("mobile-open");
    if (backdrop) backdrop.classList.remove("visible");
    document.body.style.overflow = "";
  },

  // ==================== التصدير ====================

  exportBackupJSON() {
    try {
      const blob = new Blob([db.exportBackup()], { type: "application/json;charset=utf-8" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `fatiha_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast("تم تصدير ملف JSON بنجاح", "success");
    } catch (e) {
      this.showToast("حدث خطأ أثناء تصدير ملف JSON", "error");
    }
  },

  handleResetAllData() {
    this.showConfirmModal(
      "مسح شامل لكافة البيانات",
      "تحذير: هل أنت متأكد من مسح جميع الطالبات والمعلمات والإحصائيات وإعادة تعيين النظام بالكامل؟",
      () => { db.resetAllData(); this.updateDashboardStats(); this.showToast("تمت إعادة ضبط المنظومة بنجاح", "info"); }
    );
  },

  // ==================== توليد الروابط الإدارية ====================

  openAdminInviteModal() {
    const modal = document.getElementById("admin-invite-modal");
    if (!modal) return;
    this.updateAdminInviteOptions();
    document.getElementById("admin-invite-link-result").value = "";
    modal.classList.remove("hidden");
  },

  updateAdminInviteOptions() {
    const type = document.getElementById("admin-invite-type").value;
    const teacherSelect = document.getElementById("admin-invite-teacher-select");
    const teachers = db.getTeachers();

    if (type === "head_teacher") {
      teacherSelect.innerHTML = '<option value="">لا يوجد (المعلمة الرئيسية غير تابعة لأحد)</option>';
      teacherSelect.disabled = true;
    } else {
      teacherSelect.disabled = false;
      let html = '<option value="">-- بدون ارتباط --</option>';
      teachers.forEach(t => {
        if (t.role === "head_teacher" || type === "student") {
          html += `<option value="${t.id}">${t.name} (${t.region})</option>`;
        }
      });
      teacherSelect.innerHTML = html;

      // للمعلمة الرئيسية، الخيار محدد تلقائياً لنفسها
      if (auth.isHeadTeacher()) {
        teacherSelect.value = auth.getCurrentUser().id;
        teacherSelect.disabled = true;
      }
    }
  },

  generateAdminInviteLink() {
    const type = document.getElementById("admin-invite-type").value;
    const teacherId = document.getElementById("admin-invite-teacher-select").value;
    
    // الحل الأمثل للعمل مع بروتوكول file:// بدون إظهار null
    let url = window.location.href.split('?')[0];
    
    if (type === "student") {
      url += "?invite=student";
      if (teacherId) url += "&teacher=" + encodeURIComponent(teacherId);
    } else if (type === "teacher" || type === "head_teacher") {
      url += "?invite=teacher";
      if (type === "head_teacher") url += "&role=head_teacher";
      if (teacherId && type === "teacher") url += "&supervisor=" + encodeURIComponent(teacherId);
    }

    document.getElementById("admin-invite-link-result").value = url;
  },

  copyAdminInviteLink() {
    const link = document.getElementById("admin-invite-link-result").value;
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      this.showToast("تم نسخ الرابط بنجاح", "success");
    });
  },

  // ==================== Toast ====================

  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    const icons = { success: "check_circle", warning: "warning", error: "error", info: "info" };
    const toast = document.createElement("div");
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.25rem;">${icons[type] || "info"}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ==================== نافذة التأكيد ====================

  showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById("confirm-dialog-modal");
    if (!modal) { if (onConfirm) onConfirm(); return; }

    document.getElementById("confirm-dialog-title").textContent   = title;
    document.getElementById("confirm-dialog-message").textContent = message;

    const ok     = document.getElementById("confirm-dialog-ok-btn");
    const cancel = document.getElementById("confirm-dialog-cancel-btn");

    const cleanup = () => {
      modal.classList.add("hidden");
      ok.onclick = null; cancel.onclick = null;
    };

    ok.onclick     = () => { cleanup(); if (onConfirm) onConfirm(); };
    cancel.onclick = () => cleanup();
    modal.classList.remove("hidden");
  }
};

document.addEventListener("DOMContentLoaded", () => { AppUI.init(); });
