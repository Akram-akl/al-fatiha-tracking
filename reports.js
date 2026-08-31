/**
 * محرك التقارير والتصدير (Reports & Data Export Module) — v3.0
 * منظومة "بلغوا عني ولو آية"
 */

const ReportsModule = {

  generateLiveReport() {
    const container = document.getElementById("report-preview-container");
    if (!container) return;

    const reportType   = document.getElementById("report-type-select")?.value || "students";
    const regionFilter = document.getElementById("report-region-select")?.value  || "";
    const statusFilter = document.getElementById("report-status-select")?.value  || "";

    let students = db.getStudents();
    let teachers  = db.getTeachers();

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
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid var(--color-outline-variant);">
            <div>
              <div style="font-weight:800;font-size:1.05rem;">تقرير متابعة الطالبات وإتقان سورة الفاتحة</div>
              <div style="font-size:0.75rem;color:var(--color-on-surface-variant);">تاريخ الاستخراج: ${today} | إجمالي الطالبات: ${students.length}</div>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>#</th><th>الطالبة</th><th>المنطقة</th><th>المعلمة</th><th>اللغة</th>
                <th style="text-align:center">أخطاء</th>
                <th style="text-align:center">الإتقان</th>
                <th style="text-align:center">التجويد</th>
                <th style="text-align:center">الحالة</th>
              </tr></thead>
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
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;padding-bottom:0.75rem;border-bottom:1px solid var(--color-outline-variant);">
            <div>
              <div style="font-weight:800;font-size:1.05rem;">تقرير أداء المعلمات وإنجاز الحلقات</div>
              <div style="font-size:0.75rem;color:var(--color-on-surface-variant);">تاريخ الاستخراج: ${today} | إجمالي المعلمات: ${teachers.length}</div>
            </div>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>#</th><th>المعلمة</th><th>المنطقة</th><th>التخصص</th>
                <th style="text-align:center">إجمالي الطالبات</th>
                <th style="text-align:center">المتقنات</th>
                <th style="text-align:center">متوسط الإتقان</th>
                <th style="text-align:center">نقاط التميز</th>
              </tr></thead>
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

    const students = db.getStudents();
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
        "المنطقة":          s.region,
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
    AppUI.showToast("تم تصدير ملف Excel بنجاح", "success");
  },

  exportToPDF() {
    window.print();
  }
};
