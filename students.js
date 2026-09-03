/**
 * محرك إدارة ومتابعة المتعلمات، التقييم اللحظي للأخطاء، وروابط التسجيل الذاتي
 * منظومة "بلغوا عني ولو آية" — v3.0
 */

const StudentsModule = {
  activeFilters: { search: "", region: "", status: "", language: "", teacherId: "", masteryRange: null },
  currentEditingMistakeWordIds: [],

  // ==================== الفلترة ====================

  getFilteredStudents() {
    const currentUser = auth.getCurrentUser();
    let list = db.getStudents();

    if (!currentUser) return [];

    if (auth.isTeacher()) {
      if (auth.isHeadTeacher()) {
        const subIds = db.getTeachers()
          .filter(t => t.supervisorId === currentUser.id)
          .map(t => t.id);
        const allowed = [currentUser.id, ...subIds];
        list = list.filter(s => allowed.includes(s.teacherId));
      } else {
        list = list.filter(s => s.teacherId === currentUser.id);
      }
    } else if (auth.isStudent()) {
      list = list.filter(s => s.id === currentUser.id);
    }

    return list.filter(student => {
      if (this.activeFilters.search) {
        const q = this.activeFilters.search.toLowerCase();
        const t = db.getTeacherById(student.teacherId);
        if (!((student.name || "").toLowerCase().includes(q) ||
              (student.phone || "").includes(q) ||
              (t ? t.name.toLowerCase().includes(q) : false))) return false;
      }
      if (this.activeFilters.region   && student.region   !== this.activeFilters.region)   return false;
      if (this.activeFilters.status   && student.status   !== this.activeFilters.status)   return false;
      if (this.activeFilters.language !== "") {
        if (student.isArabicSpeaker !== (this.activeFilters.language === "true")) return false;
      }
      if (this.activeFilters.teacherId && student.teacherId !== this.activeFilters.teacherId) return false;
      
      if (this.activeFilters.masteryRange) {
        const m = typeof student.mastery === "number" ? student.mastery : 0;
        if (m < this.activeFilters.masteryRange.min || m > this.activeFilters.masteryRange.max) return false;
      }

      return true;
    });
  },

  setFilter(key, value) {
    this.activeFilters[key] = value;
    if (key === 'region') {
      const el = document.getElementById("students-region-filter");
      if (el) el.value = value;
    } else if (key === 'status') {
      const el = document.getElementById("students-status-filter");
      if (el) el.value = value;
    }
    this.renderStudentsTable();
  },

  setMasteryRangeFilter(min, max, label) {
    this.activeFilters.masteryRange = { min, max, label };
    this.renderStudentsTable();
    AppUI.showToast(`تمت الفلترة: متعلمات فئة ${label}`, "info");
  },

  resetFilters() {
    this.activeFilters = { search: "", region: "", status: "", language: "", teacherId: "", masteryRange: null };
    const si = document.getElementById("students-search-input");
    if (si) si.value = "";
    const rf = document.getElementById("students-region-filter");
    if (rf) rf.value = "";
    const sf = document.getElementById("students-status-filter");
    if (sf) sf.value = "";
    this.renderStudentsTable();
  },

  // ==================== جدول المتعلمات ====================

  renderStudentsTable() {
    if (auth.isStudent()) { AppUI.navigateTo("student-portal"); return; }

    const container = document.getElementById("students-list-container");
    if (!container) return;

    const students = this.getFilteredStudents();
    const badge = document.getElementById("students-count-badge");
    if (badge) badge.textContent = `${students.length} متعلمة`;

    if (students.length === 0) {
      container.innerHTML = `
        <div class="card text-center" style="padding:3rem 1rem">
          <span class="material-symbols-outlined" style="font-size:3.5rem;color:var(--color-on-surface-variant);opacity:0.4;">person_search</span>
          <div class="font-bold mt-2" style="font-size:1.1rem;">لا توجد متعلمات مطابقة</div>
          <div class="text-sm text-muted mt-1 mb-3">يمكنك إضافة متعلمة جديدة أو تغيير الفلاتر.</div>
          <button onclick="StudentsModule.openAddModal()" class="btn btn-p btn-sm" style="display:inline-flex;">
            <span class="material-symbols-outlined" style="font-size:1rem;">add</span>تسجيل متعلمة جديدة
          </button>
        </div>`;
      return;
    }

    let rows = students.map(student => {
      const teacher  = db.getTeacherById(student.teacherId);
      const statusObj = APP_CONFIG.studentStatuses.find(s => s.id === student.status) || { label: "في تقدم", icon: "trending_up" };
      const mistakes  = Array.isArray(student.mistakeWordIds) ? student.mistakeWordIds.length : (student.errorsCount || 0);
      const masteryColor = student.mastery >= 95 ? "var(--color-success)"
                         : student.mastery >= 80 ? "var(--color-primary)"
                         : student.mastery >= 65 ? "var(--color-secondary)"
                         : "var(--color-error)";

      return `
        <tr>
          <td>
            <div class="flex-center gap-2">
              <div class="avatar-text">${(student.name || "ط").charAt(0)}</div>
              <div>
                <button onclick="StudentsModule.openProfileModal('${student.id}')" style="background:none;border:none;cursor:pointer;font-weight:700;font-family:'Cairo',sans-serif;font-size:0.875rem;color:var(--color-on-surface);text-align:right;padding:0;">
                  ${student.name}
                </button>
                <div class="text-xs text-muted">${student.phone || "بدون هاتف"}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:0.75rem;background:var(--color-surface-container);padding:2px 8px;border-radius:6px;">
              <span class="material-symbols-outlined" style="font-size:0.875rem;">location_on</span>${student.region}
            </span>
          </td>
          <td style="font-size:0.8rem;font-weight:600;">${teacher ? teacher.name : "غير محددة"}</td>
          <td>
            ${student.isArabicSpeaker
              ? '<span class="badge badge-primary">ناطقة</span>'
              : '<span class="badge badge-secondary">غير ناطقة</span>'}
          </td>
          <td style="text-align:center;font-family:monospace;font-size:0.8rem;">
            <span style="color:${mistakes > 0 ? "var(--color-error)" : "var(--color-on-surface-variant)"};font-weight:700;">${mistakes}/29</span>
          </td>
          <td style="text-align:center;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
              <strong style="color:${masteryColor};font-size:0.875rem;">${student.mastery}%</strong>
              <div class="mastery-bar" style="width:60px;">
                <div class="mastery-bar-fill" style="width:${student.mastery}%;background:${masteryColor}"></div>
              </div>
            </div>
          </td>
          <td style="text-align:center;font-weight:700;font-size:0.8rem;">${student.tajweedScore || 100}%</td>
          <td style="text-align:center;">
            <span class="status-badge status-${student.status}">
              <span class="material-symbols-outlined" style="font-size:0.875rem;">${statusObj.icon}</span>
              ${statusObj.label}
            </span>
          </td>
          <td style="text-align:center;">
            <div class="flex-center gap-1" style="justify-content:center;">
              <button onclick="StudentsModule.openProfileModal('${student.id}')" class="btn btn-p btn-sm" title="المتابعة والتصحيح اللحظي">
                <span class="material-symbols-outlined" style="font-size:0.9rem;">edit_note</span>
                <span class="hide-mobile">المتابعة</span>
              </button>
              ${!auth.isStudent() ? `
                <button onclick="StudentsModule.openEditModal('${student.id}')" class="btn-icon" title="تعديل البيانات">
                  <span class="material-symbols-outlined" style="font-size:1.1rem;">edit</span>
                </button>
                <button onclick="StudentsModule.confirmDelete('${student.id}')" class="btn-icon" title="حذف" style="color:var(--color-error)">
                  <span class="material-symbols-outlined" style="font-size:1.1rem;">delete</span>
                </button>
              ` : ""}
            </div>
          </td>
        </tr>`;
    }).join("");

    container.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>المتعلمة</th><th>المكتب</th><th>المبلّغة</th><th>اللغة</th>
            <th style="text-align:center">أخطاء</th>
            <th style="text-align:center">الإتقان</th>
            <th style="text-align:center">التجويد</th>
            <th style="text-align:center">الحالة</th>
            <th style="text-align:center">الإجراءات</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  // ==================== إضافة متعلمة (مع دعم رابط الدعوة وقفل المبلّغة) ====================

  /**
   * @param {string|null} inviteTeacherId — إذا جاء من رابط دعوة، يُقفل حقل المبلّغة
   */
  openAddModal(inviteTeacherId = null) {
    if (auth.isStudent()) { AppUI.showToast("لا تملك الصلاحية", "warning"); return; }

    const modal = document.getElementById("student-add-modal");
    if (!modal) return;

    document.getElementById("student-add-form").reset();
    const passInput = document.getElementById("student-add-password-input");
    if (passInput) passInput.value = "123456";

    this._populateAddRegions();

    const regionSelect = document.getElementById("student-add-region-select");

    if (inviteTeacherId) {
      // رابط الدعوة: اقفل المنطقة والمبلّغة ولا تسمح بتعديلهما
      const teacher = db.getTeacherById(inviteTeacherId);
      if (teacher) {
        if (regionSelect) {
          regionSelect.value = teacher.region;
          regionSelect.disabled = true; // مقفول
        }
        this.updateAddFormTeachersByRegion(teacher.region, inviteTeacherId, true);
        AppUI.showToast(`أنت تسجلين تحت إشراف المبلّغة: ${teacher.name}`, "info");
      }
    } else {
      if (regionSelect) regionSelect.disabled = false;
      const initialRegion = regionSelect ? regionSelect.value : db.getRegions()[0];
      this.updateAddFormTeachersByRegion(initialRegion, null, false);

      if (auth.isTeacher()) {
        const teacherSelect = document.getElementById("student-add-teacher-select");
        if (teacherSelect) {
          teacherSelect.value    = auth.getCurrentUser().id;
          teacherSelect.disabled = true; // المبلّغة لا تغير مُشرفها
        }
      }
    }

    modal.classList.remove("hidden");
  },

  _populateAddRegions() {
    const el = document.getElementById("student-add-region-select");
    if (!el) return;
    el.innerHTML = db.getRegions().map(r => `<option value="${r}">${r}</option>`).join("");
  },

  /**
   * تحديث قائمة المبلّغات عند تغيير المنطقة
   * @param {string}  selectedRegion
   * @param {string|null} lockedTeacherId — إذا حُدد، يتم تحديد المبلّغة وقفلها
   * @param {boolean} lockField
   */
  updateAddFormTeachersByRegion(selectedRegion, lockedTeacherId = null, lockField = false) {
    const teacherSelect = document.getElementById("student-add-teacher-select");
    if (!teacherSelect) return;

    let teachers = db.getTeachersByRegion(selectedRegion);

    // المبلّغة الرئيسية ترى مبلّغاتها فقط
    if (auth.isHeadTeacher()) {
      const cu = auth.getCurrentUser();
      teachers = teachers.filter(t => t.id === cu.id || t.supervisorId === cu.id);
    } else if (auth.isTeacher()) {
      const cu = auth.getCurrentUser();
      teachers = teachers.filter(t => t.id === cu.id);
    }

    if (teachers.length === 0) {
      teacherSelect.innerHTML = `<option value="">-- لا توجد مبلّغات في هذا المكتب --</option>`;
      teacherSelect.disabled = lockField;
      return;
    }

    teacherSelect.innerHTML =
      '<option value="">-- اختر المبلّغة المشرفة --</option>' +
      teachers.map(t => `<option value="${t.id}">${t.name} (${t.region})</option>`).join("");

    if (lockedTeacherId) {
      teacherSelect.value    = lockedTeacherId;
      teacherSelect.disabled = lockField;
    } else {
      teacherSelect.disabled = auth.isTeacher() && !auth.isHeadTeacher(); // المبلّغة العادية لا تغير مشرفها
    }
  },

  handleAddFormSubmit(e) {
    if (e) e.preventDefault();

    const name     = document.getElementById("student-add-name-input")?.value.trim() || "";
    const phone    = document.getElementById("student-add-phone-input")?.value.trim() || "";
    const password = document.getElementById("student-add-password-input")?.value.trim() || "123456";
    const region   = document.getElementById("student-add-region-select")?.value || db.getRegions()[0];
    const teacherId = document.getElementById("student-add-teacher-select")?.value || null;
    const isArabicSpeaker = document.getElementById("student-add-language-select")?.value === "true";
    const initialNote = document.getElementById("student-add-note-input")?.value.trim() || "";
    const learningTrack = document.getElementById("student-add-track-select")?.value || "memorize";

    if (!name) { AppUI.showToast("يرجى إدخال اسم المتعلمة", "warning"); return; }
    if (!phone) { AppUI.showToast("يرجى إدخال رقم هاتف المتعلمة (مطلوب لتسجيل الدخول)", "warning"); return; }

    // التحقق من توافق التخصص واللغة
    if (teacherId) {
      const teacher = db.getTeacherById(teacherId);
      if (teacher && teacher.specialization) {
        if (teacher.specialization === "arabic" && !isArabicSpeaker) {
          AppUI.showToast("المبلّغة المختارة متخصصة في (الناطقين بالعربية فقط)، يرجى اختيار مبلّغة تقبل غير الناطقين", "error");
          return;
        }
        if (teacher.specialization === "non_arabic" && isArabicSpeaker) {
          AppUI.showToast("المبلّغة المختارة متخصصة في (غير الناطقين بالعربية فقط)، يرجى اختيار مبلّغة أخرى", "error");
          return;
        }
      }
    }

    // إعادة تفعيل الحقول المقفولة قبل القراءة
    ["student-add-region-select", "student-add-teacher-select"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });

    const newStudent = db.addStudent({ name, phone, password, region, teacherId, isArabicSpeaker, mistakeWordIds: [], initialNote, status: "in_progress", learningTrack });

    this.closeAddModal();

    // إذا كان تسجيل متعلمة مباشرة من رابط دعوة وهي ليست مسجلة دخول
    if (!auth.isLoggedIn()) {
      auth.loginAsStudent(newStudent.id, password);
      AppUI.showAppScreen();
      AppUI.navigateTo("student-portal");
      AppUI.showToast(`مرحباً بكِ يا ${newStudent.name}! تم تسجيلكِ بنجاح تحت إشراف المبلّغة`, "success");
      return;
    }

    this.renderStudentsTable();
    AppUI.updateDashboardStats();
    AppUI.showToast("تم تسجيل المتعلمة بنجاح — كلمة مرور حسابها: " + password, "success");
  },

  closeAddModal() {
    const modal = document.getElementById("student-add-modal");
    if (modal) modal.classList.add("hidden");
    // إعادة تفعيل الحقول
    ["student-add-region-select", "student-add-teacher-select"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = false;
    });
  },

  // ==================== تعديل متعلمة ====================

  openEditModal(id) {
    if (auth.isStudent()) return;
    const student = db.getStudentById(id);
    if (!student) return;

    const modal = document.getElementById("student-edit-modal");
    if (!modal) return;

    document.getElementById("student-edit-id-field").value   = student.id;
    document.getElementById("student-edit-name-input").value = student.name;
    document.getElementById("student-edit-phone-input").value = student.phone || "";
    document.getElementById("student-edit-password-input").value = student.password || "123456";

    const regionSelect = document.getElementById("student-edit-region-select");
    if (regionSelect) {
      regionSelect.innerHTML = db.getRegions().map(r => `<option value="${r}">${r}</option>`).join("");
      regionSelect.value = student.region;
    }
    this.updateEditFormTeachersByRegion(student.region, student.teacherId);

    document.getElementById("student-edit-language-select").value = student.isArabicSpeaker ? "true" : "false";
    document.getElementById("student-edit-tajweed-input").value   = student.tajweedScore || 100;

    const statusSelect = document.getElementById("student-edit-status-select");
    if (statusSelect) {
      statusSelect.innerHTML = APP_CONFIG.studentStatuses.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
      statusSelect.value = student.status;
    }
    const trackSelect = document.getElementById("student-edit-track-select");
    if (trackSelect) trackSelect.value = student.learningTrack || "memorize";

    modal.classList.remove("hidden");
  },

  updateEditFormTeachersByRegion(selectedRegion, currentTeacherId = null) {
    const teacherSelect = document.getElementById("student-edit-teacher-select");
    if (!teacherSelect) return;

    const teachers = db.getTeachersByRegion(selectedRegion);

    if (teachers.length === 0) {
      teacherSelect.innerHTML = `<option value="">-- لا توجد مبلّغات في هذا المكتب --</option>`;
      return;
    }

    teacherSelect.innerHTML =
      '<option value="">-- اختر المبلّغة المشرفة --</option>' +
      teachers.map(t => {
        const specText = t.specialization === 'arabic' ? 'ناطقين بالعربية' : t.specialization === 'non_arabic' ? 'غير ناطقين' : 'شامل';
        return `<option value="${t.id}">${t.name} [${specText}] (${t.region})</option>`;
      }).join("");

    if (currentTeacherId) teacherSelect.value = currentTeacherId;
  },

  handleEditFormSubmit(e) {
    if (e) e.preventDefault();

    const id       = document.getElementById("student-edit-id-field").value;
    const name     = document.getElementById("student-edit-name-input").value.trim();
    const phone    = document.getElementById("student-edit-phone-input").value.trim();
    const password = document.getElementById("student-edit-password-input").value.trim() || "123456";
    const region   = document.getElementById("student-edit-region-select").value;
    const teacherId = document.getElementById("student-edit-teacher-select").value;
    const isArabicSpeaker = document.getElementById("student-edit-language-select").value === "true";
    const tajweedScore = parseInt(document.getElementById("student-edit-tajweed-input").value, 10) || 100;
    const status   = document.getElementById("student-edit-status-select").value;
    const learningTrack = document.getElementById("student-edit-track-select")?.value || "memorize";

    if (!name) { AppUI.showToast("يرجى إدخال اسم المتعلمة", "warning"); return; }

    // التحقق من توافق التخصص واللغة
    if (teacherId) {
      const teacher = db.getTeacherById(teacherId);
      if (teacher && teacher.specialization) {
        if (teacher.specialization === "arabic" && !isArabicSpeaker) {
          AppUI.showToast("المبلّغة المختارة متخصصة في (الناطقين بالعربية فقط)، يرجى اختيار مبلّغة تقبل غير الناطقين", "error");
          return;
        }
        if (teacher.specialization === "non_arabic" && isArabicSpeaker) {
          AppUI.showToast("المبلّغة المختارة متخصصة في (غير الناطقين بالعربية فقط)، يرجى اختيار مبلّغة أخرى", "error");
          return;
        }
      }
    }

    db.updateStudent(id, { name, phone, password, region, teacherId, isArabicSpeaker, tajweedScore, status, learningTrack });
    this.closeEditModal();
    this.renderStudentsTable();
    AppUI.updateDashboardStats();
    AppUI.showToast("تم تحديث بيانات المتعلمة بنجاح", "success");
  },

  closeEditModal() {
    const modal = document.getElementById("student-edit-modal");
    if (modal) modal.classList.add("hidden");
  },

  // ==================== شاشة المتابعة والتصحيح اللحظي ====================

  openProfileModal(studentId) {
    const student = db.getStudentById(studentId);
    if (!student) return;

    this.currentProfileId = student.id;

    const modal = document.getElementById("student-profile-modal");
    if (!modal) return;
    modal.dataset.studentId = student.id;

    const teacher  = db.getTeacherById(student.teacherId);
    const mistakes = Array.isArray(student.mistakeWordIds) ? student.mistakeWordIds.length : (student.errorsCount || 0);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("profile-student-name",     student.name);
    set("profile-student-phone",    student.phone || "لا يوجد رقم هاتف");
    set("profile-student-region",   student.region);
    set("profile-student-teacher",  teacher ? teacher.name : "غير محددة");
    set("profile-student-language", student.isArabicSpeaker ? "ناطقة بالعربية" : "غير ناطقة");
    set("profile-student-mastery",  `${student.mastery}%`);
    set("profile-student-level",    student.masteryLevel);
    set("profile-student-tajweed",  `${student.tajweedScore || 100}%`);
    set("profile-student-errors",   `${mistakes}/29 كلمة`);
    const trackLabels = {
      'both': 'حفظ وتفسير',
      'memorize': 'حفظ',
      'tafseer': 'تفسير'
    };
    set("profile-student-track", trackLabels[student.learningTrack || 'memorize']);
    const tErrors = Array.isArray(student.mistakeAyahTafseerNos) ? student.mistakeAyahTafseerNos.length : 0;
    const gErrors = Array.isArray(student.mistakeGhareebIds) ? student.mistakeGhareebIds.length : 0;
    set("profile-student-tafseer-errors", `${tErrors + gErrors}/18`);

    const btnPromote = document.getElementById("btn-promote-teacher");
    const btnCert = document.getElementById("btn-issue-certificate");
    if (student.mastery >= 95 || student.status === 'completed') {
      if (btnPromote) btnPromote.style.display = 'inline-flex';
      if (btnCert) btnCert.style.display = 'inline-flex';
    } else {
      if (btnPromote) btnPromote.style.display = 'none';
      if (btnCert) btnCert.style.display = 'none';
    }

    const statusSelect = document.getElementById("profile-quick-status-select");
    if (statusSelect) {
      statusSelect.innerHTML = APP_CONFIG.studentStatuses.map(s => `<option value="${s.id}">${s.label}</option>`).join("");
      statusSelect.value = student.status;
    }
    const trackSelect = document.getElementById("student-edit-track-select");
    if (trackSelect) trackSelect.value = student.learningTrack || "memorize";

    this.renderLiveInteractiveAyat(student, "profile-ayat-container");
    this.renderStudentNotes(student, "profile-notes-list");

    modal.dataset.studentId = student.id;
    modal.classList.remove("hidden");
  },

    renderLiveInteractiveAyat(student, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const track = student.learningTrack || 'memorize';
    const isEditable = !auth.isStudent();
    const mistakeWordIds = Array.isArray(student.mistakeWordIds) ? student.mistakeWordIds : [];
    const mistakeAyahTafseerNos = Array.isArray(student.mistakeAyahTafseerNos) ? student.mistakeAyahTafseerNos : [];
    const mistakeGhareebIds = Array.isArray(student.mistakeGhareebIds) ? student.mistakeGhareebIds : [];

    let html = `<div style="display:flex;flex-direction:column;gap:1.25rem;">`;

    if (isEditable) {
      html += `<div style="font-size:0.75rem;color:var(--color-primary);background:rgba(81,100,71,0.08);padding:0.6rem 0.9rem;border-radius:0.75rem;display:flex;align-items:center;gap:0.5rem;">
        <span class="material-symbols-outlined" style="font-size:1rem;">touch_app</span>
        <span>انقري على أي كلمة، آية، أو معنى أثناء التسميع لتحديدها كخطأ — انقري مرة أخرى لإلغائه فوراً</span>
      </div>`;
    }

    // 1. مسار الحفظ (كلمات التلاوة)
    if (track === 'memorize' || track === 'both') {
      html += `<div class="font-bold text-sm" style="color:var(--color-primary);">مصحف التلاوة (29 كلمة)</div>`;
      FATIHA_DATA.ayat.forEach(aya => {
        const ayaWords = FATIHA_DATA.words.filter(w => w.aya_no === aya.aya_no);
        html += `
          <div style="padding:0.75rem 1rem;border-radius:1rem;background:var(--color-surface-container);border:1px solid var(--color-outline-variant);display:flex;align-items:center;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;">
            <span style="font-size:0.7rem;font-family:monospace;color:var(--color-on-surface-variant);background:var(--color-surface);padding:2px 8px;border-radius:6px;border:1px solid var(--color-outline-variant);flex-shrink:0;">الآية ${aya.aya_no}</span>
            <div style="flex:1;text-align:right;display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;">
        `;

        ayaWords.forEach(word => {
          const isMistake = mistakeWordIds.includes(word.id);
          if (isEditable) {
            html += `
              <button type="button"
                onclick="StudentsModule.toggleLiveProfileMistake('${student.id}','${word.id}')"
                class="quran-word-btn ${isMistake ? 'is-mistake' : ''}"
                title="${isMistake ? 'انقر لإلغاء الخطأ' : 'انقر لتسجيل خطأ'}">
                <span>${word.text}</span>
                ${isMistake ? '<span class="material-symbols-outlined" style="font-size:0.75rem;">cancel</span>' : ''}
              </button>`;
          } else {
            if (isMistake) {
              html += `<span class="quran-word-highlight-mistake" style="margin:0 0.2rem;font-family:UthmanicHafs,Amiri,serif;font-size:1.35rem;">${word.text}</span>`;
            } else {
              html += `<span style="margin:0 0.2rem;font-family:UthmanicHafs,Amiri,serif;font-size:1.35rem;">${word.text}</span>`;
            }
          }
        });

        html += `<span style="font-family:UthmanicHafs,Amiri,serif;font-size:1.5rem;color:var(--color-primary);margin-right:0.25rem;">${aya.end_glyph}</span>
            </div>
          </div>`;
      });
    }

    // 2. مسار التفسير والغريب
    if (track === 'tafseer' || track === 'both') {
      html += `<div class="font-bold text-sm" style="color:var(--color-primary);border-top:1px solid var(--color-outline-variant);padding-top:1rem;">فهم التفسير وغريب الكلمات</div>`;
      
      // التفسير الميسر
      if (typeof FATIHA_TAFSEER !== 'undefined') {
        html += `<div style="font-size:0.85rem;font-weight:700;margin-bottom:0.5rem;">التفسير الميسر للآيات (7 آيات)</div>`;
        FATIHA_TAFSEER.forEach(tafseer => {
          const isMistake = mistakeAyahTafseerNos.includes(tafseer.aya_no);
          const bgClass = isMistake ? 'bg-error-container text-on-error-container' : 'bg-surface-container';
          const borderClass = isMistake ? 'border-error' : 'border-outline-variant';
          
          if (isEditable) {
            html += `
              <div onclick="StudentsModule.toggleLiveTafseerMistake('${student.id}', ${tafseer.aya_no})"
                   class="tafseer-interactive-box ${isMistake ? 'is-mistake' : ''}"
                   style="margin-bottom:0.75rem;">
                <div class="flex-between">
                  <span class="tafseer-aya-no">آية ${tafseer.aya_no}</span>
                  ${isMistake ? '<span class="material-symbols-outlined text-error" style="font-size:1.2rem;">error</span>' : ''}
                </div>
                <div class="tafseer-text mt-1" style="font-size:0.9rem;">${tafseer.text}</div>
              </div>`;
          } else {
            html += `
              <div style="padding:0.75rem;border-radius:0.75rem;margin-bottom:0.75rem;border:1px solid var(--color-${borderClass});background:var(--color-${bgClass});">
                <div class="flex-between">
                  <span class="badge ${isMistake ? 'badge-error' : 'badge-primary'}">آية ${tafseer.aya_no}</span>
                </div>
                <div class="mt-1" style="font-size:0.9rem;">${tafseer.text}</div>
              </div>`;
          }
        });
      }

      // غريب الكلمات
      if (typeof FATIHA_GHAREEB !== 'undefined') {
        html += `<div style="font-size:0.85rem;font-weight:700;margin-top:1rem;margin-bottom:0.5rem;">غريب الكلمات (11 كلمة)</div>`;
        html += `<div style="display:flex;flex-wrap:wrap;gap:0.5rem;">`;
        FATIHA_GHAREEB.forEach(ghareeb => {
          const isMistake = mistakeGhareebIds.includes(ghareeb.id);
          if (isEditable) {
            html += `
              <button type="button"
                onclick="StudentsModule.toggleLiveGhareebMistake('${student.id}', '${ghareeb.id}')"
                class="ghareeb-word-pill ${isMistake ? 'is-mistake' : ''}"
                title="${isMistake ? 'إلغاء الخطأ' : 'تسجيل خطأ'}">
                <span class="ghareeb-word" style="font-weight:bold;color:var(--color-primary);">${ghareeb.word}</span>
                <span class="ghareeb-meaning" style="font-size:0.75rem;">${ghareeb.meaning}</span>
                ${isMistake ? '<span class="material-symbols-outlined" style="font-size:0.8rem;">cancel</span>' : ''}
              </button>`;
          } else {
             const style = isMistake ? 'background:#ffdad6;border-color:#ba1a1a;' : 'background:var(--color-surface-container);border-color:var(--color-outline-variant);';
             html += `
              <div style="display:inline-flex;flex-direction:column;padding:0.4rem 0.6rem;border-radius:0.5rem;border:1px solid;${style}">
                <span style="font-weight:bold;color:var(--color-primary);">${ghareeb.word}</span>
                <span style="font-size:0.75rem;">${ghareeb.meaning}</span>
              </div>`;
          }
        });
        html += `</div>`;
      }
    }

    html += `</div>`;
    container.innerHTML = html;
  },

  toggleLiveProfileMistake(studentId, wordId) {
    const updated = db.toggleStudentWordMistake(studentId, wordId);
    if (!updated) return;
    this._updateProfileModalUI(updated);
    const isMistake = updated.mistakeWordIds.includes(wordId);
    AppUI.showToast(
      isMistake ? "✕ تم تسجيل خطأ في هذه الكلمة" : "✓ تم إلغاء الخطأ واحتساب الكلمة متقنة",
      isMistake ? "warning" : "success"
    );
  },

  toggleLiveTafseerMistake(studentId, ayahNo) {
    const updated = db.toggleStudentAyahTafseerMistake(studentId, ayahNo);
    if (!updated) return;
    this._updateProfileModalUI(updated);
    const isMistake = updated.mistakeAyahTafseerNos.includes(ayahNo);
    AppUI.showToast(isMistake ? "✕ تم تسجيل خطأ في التفسير" : "✓ تم إلغاء خطأ التفسير", isMistake ? "warning" : "success");
  },

  toggleLiveGhareebMistake(studentId, ghareebId) {
    const updated = db.toggleStudentGhareebMistake(studentId, ghareebId);
    if (!updated) return;
    this._updateProfileModalUI(updated);
    const isMistake = updated.mistakeGhareebIds.includes(ghareebId);
    AppUI.showToast(isMistake ? "✕ تم تسجيل خطأ في الغريب" : "✓ تم إلغاء خطأ الغريب", isMistake ? "warning" : "success");
  },

  _updateProfileModalUI(updated) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("profile-student-mastery", `${updated.mastery}%`);
    set("profile-student-level",   updated.masteryLevel);
    
    const mistakes = Array.isArray(updated.mistakeWordIds) ? updated.mistakeWordIds.length : 0;
    set("profile-student-errors",  `${mistakes}/29 كلمة`);
    
    const tErrors = Array.isArray(updated.mistakeAyahTafseerNos) ? updated.mistakeAyahTafseerNos.length : 0;
    const gErrors = Array.isArray(updated.mistakeGhareebIds) ? updated.mistakeGhareebIds.length : 0;
    set("profile-student-tafseer-errors", `${tErrors + gErrors}/18`);

    // Show/hide buttons
    const btnPromote = document.getElementById("btn-promote-teacher");
    const btnCert = document.getElementById("btn-issue-certificate");
    if (updated.mastery >= 95 || updated.status === 'completed') {
      if (btnPromote) btnPromote.style.display = 'inline-flex';
      if (btnCert) btnCert.style.display = 'inline-flex';
    } else {
      if (btnPromote) btnPromote.style.display = 'none';
      if (btnCert) btnCert.style.display = 'none';
    }

    this.renderLiveInteractiveAyat(updated, "profile-ayat-container");
    this.renderStudentsTable();
    AppUI.updateDashboardStats();
  },

  promoteToTeacher() {
    const modal = document.getElementById("student-profile-modal");
    const studentId = this.currentProfileId || modal?.dataset.studentId;
    if (!studentId) return;

    const student = db.getStudentById(studentId);
    if (!student) return;

    if (student.promotedToTeacherId) {
      AppUI.showToast("هذه المتعلمة تم ترقيتها مسبقاً!", "warning");
      return;
    }

    AppUI.showConfirmModal(
      "ترقية المتعلمة إلى مبلّغة",
      `هل أنت متأكد من ترقية المتعلمة "${student.name}" لتصبح مبلّغة في المنظومة؟
سيتم الاحتفاظ بكلمة مرورها الحالية لدخولها كمبلّغة، وستُحتسب كخريجة ضمن إنجازاتك.`,
      () => {
        const response = db.promoteStudentToTeacher(studentId);
        if (response && response.success) {
          this.closeProfileModal();
          this.renderStudentsTable();
          AppUI.updateDashboardStats();
          AppUI.showToast(`تم ترقية ${student.name} إلى مبلّغة بنجاح!`, "success");
        }
      }
    );
  },

  handleQuickStatusChangehandleQuickStatusChange(newStatus) {
    const modal = document.getElementById("student-profile-modal");
    const studentId = modal?.dataset.studentId;
    if (!studentId) return;
    db.updateStudent(studentId, { status: newStatus });
    this.renderStudentsTable();
    AppUI.updateDashboardStats();
    AppUI.showToast("تم تحديث حالة إتقان المتعلمة", "success");
  },

  renderStudentNotes(student, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const notes = student.notes || [];
    if (notes.length === 0) {
      container.innerHTML = `<div class="text-center text-xs text-muted" style="padding:1rem;">لا توجد ملاحظات مسجلة حتى الآن.</div>`;
      return;
    }

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:0.5rem;max-height:160px;overflow-y:auto;padding-left:0.25rem;">
        ${notes.map(note => {
          const date = note.date ? new Date(note.date).toLocaleDateString("ar-SA") : "";
          return `
            <div style="background:var(--color-surface-container);padding:0.6rem 0.875rem;border-radius:0.75rem;font-size:0.8rem;">
              <div class="flex-between text-xs text-muted mb-1"><span>${note.author || "المبلّغة"}</span><span>${date}</span></div>
              <p style="color:var(--color-on-surface)">${note.text}</p>
            </div>`;
        }).join("")}
      </div>`;
  },

  handleAddNote() {
    const modal = document.getElementById("student-profile-modal");
    const studentId = modal?.dataset.studentId;
    const input = document.getElementById("new-note-input");
    if (!studentId || !input || !input.value.trim()) return;

    const currentUser = auth.getCurrentUser();
    db.addStudentNote(studentId, input.value.trim(), currentUser?.name || "المشرف");
    input.value = "";

    const updated = db.getStudentById(studentId);
    this.renderStudentNotes(updated, "profile-notes-list");
    AppUI.showToast("تمت إضافة الملاحظة بنجاح", "success");
  },

  closeProfileModal() {
    const modal = document.getElementById("student-profile-modal");
    if (modal) {
      modal.classList.add("hidden");
      this.currentProfileId = null;
    }
  },

  sendWhatsAppReport() {
    const modal = document.getElementById("student-profile-modal");
    const studentId = this.currentProfileId || modal?.dataset.studentId;
    if (!studentId) {
      AppUI.showToast("لم يتم العثور على ملف المتعلمة", "warning");
      return;
    }

    const student = db.getStudentById(studentId);
    if (!student) return;

    if (!student.phone || student.phone.trim() === "") {
      AppUI.showToast("يرجى تسجيل رقم هاتف المتعلمة أولاً لإرسال تقرير الواتساب", "warning");
      return;
    }

    const teacher = db.getTeacherById(student.teacherId);
    const teacherName = teacher ? teacher.name : "المبلّغة";
    const mistakes = Array.isArray(student.mistakeWordIds) ? student.mistakeWordIds.length : (student.errorsCount || 0);

    const message = `*منظومة بلغوا عني ولو آية 📖*\n` +
      `السلام عليكم ورحمة الله وبركاته،\n` +
      `تقرير متابعة المتعلمة: *${student.name}*\n` +
      `━━━━━━━━━━━━━━━\n` +
      `🔹 *نسبة الإتقان:* ${student.mastery}%\n` +
      `🔹 *التقييم اللفظي:* ${student.masteryLevel}\n` +
      `🔹 *عدد أخطاء الكلمات:* ${mistakes} من 29 كلمة\n` +
      `🔹 *درجة التجويد:* ${student.tajweedScore || 100}%\n` +
      `━━━━━━━━━━━━━━━\n` +
      `مشرفتكِ: *${teacherName}*\n` +
      `نسأل الله لكِ دوام التوفيق والبركة في حفظ كتابه الكريم.`;

    // تنظيف رقم الهاتف للواتساب
    let phone = student.phone.trim().replace(/[^\d+]/g, "");
    if (phone.startsWith("05")) {
      phone = "966" + phone.substring(1);
    } else if (phone.startsWith("5") && phone.length === 9) {
      phone = "966" + phone;
    } else if (phone.startsWith("00")) {
      phone = phone.substring(2);
    } else if (phone.startsWith("+")) {
      phone = phone.substring(1);
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(message)}`;
    
    // محاولة الفتح بالمتصفح
    const win = window.open(whatsappUrl, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = whatsappUrl;
    } else {
      AppUI.showToast("جاري توجيهك إلى واتساب لإرسال التقرير...", "success");
    }
  },

  // ==================== بوابة المتعلمة ====================

  renderStudentPortal() {
    const user = auth.getCurrentUser();
    if (!user) return;
    const student = db.getStudentById(user.id);
    if (!student) return;

    const teacher  = db.getTeacherById(student.teacherId);
    const statusObj = APP_CONFIG.studentStatuses.find(s => s.id === student.status) || { label: "في تقدم", icon: "trending_up" };
    const mistakes = Array.isArray(student.mistakeWordIds) ? student.mistakeWordIds.length : (student.errorsCount || 0);

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set("portal-student-name",    student.name);
    set("portal-teacher-name",    teacher ? teacher.name : "غير محددة");
    set("portal-student-region",  student.region);
    set("portal-student-mastery", `${student.mastery}%`);
    set("portal-student-tajweed", `${student.tajweedScore || 100}%`);
    set("portal-student-level",   student.masteryLevel);
    set("portal-student-errors",  `${mistakes}/29`);

    const statusEl = document.getElementById("portal-student-status");
    if (statusEl) statusEl.textContent = statusObj.label;

    this.renderLiveInteractiveAyat(student, "portal-ayat-container");
    this.renderStudentNotes(student, "portal-notes-container");
  },

  // ==================== روابط الدعوة ====================

  copyTeacherInviteLink(teacherId) {
    const teacher = db.getTeacherById(teacherId);
    if (!teacher) return;
    const base = window.location.href.split("?")[0];
    const url  = `${base}?invite=student&teacher=${encodeURIComponent(teacher.id)}`;
    this._copyToClipboard(url, `تم نسخ رابط تسجيل المتعلمات للمبلّغة "${teacher.name}"`);
  },

  copyHeadTeacherInviteLink(headTeacherId) {
    const teacher = db.getTeacherById(headTeacherId);
    if (!teacher) return;
    const base = window.location.href.split("?")[0];
    const url  = `${base}?invite=teacher&supervisor=${encodeURIComponent(teacher.id)}`;
    this._copyToClipboard(url, `تم نسخ رابط دعوة المبلّغات للأستاذة "${teacher.name}"`);
  },

  _copyToClipboard(text, successMsg) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => AppUI.showToast(successMsg, "success"))
        .catch(() => this._fallbackCopy(text, successMsg));
    } else {
      this._fallbackCopy(text, successMsg);
    }
  },

  _fallbackCopy(text, successMsg) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    AppUI.showToast(successMsg, "success");
  },

  // ==================== حذف ====================

  confirmDelete(id) {
    const student = db.getStudentById(id);
    if (!student) return;
    AppUI.showConfirmModal(
      "حذف سجل متعلمة",
      `هل أنت متأكد من حذف سجل المتعلمة "${student.name}" نهائياً؟`,
      () => {
        db.deleteStudent(id);
        this.renderStudentsTable();
        AppUI.updateDashboardStats();
        AppUI.showToast("تم حذف سجل المتعلمة بنجاح", "info");
      }
    );
  }
};
