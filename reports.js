/**
 * محرك التقارير والتصدير (Reports & Data Export Module) — v3.2
 * منظومة "بلغوا عني ولو آية"
 */

const ReportsModule = {

  getScopedData() {
    const currentUser = auth.getCurrentUser();
    let allStudents = db.getStudents();
    let allTeachers = db.getTeachers();

    if (!currentUser) return { students: [], teachers: [], canViewTeachersReport: false };

    if (auth.isAdmin()) {
      return {
        students: allStudents,
        teachers: allTeachers,
        canViewTeachersReport: true
      };
    }

    if (auth.isHeadTeacher()) {
      // المعلمة الرئيسية: ترى نفسها + المعلمات المسجلات بإشرافها فقط
      const myTeachers = allTeachers.filter(
        t => t.id === currentUser.id || t.supervisorId === currentUser.id
      );
      const allowedTeacherIds = myTeachers.map(t => t.id);
      const myStudents = allStudents.filter(s => allowedTeacherIds.includes(s.teacherId));

      return {
        students: myStudents,
        teachers: myTeachers,
        canViewTeachersReport: true
      };
    }

    if (auth.isTeacher()) {
      // المعلمة: طالباتها فقط
      const myStudents = allStudents.filter(s => s.teacherId === currentUser.id);
      return {
        students: myStudents,
        teachers: [],
        canViewTeachersReport: false
      };
    }

    return { students: [], teachers: [], canViewTeachersReport: false };
  },

  updateReportOptions() {
    const typeSelect = document.getElementById("report-type-select");
    if (!typeSelect) return;

    const { canViewTeachersReport } = this.getScopedData();

    if (!canViewTeachersReport) {
      typeSelect.innerHTML = `<option value="students">تقرير إنجاز الطالبات</option>`;
      typeSelect.value = "students";
    } else {
      const cur = typeSelect.value;
      typeSelect.innerHTML = `
        <option value="students">تقرير إنجاز الطالبات</option>
        <option value="teachers">تقرير أداء المعلمات</option>
      `;
      if (cur) typeSelect.value = cur;
    }
  },

  generateLiveReport() {
    const container = document.getElementById("report-preview-container");
    if (!container) return;

    this.updateReportOptions();

    const reportTypeSelect = document.getElementById("report-type-select");
    let reportType   = reportTypeSelect?.value || "students";
    const regionFilter = document.getElementById("report-region-select")?.value  || "";
    const statusFilter = document.getElementById("report-status-select")?.value  || "";

    const { students: scopedStudents, teachers: scopedTeachers, canViewTeachersReport } = this.getScopedData();

    if (reportType === "teachers" && !canViewTeachersReport) {
      reportType = "students";
      if (reportTypeSelect) reportTypeSelect.value = "students";
    }

    let students = [...scopedStudents];
    let teachers = [...scopedTeachers];

    if (regionFilter) {
      students = students.filter(s => s.region === regionFilter);
      teachers  = teachers.filter(t => t.region === regionFilter);
    }
    if (statusFilter) {
      students = students.filter(s => s.status === statusFilter);
    }

    const today = new Date().toLocaleDateString("ar-SA");

    let html = "";

    if (reportType === "students") {
      const rows = students.length === 0
        ? `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--color-on-surface-variant);">لا توجد بيانات مطابقة لخيارات التقرير</td></tr>`
        : students.map((s, i) => {
            const teacher   = db.getTeacherById(s.teacherId);
            const statusObj = APP_CONFIG.studentStatuses.find(st => st.id === s.status) || { label: s.status };
            const mistakes  = Array.isArray(s.mistakeWordIds) ? s.mistakeWordIds.length : (s.errorsCount || 0);
            return `
              <tr>
                <td style="font-family:monospace;color:var(--color-on-surface-variant);">${i + 1}</td>
                <td style="font-weight:700;">${s.name}</td>
                <td style="color:var(--color-on-surface-variant);">${s.region}</td>
                <td>${teacher ? teacher.name : "—"}</td>
                <td>${s.isArabicSpeaker ? "ناطقة بالعربية" : "غير ناطقة"}</td>
                <td style="text-align:center;font-family:monospace;">${mistakes}/29</td>
                <td style="text-align:center;font-weight:700;color:var(--color-primary);">${s.mastery}%</td>
                <td style="text-align:center;font-weight:700;">${s.tajweedScore || 100}%</td>
                <td style="text-align:center;">${statusObj.label}</td>
              </tr>`;
          }).join("");

      html = `
        <div id="pdf-report-content" style="padding:1rem;background:#fff;color:#1b1c19;direction:rtl;font-family:'Cairo',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:2px solid #516447;">
            <div>
              <div style="font-weight:900;font-size:1.2rem;color:#516447;">منظومة بلغوا عني ولو آية - تقرير إنجاز الطالبات</div>
              <div style="font-size:0.8rem;color:#5f635a;margin-top:0.25rem;">تاريخ الاستخراج: ${today} | إجمالي الطالبات: ${students.length}</div>
            </div>
            <div style="font-size:0.75rem;text-align:left;color:#5f635a;">سورة الفاتحة (29 كلمة)</div>
          </div>
          <div class="table-wrap">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
              <thead>
                <tr style="background:#f5f3ef;border-bottom:2px solid #516447;">
                  <th style="padding:8px;text-align:right;">#</th>
                  <th style="padding:8px;text-align:right;">الطالبة</th>
                  <th style="padding:8px;text-align:right;">المكتب</th>
                  <th style="padding:8px;text-align:right;">المعلمة</th>
                  <th style="padding:8px;text-align:right;">اللغة</th>
                  <th style="padding:8px;text-align:center;">أخطاء</th>
                  <th style="padding:8px;text-align:center;">الإتقان</th>
                  <th style="padding:8px;text-align:center;">التجويد</th>
                  <th style="padding:8px;text-align:center;">الحالة</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`;
    } else if (reportType === "teachers") {
      const rows = teachers.length === 0
        ? `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--color-on-surface-variant);">لا توجد معلمات مسجلات</td></tr>`
        : teachers.map((t, i) => {
            const stats = TeachersModule.getTeacherStats(t.id);
            const spec  = APP_CONFIG.specializations.find(sp => sp.id === t.specialization) || { label: "كلاهما" };
            return `
              <tr>
                <td style="font-family:monospace;color:var(--color-on-surface-variant);">${i + 1}</td>
                <td style="font-weight:700;">${t.name}</td>
                <td style="color:var(--color-on-surface-variant);">${t.region}</td>
                <td>${spec.label}</td>
                <td style="text-align:center;font-family:monospace;font-weight:700;">${stats.totalStudents}</td>
                <td style="text-align:center;font-weight:700;color:var(--color-success);">${stats.completedStudents}</td>
                <td style="text-align:center;font-weight:700;color:var(--color-primary);">${stats.avgMastery}%</td>
                <td style="text-align:center;font-weight:700;font-family:monospace;color:var(--color-secondary);">${stats.score}</td>
              </tr>`;
          }).join("");

      html = `
        <div id="pdf-report-content" style="padding:1rem;background:#fff;color:#1b1c19;direction:rtl;font-family:'Cairo',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:2px solid #516447;">
            <div>
              <div style="font-weight:900;font-size:1.2rem;color:#516447;">منظومة بلغوا عني ولو آية - تقرير أداء المعلمات</div>
              <div style="font-size:0.8rem;color:#5f635a;margin-top:0.25rem;">تاريخ الاستخراج: ${today} | إجمالي المعلمات: ${teachers.length}</div>
            </div>
            <div style="font-size:0.75rem;text-align:left;color:#5f635a;">متابعة إنجاز الحلقات</div>
          </div>
          <div class="table-wrap">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
              <thead>
                <tr style="background:#f5f3ef;border-bottom:2px solid #516447;">
                  <th style="padding:8px;text-align:right;">#</th>
                  <th style="padding:8px;text-align:right;">المعلمة</th>
                  <th style="padding:8px;text-align:right;">المكتب</th>
                  <th style="padding:8px;text-align:right;">التخصص</th>
                  <th style="padding:8px;text-align:center;">إجمالي الطالبات</th>
                  <th style="padding:8px;text-align:center;">المتقنات</th>
                  <th style="padding:8px;text-align:center;">متوسط الإتقان</th>
                  <th style="padding:8px;text-align:center;">نقاط التميز</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>`;
    }

    container.innerHTML = html;
  },

  exportToExcel() {
    if (typeof XLSX === "undefined") {
      AppUI.showToast("جاري تحميل مكتبة Excel، يرجى المحاولة بعد قليل", "warning");
      return;
    }

    const { students } = this.getScopedData();
    if (students.length === 0) {
      AppUI.showToast("لا توجد بيانات طالبات للتصدير حالياً", "warning");
      return;
    }

    const rows = students.map((s, i) => {
      const teacher   = db.getTeacherById(s.teacherId);
      const statusObj = APP_CONFIG.studentStatuses.find(st => st.id === s.status) || { label: s.status };
      const mistakes  = Array.isArray(s.mistakeWordIds) ? s.mistakeWordIds.length : (s.errorsCount || 0);
      return {
        "الرقم":            i + 1,
        "اسم الطالبة":     s.name,
        "رقم الهاتف":      s.phone || "",
        "المكتب":            s.region,
        "المعلمة المشرفة": teacher ? teacher.name : "غير محددة",
        "اللغة":            s.isArabicSpeaker ? "ناطقة بالعربية" : "غير ناطقة",
        "أخطاء الكلمات":   `${mistakes} من 29`,
        "نسبة الإتقان":     `${s.mastery}%`,
        "التقييم":          s.masteryLevel || "",
        "درجة التجويد":     `${s.tajweedScore || 100}%`,
        "الحالة":           statusObj.label,
        "تاريخ الانضمام":  s.joinedDate || "",
        "آخر متابعة":       s.lastFollowUpDate || ""
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    if (!ws["!views"]) ws["!views"] = [];
    ws["!views"].push({ RTL: true });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "طالبات الفاتحة");
    XLSX.writeFile(wb, `تقرير_طالبات_الفاتحة_${new Date().toISOString().split("T")[0]}.xlsx`);
    AppUI.showToast("تم تنزيل ملف Excel بنجاح", "success");
  },

  exportToPDF() {
    const reportElement = document.getElementById("pdf-report-content") || document.getElementById("report-preview-container");
    if (!reportElement || !reportElement.innerHTML.trim()) {
      AppUI.showToast("يرجى استعراض التقرير أولاً قبل التنزيل", "warning");
      return;
    }

    if (typeof html2pdf === "undefined") {
      AppUI.showToast("جاري فتح نافذة الطباعة والحفظ كـ PDF...", "info");
      window.print();
      return;
    }

    AppUI.showToast("جاري تحويل وتنزيل ملف PDF...", "info");

    const reportType = document.getElementById("report-type-select")?.value || "students";
    const filename = reportType === "teachers"
      ? `تقرير_أداء_المعلمات_${new Date().toISOString().split("T")[0]}.pdf`
      : `تقرير_إنجاز_الطالبات_${new Date().toISOString().split("T")[0]}.pdf`;

    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(reportElement).save().then(() => {
      AppUI.showToast("تم تنزيل ملف PDF بنجاح", "success");
    }).catch(err => {
      console.error("html2pdf error:", err);
      AppUI.showToast("تم فتح خيار الطباعة للتحميل المباشر", "info");
      window.print();
    });
  }
};
