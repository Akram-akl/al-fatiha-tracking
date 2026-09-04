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
      // المبلّغة الرئيسية: ترى نفسها + المبلّغات المسجلات بإشرافها فقط
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
      // المبلّغة: متعلماتها فقط
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
      typeSelect.innerHTML = `<option value="students">تقرير إنجاز المتعلمات</option>`;
      typeSelect.value = "students";
    } else {
      const cur = typeSelect.value;
      typeSelect.innerHTML = `
        <option value="students">تقرير إنجاز المتعلمات</option>
        <option value="teachers">تقرير أداء المبلّغات</option>
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
    const trackFilter  = document.getElementById("report-track-select")?.value   || "";

    const { students: scopedStudents, teachers: scopedTeachers, canViewTeachersReport } = this.getScopedData();

    if (reportType === "teachers" && !canViewTeachersReport) {
      reportType = "students";
      if (reportTypeSelect) reportTypeSelect.value = "students";
    }

    let students = [...scopedStudents];
    let teachers = [...scopedTeachers];

    if (regionFilter) {
      students = students.filter(s => s.region === regionFilter);
      teachers = teachers.filter(t => t.region === regionFilter);
    }
    if (statusFilter) {
      students = students.filter(s => s.status === statusFilter);
    }
    if (trackFilter) {
      students = students.filter(s => (s.learningTrack || "memorize") === trackFilter);
    }

    const today = new Date().toLocaleDateString("ar-SA");

    let html = "";

    if (reportType === "students") {
      // إحصائيات سريعة للترويسة
      const totalStudents = students.length;
      const completedCount = students.filter(s => s.status === "completed" || s.mastery >= 95).length;
      const memOnly = students.filter(s => s.learningTrack === "memorize");
      const tafOnly = students.filter(s => s.learningTrack === "tafseer");
      const bothTrack = students.filter(s => s.learningTrack === "both");

      const rows = totalStudents === 0
        ? `<tr><td colspan="12" style="text-align:center;padding:2.5rem;color:var(--color-on-surface-variant);">لا توجد بيانات مطابقة لخيارات التقرير المحددة</td></tr>`
        : students.map((s, i) => {
            const teacher   = db.getTeacherById(s.teacherId);
            const statusObj = APP_CONFIG.studentStatuses.find(st => st.id === s.status) || { label: s.status };
            
            const track = s.learningTrack || 'memorize';
            const trackLabels = {
              'memorize': '<span style="background:rgba(81,100,71,0.12);color:#2e4f3a;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:700;">حفظ فقط</span>',
              'tafseer':  '<span style="background:rgba(187,163,108,0.2);color:#735c00;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:700;">تفسير وغريب</span>',
              'both':     '<span style="background:rgba(81,100,71,0.22);color:#1e3325;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:700;">حفظ وتفسير</span>'
            };

            const mistakes = Array.isArray(s.mistakeWordIds) ? s.mistakeWordIds.length : (s.errorsCount || 0);
            const memScore = db.calculateStudentMastery(s.mistakeWordIds || []);

            const tErrors = Array.isArray(s.mistakeAyahTafseerNos) ? s.mistakeAyahTafseerNos.length : 0;
            const gErrors = Array.isArray(s.mistakeGhareebIds) ? s.mistakeGhareebIds.length : 0;
            const tafScore = db.calculateTafseerMastery(s.mistakeAyahTafseerNos || [], s.mistakeGhareebIds || []);

            const memErrorsText = (track === 'tafseer') ? '<span style="color:#999;">—</span>' : `<span style="font-family:monospace;color:${mistakes > 0 ? '#ba1a1a' : '#2e7d32'};font-weight:700;">${mistakes}</span>/29`;
            const memScoreText  = (track === 'tafseer') ? '<span style="color:#999;">—</span>' : `<span style="font-weight:700;">${memScore}%</span>`;

            const tafAyahText   = (track === 'memorize') ? '<span style="color:#999;">—</span>' : `<span style="font-family:monospace;color:${tErrors > 0 ? '#ba1a1a' : '#2e7d32'};">${tErrors}</span>/7`;
            const tafGhareebText= (track === 'memorize') ? '<span style="color:#999;">—</span>' : `<span style="font-family:monospace;color:${gErrors > 0 ? '#ba1a1a' : '#2e7d32'};">${gErrors}</span>/11`;
            const tafScoreText  = (track === 'memorize') ? '<span style="color:#999;">—</span>' : `<span style="font-weight:700;color:#735c00;">${tafScore}%</span>`;

            return `
              <tr style="border-bottom:1px solid #e2ded7;">
                <td style="padding:7px 8px;font-family:monospace;color:#666;">${i + 1}</td>
                <td style="padding:7px 8px;font-weight:700;color:#1e3325;">${s.name}</td>
                <td style="padding:7px 8px;color:#555;">${s.region}</td>
                <td style="padding:7px 8px;">${teacher ? teacher.name : "—"}</td>
                <td style="padding:7px 8px;text-align:center;">${trackLabels[track]}</td>
                <td style="padding:7px 8px;text-align:center;">${memErrorsText}</td>
                <td style="padding:7px 8px;text-align:center;">${memScoreText}</td>
                <td style="padding:7px 8px;text-align:center;">${tafAyahText}</td>
                <td style="padding:7px 8px;text-align:center;">${tafGhareebText}</td>
                <td style="padding:7px 8px;text-align:center;">${tafScoreText}</td>
                <td style="padding:7px 8px;text-align:center;font-weight:900;color:#2e4f3a;font-size:0.95rem;">${s.mastery}%</td>
                <td style="padding:7px 8px;text-align:center;"><span class="badge ${s.mastery >= 95 ? 'badge-primary' : 'badge-ghost'}" style="font-size:0.75rem;">${statusObj.label}</span></td>
              </tr>`;
          }).join("");

      html = `
        <div id="pdf-report-content" style="padding:1.25rem;background:#fff;color:#1b1c19;direction:rtl;font-family:'Cairo',sans-serif;">
          <!-- رأس التقرير الرسمي -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:2px solid #516447;">
            <div>
              <div style="font-weight:900;font-size:1.25rem;color:#2e4f3a;">مبادرة بلّغوا عني ولو آية • تقرير إنجاز المتعلمات الشامل</div>
              <div style="font-size:0.85rem;color:#5f635a;margin-top:0.35rem;">
                تاريخ الاستخراج: <strong>${today}</strong> | إجمالي المتعلمات بالتقرير: <strong>${totalStudents}</strong> | المتقنات: <strong>${completedCount}</strong>
              </div>
            </div>
            <div style="display:flex;gap:0.75rem;font-size:0.8rem;text-align:center;">
              <div style="background:#f4f6f3;padding:0.4rem 0.8rem;border-radius:8px;border:1px solid #dcdad3;">
                <div style="font-size:0.7rem;color:#666;">حفظ فقط</div>
                <div style="font-weight:800;color:#2e4f3a;">${memOnly.length}</div>
              </div>
              <div style="background:#f4f6f3;padding:0.4rem 0.8rem;border-radius:8px;border:1px solid #dcdad3;">
                <div style="font-size:0.7rem;color:#666;">تفسير فقط</div>
                <div style="font-weight:800;color:#735c00;">${tafOnly.length}</div>
              </div>
              <div style="background:#f4f6f3;padding:0.4rem 0.8rem;border-radius:8px;border:1px solid #dcdad3;">
                <div style="font-size:0.7rem;color:#666;">حفظ وتفسير</div>
                <div style="font-weight:800;color:#1e3325;">${bothTrack.length}</div>
              </div>
            </div>
          </div>

          <!-- جدول البيانات الشامل المتكامل -->
          <div class="table-wrap" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
              <thead>
                <tr style="background:#f2efe9;border-bottom:2px solid #516447;color:#2e4f3a;">
                  <th style="padding:9px 8px;text-align:right;">#</th>
                  <th style="padding:9px 8px;text-align:right;">المتعلمة</th>
                  <th style="padding:9px 8px;text-align:right;">المكتب</th>
                  <th style="padding:9px 8px;text-align:right;">المبلّغة</th>
                  <th style="padding:9px 8px;text-align:center;">مسار التعلم</th>
                  <th style="padding:9px 8px;text-align:center;background:#e9f0e8;" title="أخطاء كلمات سورة الفاتحة من 29 كلمة">أخطاء الحفظ</th>
                  <th style="padding:9px 8px;text-align:center;background:#e9f0e8;">إتقان الحفظ</th>
                  <th style="padding:9px 8px;text-align:center;background:#f5f0e6;" title="أخطاء فهم معاني الآيات من 7 آيات">أخطاء التفسير</th>
                  <th style="padding:9px 8px;text-align:center;background:#f5f0e6;" title="أخطاء معاني غريب المفردات من 11 كلمة">أخطاء الغريب</th>
                  <th style="padding:9px 8px;text-align:center;background:#f5f0e6;">إتقان التفسير</th>
                  <th style="padding:9px 8px;text-align:center;background:#dce6dc;font-weight:800;">الإتقان العام</th>
                  <th style="padding:9px 8px;text-align:center;">الحالة</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div style="font-size:0.75rem;color:#777;margin-top:1rem;display:flex;justify-content:space-between;">
            <span>* منظومة إتقان وتدبر سورة الفاتحة: حفظ الكلمات الـ 29، تدبر 7 آيات، ومعاني 11 مفردة غريبة.</span>
            <span>الصفحة 1 من 1</span>
          </div>
        </div>`;
    } else if (reportType === "teachers") {
      const rows = teachers.length === 0
        ? `<tr><td colspan="8" style="text-align:center;padding:2.5rem;color:var(--color-on-surface-variant);">لا توجد مبلّغات مسجلات</td></tr>`
        : teachers.map((t, i) => {
            const stats = TeachersModule.getTeacherStats(t.id);
            const spec  = APP_CONFIG.specializations.find(sp => sp.id === t.specialization) || { label: "كلاهما" };
            return `
              <tr style="border-bottom:1px solid #e2ded7;">
                <td style="padding:8px;font-family:monospace;color:#666;">${i + 1}</td>
                <td style="padding:8px;font-weight:700;color:#1e3325;">${t.name}</td>
                <td style="padding:8px;color:#555;">${t.region}</td>
                <td style="padding:8px;">${spec.label}</td>
                <td style="padding:8px;text-align:center;font-family:monospace;font-weight:700;">${stats.totalStudents}</td>
                <td style="padding:8px;text-align:center;font-weight:700;color:#2e7d32;">${stats.completedStudents}</td>
                <td style="padding:8px;text-align:center;font-weight:700;color:#2e4f3a;">${stats.avgMastery}%</td>
                <td style="padding:8px;text-align:center;font-weight:700;font-family:monospace;color:#735c00;">${stats.score}</td>
              </tr>`;
          }).join("");

      html = `
        <div id="pdf-report-content" style="padding:1.25rem;background:#fff;color:#1b1c19;direction:rtl;font-family:'Cairo',sans-serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;padding-bottom:1rem;border-bottom:2px solid #516447;">
            <div>
              <div style="font-weight:900;font-size:1.25rem;color:#2e4f3a;">مبادرة بلّغوا عني ولو آية • تقرير أداء المبلّغات</div>
              <div style="font-size:0.85rem;color:#5f635a;margin-top:0.35rem;">تاريخ الاستخراج: <strong>${today}</strong> | إجمالي المبلّغات: <strong>${teachers.length}</strong></div>
            </div>
            <div style="font-size:0.8rem;text-align:left;color:#5f635a;background:#f4f6f3;padding:0.4rem 0.8rem;border-radius:8px;border:1px solid #dcdad3;">
              متابعة حلقات التحفيظ والتدبر
            </div>
          </div>
          <div class="table-wrap" style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
              <thead>
                <tr style="background:#f2efe9;border-bottom:2px solid #516447;color:#2e4f3a;">
                  <th style="padding:9px 8px;text-align:right;">#</th>
                  <th style="padding:9px 8px;text-align:right;">المبلّغة</th>
                  <th style="padding:9px 8px;text-align:right;">المكتب</th>
                  <th style="padding:9px 8px;text-align:right;">التخصص</th>
                  <th style="padding:9px 8px;text-align:center;">إجمالي المتعلمات</th>
                  <th style="padding:9px 8px;text-align:center;">المتقنات</th>
                  <th style="padding:9px 8px;text-align:center;">متوسط الإتقان</th>
                  <th style="padding:9px 8px;text-align:center;">نقاط التميز</th>
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

    const reportType = document.getElementById("report-type-select")?.value || "students";
    const regionFilter = document.getElementById("report-region-select")?.value  || "";
    const statusFilter = document.getElementById("report-status-select")?.value  || "";
    const trackFilter  = document.getElementById("report-track-select")?.value   || "";

    const { students: scopedStudents, teachers: scopedTeachers } = this.getScopedData();

    if (reportType === "teachers") {
      let teachers = [...scopedTeachers];
      if (regionFilter) teachers = teachers.filter(t => t.region === regionFilter);

      if (teachers.length === 0) {
        AppUI.showToast("لا توجد بيانات مبلّغات للتصدير", "warning");
        return;
      }

      const rows = teachers.map((t, i) => {
        const stats = TeachersModule.getTeacherStats(t.id);
        const spec  = APP_CONFIG.specializations.find(sp => sp.id === t.specialization) || { label: "كلاهما" };
        return {
          "الرقم":             i + 1,
          "اسم المبلّغة":      t.name,
          "رقم الهاتف":       t.phone || "",
          "المكتب":           t.region,
          "التخصص":           spec.label,
          "إجمالي المتعلمات": stats.totalStudents,
          "المتقنات":         stats.completedStudents,
          "متوسط الإتقان":    `${stats.avgMastery}%`,
          "نقاط التميز":      stats.score
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      if (!ws["!views"]) ws["!views"] = [];
      ws["!views"].push({ RTL: true });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "تقرير أداء المبلّغات");
      XLSX.writeFile(wb, `تقرير_أداء_المبلّغات_${new Date().toISOString().split("T")[0]}.xlsx`);
      AppUI.showToast("تم تصدير تقرير المبلّغات إلى Excel بنجاح", "success");
      return;
    }

    let students = [...scopedStudents];
    if (regionFilter) students = students.filter(s => s.region === regionFilter);
    if (statusFilter) students = students.filter(s => s.status === statusFilter);
    if (trackFilter)  students = students.filter(s => (s.learningTrack || "memorize") === trackFilter);

    if (students.length === 0) {
      AppUI.showToast("لا توجد بيانات متعلمات للتصدير حالياً", "warning");
      return;
    }

    const trackNameMap = {
      'memorize': 'مسار حفظ وتجويد فقط',
      'tafseer':  'مسار فهم وتفسير وغريب فقط',
      'both':     'المسار الشامل (حفظ وتفسير)'
    };

    const rows = students.map((s, i) => {
      const teacher   = db.getTeacherById(s.teacherId);
      const statusObj = APP_CONFIG.studentStatuses.find(st => st.id === s.status) || { label: s.status };
      const track     = s.learningTrack || 'memorize';

      const mistakes = Array.isArray(s.mistakeWordIds) ? s.mistakeWordIds.length : (s.errorsCount || 0);
      const memScore = db.calculateStudentMastery(s.mistakeWordIds || []);

      const tErrors = Array.isArray(s.mistakeAyahTafseerNos) ? s.mistakeAyahTafseerNos.length : 0;
      const gErrors = Array.isArray(s.mistakeGhareebIds) ? s.mistakeGhareebIds.length : 0;
      const tafScore = db.calculateTafseerMastery(s.mistakeAyahTafseerNos || [], s.mistakeGhareebIds || []);

      return {
        "الرقم":                    i + 1,
        "اسم المتعلمة":             s.name,
        "رقم الهاتف":              s.phone || "",
        "المكتب":                   s.region,
        "المبلّغة المشرفة":         teacher ? teacher.name : "غير محددة",
        "اللغة":                    s.isArabicSpeaker ? "ناطقة بالعربية" : "غير ناطقة",
        "مسار التعلم":              trackNameMap[track] || track,
        "أخطاء الحفظ (من 29)":      (track === 'tafseer') ? "غير مشمول" : `${mistakes} من 29`,
        "نسبة إتقان الحفظ":         (track === 'tafseer') ? "—" : `${memScore}%`,
        "أخطاء تفسير الآيات (من 7)": (track === 'memorize') ? "غير مشمول" : `${tErrors} من 7`,
        "أخطاء غريب المفردات (من 11)": (track === 'memorize') ? "غير مشمول" : `${gErrors} من 11`,
        "نسبة إتقان التفسير والغريب": (track === 'memorize') ? "—" : `${tafScore}%`,
        "نسبة الإتقان العامة":       `${s.mastery}%`,
        "التقدير":                  s.masteryLevel || (s.mastery >= 98 ? "ممتاز مرتفع" : s.mastery >= 90 ? "ممتاز" : "جيد جداً"),
        "الحالة":                   statusObj.label,
        "تاريخ الانضمام":          s.joinedDate || "",
        "آخر متابعة":               s.lastFollowUpDate || ""
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    if (!ws["!views"]) ws["!views"] = [];
    ws["!views"].push({ RTL: true });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "متعلمات الفاتحة (شامل)");
    XLSX.writeFile(wb, `تقرير_متعلمات_الفاتحة_شامل_${new Date().toISOString().split("T")[0]}.xlsx`);
    AppUI.showToast("تم تنزيل ملف Excel الشامل بنجاح", "success");
  },

  /**
   * تصدير التقرير كملف PDF عالي الجودة مع اتصال الحروف العربية
   */
  async exportToPDF() {
    const reportElement = document.getElementById("pdf-report-content") || document.getElementById("report-preview-container");
    if (!reportElement || !reportElement.innerHTML.trim()) {
      AppUI.showToast("يرجى استعراض التقرير أولاً قبل التنزيل", "warning");
      return;
    }

    AppUI.showToast("جاري تجهيز وتنزيل ملف PDF عالي الجودة...", "info");

    const reportType = document.getElementById("report-type-select")?.value || "students";
    const filename = reportType === "teachers"
      ? `تقرير_أداء_المبلّغات_${new Date().toISOString().split("T")[0]}.pdf`
      : `تقرير_إنجاز_المتعلمات_${new Date().toISOString().split("T")[0]}.pdf`;

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // إذا كانت htmlToImage متوفرة، نستخدمها لضمان اتصال الحروف العربية تماماً بدون تفكك
      if (typeof htmlToImage !== "undefined") {
        const jsPdfClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (jsPdfClass) {
          const imgData = await htmlToImage.toJpeg(reportElement, {
            quality: 0.98,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });

          // حساب الأبعاد تلقائياً
          const img = new Image();
          img.src = imgData;
          await new Promise(resolve => { img.onload = resolve; });

          const pdf = new jsPdfClass({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height],
            hotfixes: ['px_scaling']
          });

          pdf.addImage(imgData, 'JPEG', 0, 0, img.width, img.height);
          pdf.save(filename);
          AppUI.showToast("تم تنزيل ملف PDF بنجاح ✓", "success");
          return;
        }
      }

      // الخطة البديلة: html2pdf النظيفة (تم حذف letterRendering لحماية الحروف العربية)
      if (typeof html2pdf !== "undefined") {
        const opt = {
          margin:       [6, 6, 6, 6],
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        await html2pdf().set(opt).from(reportElement).save();
        AppUI.showToast("تم تنزيل ملف PDF بنجاح ✓", "success");
        return;
      }

      // البديل الأخير: الطباعة
      this.printReport();
    } catch (err) {
      console.error("PDF export error:", err);
      AppUI.showToast("حدث تنبيه أثناء التنزيل المباشر، جاري فتح نافذة الطباعة...", "info");
      this.printReport();
    }
  },

  /**
   * طباعة التقرير مباشرة عبر المتصفح
   */
  printReport() {
    document.body.classList.add('printing-report');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-report');
    }, 1000);
  }
};
