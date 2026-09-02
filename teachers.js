/**
 * محرك إدارة المبلّغات (Proclaimers Module)
 * منظومة "بلغوا عني ولو آية" — v3.5
 */

const TeachersModule = {

  // ==================== عرض قائمة المبلّغات ====================

  renderTeachersList() {
    if (auth.isStudent()) { AppUI.navigateTo("student-portal"); return; }

    const container = document.getElementById("teachers-list-container");
    if (!container) return;

    const currentUser = auth.getCurrentUser();
    let teachers = db.getTeachers();

    // فلترة بحسب الصلاحية
    if (auth.isTeacher() && !auth.isHeadTeacher() && !auth.isAdmin()) {
      teachers = teachers.filter(t => t.id === currentUser.id);
    } else if (auth.isHeadTeacher()) {
      teachers = teachers.filter(t => t.id === currentUser.id || t.supervisorId === currentUser.id);
    }

    const badge = document.getElementById("teachers-count-badge");
    if (badge) badge.textContent = `${teachers.length} مبلّغة`;

    if (teachers.length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding:3rem 1rem">
          <span class="material-symbols-outlined" style="font-size:3.5rem;color:var(--color-on-surface-variant);opacity:0.4;">school</span>
          <div class="font-bold mt-2" style="font-size:1.1rem;">لا توجد مبلّغات مسجلات</div>
          <div class="text-sm text-muted mt-1 mb-3">يمكنك إضافة مبلّغة جديدة للمنظومة.</div>
          <button onclick="TeachersModule.openAddModal()" class="btn btn-p btn-sm" style="display:inline-flex;">
            <span class="material-symbols-outlined" style="font-size:1rem;">person_add</span>إضافة مبلّغة جديدة
          </button>
        </div>`;
      return;
    }

    const specs = { both: "كلاهما", arabic: "ناطقين بالعربية فقط", non_arabic: "غير ناطقين بالعربية فقط" };

    container.innerHTML = `<div class="grid-auto">` + teachers.map(teacher => {
      const stats      = this.getTeacherStats(teacher.id);
      const supervisor = teacher.supervisorId ? db.getTeacherById(teacher.supervisorId) : null;
      const isHead     = teacher.role === "head_teacher";

      return `
        <div class="card" style="display:flex;flex-direction:column;gap:1rem;">
          <!-- رأس البطاقة -->
          <div class="flex-between">
            <div class="flex-center gap-3">
              <div class="avatar-text" style="width:48px;height:48px;font-size:1.1rem;background:rgba(81,100,71,0.12);color:var(--color-primary);">${(teacher.name || "م").charAt(0)}</div>
              <div>
                <div class="font-bold" style="font-size:1rem;">${teacher.name}</div>
                <div class="text-xs text-muted flex-center gap-1">
                  <span class="material-symbols-outlined" style="font-size:0.875rem;">location_on</span>
                  ${teacher.region}
                </div>
              </div>
            </div>
            <span class="badge ${isHead ? 'badge-secondary' : 'badge-neutral'}">
              ${isHead ? 'مبلّغة رئيسية' : 'مبلّغة'}
            </span>
          </div>

          <!-- تفاصيل -->
          <div style="display:flex;flex-direction:column;gap:0.4rem;font-size:0.78rem;color:var(--color-on-surface-variant);padding:0.75rem;background:var(--color-surface-container);border-radius:0.75rem;">
            <div class="flex-between">
              <span>كود التحقق الخاص بها</span>
              <span class="font-mono font-bold badge badge-primary">${teacher.verificationCode || teacher.password || "123456"}</span>
            </div>
            <div class="flex-between">
              <span>التخصص</span>
              <span class="font-bold" style="color:var(--color-on-surface)">${specs[teacher.specialization] || specs.both}</span>
            </div>
            ${supervisor ? `<div class="flex-between"><span>تحت إشراف</span><span class="font-bold" style="color:var(--color-on-surface)">${supervisor.name}</span></div>` : ""}
            <div class="flex-between">
              <span>رقم الهاتف</span>
              <span class="font-mono" style="color:var(--color-on-surface)">${teacher.phone || "غير محدد"}</span>
            </div>
          </div>

          <!-- إحصائيات الإتقان والتخريج -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.5rem;text-align:center;background:var(--color-surface-container);border-radius:0.75rem;padding:0.75rem;">
            <div>
              <div class="text-xs text-muted">المتعلمات</div>
              <strong style="font-size:1.1rem;">${stats.totalStudents}</strong>
            </div>
            <div>
              <div class="text-xs text-muted" style="color:var(--color-primary);font-weight:700;">المتقنات على يدها</div>
              <strong style="font-size:1.15rem;color:var(--color-success);">${stats.completedStudents}</strong>
            </div>
            <div>
              <div class="text-xs text-muted">متوسط الإتقان</div>
              <strong style="font-size:1.1rem;color:var(--color-primary);">${stats.avgMastery}%</strong>
            </div>
          </div>

          <!-- روابط الدعوة -->
          <div style="display:flex;flex-direction:column;gap:0.4rem;">
            <button onclick="StudentsModule.copyTeacherInviteLink('${teacher.id}')" class="btn btn-ghost btn-sm btn-full">
              <span class="material-symbols-outlined" style="font-size:0.9rem;">link</span>
              نسخ رابط تسجيل المتعلمات
            </button>
            ${isHead ? `
              <button onclick="StudentsModule.copyHeadTeacherInviteLink('${teacher.id}')" class="btn btn-ghost btn-sm btn-full" style="color:var(--color-secondary);">
                <span class="material-symbols-outlined" style="font-size:0.9rem;">group_add</span>
                نسخ رابط دعوة مبلّغات
              </button>
            ` : ""}
          </div>

          <!-- الإجراءات -->
          <div class="flex-between" style="padding-top:0.75rem;border-top:1px solid var(--color-outline-variant);">
            <button onclick="AppUI.navigateTo('students'); StudentsModule.setFilter('teacherId','${teacher.id}')" class="btn btn-ghost btn-sm">
              استعراض المتعلمات
            </button>
            <div class="flex-center gap-1">
              <button onclick="TeachersModule.openEditModal('${teacher.id}')" class="btn-icon" title="تعديل">
                <span class="material-symbols-outlined" style="font-size:1.1rem;">edit</span>
              </button>
              <button onclick="TeachersModule.confirmDelete('${teacher.id}')" class="btn-icon" title="حذف" style="color:var(--color-error);">
                <span class="material-symbols-outlined" style="font-size:1.1rem;">delete</span>
              </button>
            </div>
          </div>
        </div>`;
    }).join("") + `</div>`;
  },

  getTeacherStats(teacherId) {
    const students  = db.getStudents(s => s.teacherId === teacherId);
    const total     = students.length;
    const completed = db.getGraduatedCountForTeacher(teacherId);
    const avgMastery = total > 0
      ? Math.round(students.reduce((sum, s) => sum + (s.mastery || 0), 0) / total)
      : 0;

    const score = (completed * 10) + Math.round(avgMastery * 0.5);

    return { totalStudents: total, completedStudents: completed, avgMastery, score };
  },

  // ==================== لوحة الصدارة والتميز ====================

  renderLeaderboard() {
    const container = document.getElementById("leaderboard-container");
    if (!container) return;

    const regionFilter = document.getElementById("leaderboard-region-filter")?.value || "";
    let teachers = db.getTeachers();

    if (regionFilter) {
      teachers = teachers.filter(t => t.region === regionFilter);
    }

    const data = teachers
      .map(t => ({ teacher: t, stats: this.getTeacherStats(t.id) }))
      .sort((a, b) => b.stats.score - a.stats.score);

    if (data.length === 0) {
      container.innerHTML = `<div class="card text-center" style="padding:3rem 1rem;">
        <span class="material-symbols-outlined" style="font-size:3rem;color:var(--color-on-surface-variant);opacity:0.4;">military_tech</span>
        <div class="text-sm text-muted mt-2">لا توجد بيانات كافية لعرض لوحة الصدارة.</div>
      </div>`;
      return;
    }

    const medals = ["🥇", "🥈", "🥉"];
    const top3Html = data.slice(0, 3).map((item, i) => `
      <div class="card flex-center gap-3" style="border:2px solid ${i===0?'#f59e0b':i===1?'#94a3b8':'#d97706'}">
        <span style="font-size:2rem;">${medals[i]}</span>
        <div style="flex:1;">
          <div class="font-bold" style="font-size:0.9rem;">${item.teacher.name}</div>
          <div class="text-xs text-muted">${item.teacher.region}</div>
        </div>
        <div class="text-center">
          <div class="font-black text-primary" style="font-size:1.25rem;">${item.stats.completedStudents}</div>
          <div class="text-xs text-muted">متقنة على يدها</div>
        </div>
      </div>
    `).join("");

    const tableRows = data.map((item, i) => `
      <tr>
        <td style="text-align:center;font-weight:900;font-size:${i < 3 ? '1.25rem' : '0.875rem'};color:${i < 3 ? 'var(--color-secondary)' : 'var(--color-on-surface-variant)'};">#${i+1}</td>
        <td style="font-weight:700;">${item.teacher.name}</td>
        <td style="color:var(--color-on-surface-variant)">${item.teacher.region}</td>
        <td style="text-align:center;font-family:monospace;">${item.stats.totalStudents}</td>
        <td style="text-align:center;font-weight:700;color:var(--color-success);">${item.stats.completedStudents}</td>
        <td style="text-align:center;font-weight:700;color:var(--color-primary);">${item.stats.avgMastery}%</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;color:var(--color-secondary);">${item.stats.score}</td>
      </tr>
    `).join("");

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;margin-bottom:1.5rem;">${top3Html}</div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th style="text-align:center;width:60px;">الترتيب</th>
            <th>المبلّغة</th><th>المكتب</th>
            <th style="text-align:center">إجمالي المتعلمات</th>
            <th style="text-align:center">المتقنات على يدها</th>
            <th style="text-align:center">متوسط الإتقان</th>
            <th style="text-align:center">نقاط التميز</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>`;
  },

  // ==================== إضافة / تعديل مبلّغة ====================

  /**
   * @param {string|null} inviteSupervisorId — يُقفل حقل المشرفة عند الدعوة
   * @param {string|null} inviteRole — يُقفل حقل الدور إذا كان محدداً في رابط الدعوة
   */
  openAddModal(inviteSupervisorId = null, inviteRole = null) {
    const modal = document.getElementById("teacher-form-modal");
    if (!modal) return;

    document.getElementById("teacher-form").reset();
    document.getElementById("teacher-id-field").value = "";

    const codeInput = document.getElementById("teacher-code-input");
    if (codeInput) codeInput.value = "123456";

    this._populateFormSelects(null);

    const modalTitle = document.getElementById("teacher-modal-title");

    // إذا كانت المبلّغة الرئيسية هي من تفتح نافذة الإضافة، تُقفل المبلّغة الجديدة تحت إشرافها حصراً
    if (!inviteSupervisorId && auth.isHeadTeacher()) {
      inviteSupervisorId = auth.getCurrentUser().id;
    }

    if (inviteSupervisorId) {
      // رابط دعوة مبلّغة: قفل حقل المشرفة
      const supervisor = db.getTeacherById(inviteSupervisorId);
      if (supervisor) {
        const supSelect = document.getElementById("teacher-supervisor-select");
        if (supSelect) {
          supSelect.value    = inviteSupervisorId;
          supSelect.disabled = true; // لا يمكن تغيير المشرفة
        }

        const roleSelect = document.getElementById("teacher-role-select");
        if (roleSelect) {
          roleSelect.value    = inviteRole || "teacher";
          roleSelect.disabled = true; // مقفول حسب رابط الدعوة
        }

        const regionSelect = document.getElementById("teacher-region-select");
        if (regionSelect) {
          regionSelect.value    = supervisor.region;
          regionSelect.disabled = true; // نفس منطقة المشرفة
        }

        if (modalTitle) modalTitle.textContent = `تسجيل مبلّغة — إشراف: ${supervisor.name}`;
        AppUI.showToast(`ستُسجَّلين تحت إشراف الأستاذة: ${supervisor.name}`, "info");
      }
    } else if (inviteRole) {
      // رابط دعوة مباشر بدون مشرفة ولكن بدور محدد
      const roleSelect = document.getElementById("teacher-role-select");
      if (roleSelect) {
        roleSelect.value    = inviteRole;
        roleSelect.disabled = true; // مقفول حسب الرابط
      }
      if (modalTitle) modalTitle.textContent = inviteRole === "head_teacher" ? "تسجيل مبلّغة رئيسية" : "تسجيل مبلّغة";
    } else {
      // إضافة عادية — المشرف فقط يتحكم
      ["teacher-supervisor-select", "teacher-role-select", "teacher-region-select"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
      });
      if (modalTitle) modalTitle.textContent = "إضافة مبلّغة جديدة";
    }

    modal.classList.remove("hidden");
  },

  openEditModal(id) {
    const teacher = db.getTeacherById(id);
    if (!teacher) return;

    const modal = document.getElementById("teacher-form-modal");
    if (!modal) return;

    document.getElementById("teacher-id-field").value   = teacher.id;
    document.getElementById("teacher-name-input").value = teacher.name;
    document.getElementById("teacher-phone-input").value = teacher.phone || "";
    const codeInput = document.getElementById("teacher-code-input");
    if (codeInput) codeInput.value = teacher.verificationCode || teacher.password || "123456";

    document.getElementById("teacher-modal-title").textContent = "تعديل بيانات المبلّغة";

    this._populateFormSelects(teacher.id);

    ["teacher-supervisor-select", "teacher-role-select", "teacher-region-select"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });

    const regionSelect = document.getElementById("teacher-region-select");
    if (regionSelect) regionSelect.value = teacher.region;

    const specSelect = document.getElementById("teacher-spec-select");
    if (specSelect) specSelect.value = teacher.specialization || "both";

    const roleSelect = document.getElementById("teacher-role-select");
    if (roleSelect) roleSelect.value = teacher.role || "teacher";

    const supSelect = document.getElementById("teacher-supervisor-select");
    if (supSelect) supSelect.value = teacher.supervisorId || "";

    modal.classList.remove("hidden");
  },

  _populateFormSelects(currentTeacherId = null) {
    // المناطق والمكاتب
    const regionSelect = document.getElementById("teacher-region-select");
    if (regionSelect) {
      regionSelect.innerHTML = db.getRegions().map(r => `<option value="${r}">${r}</option>`).join("");
    }

    // المبلّغات الرئيسيات للإشراف
    const supSelect = document.getElementById("teacher-supervisor-select");
    if (supSelect) {
      const headTeachers = db.getTeachers()
        .filter(t => t.role === "head_teacher" && t.id !== currentTeacherId);

      supSelect.innerHTML =
        '<option value="">-- بدون مشرفة (مباشرة) --</option>' +
        headTeachers.map(t => `<option value="${t.id}">${t.name} (${t.region})</option>`).join("");
    }
  },

  handleFormSubmit(e) {
    if (e) e.preventDefault();

    const id               = document.getElementById("teacher-id-field")?.value || "";
    const name             = document.getElementById("teacher-name-input")?.value.trim() || "";
    const phone            = document.getElementById("teacher-phone-input")?.value.trim() || "";
    const verificationCode = (document.getElementById("teacher-code-input")?.value.trim() || "123456");
    const region           = document.getElementById("teacher-region-select")?.value || db.getRegions()[0];
    const specialization   = document.getElementById("teacher-spec-select")?.value || "both";
    const role             = document.getElementById("teacher-role-select")?.value || "teacher";
    const supervisorId     = document.getElementById("teacher-supervisor-select")?.value || null;

    if (!name) { AppUI.showToast("يرجى إدخال اسم المبلّغة", "warning"); return; }

    // إعادة تفعيل الحقول المقفولة قبل الحفظ
    ["teacher-supervisor-select", "teacher-role-select", "teacher-region-select"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });

    let savedTeacher = null;
    if (id) {
      savedTeacher = db.updateTeacher(id, { name, phone, verificationCode, password: verificationCode, region, specialization, role, supervisorId });
      AppUI.showToast("تم تحديث بيانات المبلّغة بنجاح", "success");
    } else {
      savedTeacher = db.addTeacher({ name, phone, verificationCode, password: verificationCode, region, specialization, role, supervisorId });
      AppUI.showToast(`تمت إضافة المبلّغة — كود التحقق: ${verificationCode}`, "success");
    }

    this.closeModal();

    // إذا كان تسجيل مبلّغة مباشرة من رابط دعوة وهي ليست مسجلة دخول
    if (!auth.isLoggedIn() && savedTeacher) {
      auth.loginAsTeacher(savedTeacher.id, verificationCode);
      AppUI.showAppScreen();
      AppUI.navigateTo("students");
      AppUI.showToast(`أهلاً بكِ يا أستاذة ${savedTeacher.name}! تم تسجيلكِ بنجاح`, "success");
      return;
    }

    this.renderTeachersList();
    AppUI.updateDashboardStats();
  },

  closeModal() {
    const modal = document.getElementById("teacher-form-modal");
    if (modal) modal.classList.add("hidden");
    // إعادة تفعيل
    ["teacher-supervisor-select", "teacher-role-select", "teacher-region-select"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });
  },

  confirmDelete(id) {
    const teacher = db.getTeacherById(id);
    if (!teacher) return;
    AppUI.showConfirmModal(
      "حذف سجل مبلّغة",
      `هل أنت متأكد من حذف المبلّغة "${teacher.name}"؟ ستبقى متعلماتها في النظام دون مبلّغة.`,
      () => {
        db.deleteTeacher(id);
        this.renderTeachersList();
        AppUI.updateDashboardStats();
        AppUI.showToast("تم حذف سجل المبلّغة بنجاح", "info");
      }
    );
  }
};
