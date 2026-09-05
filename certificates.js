/**
 * محرك ونظام إصدار الشهادات الرقمية النسائية الاحترافية
 * منظومة "بلغوا عني ولو آية" لإتقان وتدبر سورة الفاتحة
 */

const CertificatesModule = {

  selectedStudentIds: new Set(),

  /**
   * فتح نافذة معاينة وطباعة شهادة لمتعلمة معينة
   */
  openCertificateModal(studentId) {
    if (!studentId && typeof StudentsModule !== 'undefined') {
      studentId = StudentsModule.currentProfileId;
    }
    const student = db.getStudentById(studentId);
    if (!student) {
      AppUI.showToast("لم يتم العثور على بيانات المتعلمة", "error");
      return;
    }

    const modal = document.getElementById("certificate-modal");
    const container = document.getElementById("certificate-preview-area");
    if (!modal || !container) return;

    container.innerHTML = this.renderCertificateHTML(student);
    modal.classList.remove("hidden");
  },

  closeModal() {
    const modal = document.getElementById("certificate-modal");
    if (modal) modal.classList.add("hidden");
  },

  /**
   * توليد كود HTML لشهادة متعلمة — تصميم A4 أفقي متناسق بصفحة واحدة
   */
  renderCertificateHTML(student, isMulti = false) {
    const teacher = db.getTeacherById(student.teacherId) || { name: 'مبلّغة معتمدة' };
    const dateStr = new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

    let trackLabel = "إتقان وتدبر سورة الفاتحة";
    if (student.learningTrack === "memorize") {
      trackLabel = "حفظ وتجويد سورة الفاتحة";
    } else if (student.learningTrack === "tafseer") {
      trackLabel = "فهم وتدبر وتفسير سورة الفاتحة";
    } else if (student.learningTrack === "both") {
      trackLabel = "حفظ وتجويد وتفسير سورة الفاتحة كاملة";
    }

    const masteryLevel = student.mastery >= 98 ? "ممتاز مرتفع مع مرتبة الشرف"
      : student.mastery >= 90 ? "ممتاز بإتقان تام"
      : "جيد جداً مرتفع";

    // A4 landscape: 1122 x 720px — تخطيط ثابت لمنع كسر النصوص
    return `
      <div class="certificate-page" id="cert-render-${student.id || 'single'}" style="
        width: 1122px;
        height: 720px;
        min-height: 720px;
        max-height: 720px;
        box-sizing: border-box;
        margin: 0 auto;
        padding: 0;
        overflow: hidden;
        background: linear-gradient(160deg, #1a3328 0%, #2e5440 40%, #1e3d2f 70%, #152a21 100%);
        font-family: 'Amiri', 'Cairo', 'Arial', sans-serif;
        direction: rtl;
        position: relative;
        font-feature-settings: 'liga' 1, 'calt' 1;
        -webkit-font-smoothing: antialiased;
        ${isMulti ? 'page-break-after: always; break-after: page;' : ''}
      ">

        <!-- زخارف الخلفية -->
        <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">
          <div style="position:absolute;right:-80px;top:-80px;width:400px;height:400px;border-radius:50%;border:2px solid rgba(201,168,76,0.12);"></div>
          <div style="position:absolute;left:-80px;bottom:-80px;width:400px;height:400px;border-radius:50%;border:2px solid rgba(201,168,76,0.12);"></div>
          <div style="position:absolute;right:-50px;top:-50px;width:320px;height:320px;border-radius:50%;border:1px solid rgba(201,168,76,0.08);"></div>
        </div>

        <!-- شرائط ذهبية جانبية -->
        <div style="position:absolute;right:0;top:0;bottom:0;width:8px;background:linear-gradient(180deg,#c9a84c,#f0d080,#c9a84c,#a07828,#c9a84c);"></div>
        <div style="position:absolute;left:0;top:0;bottom:0;width:8px;background:linear-gradient(180deg,#c9a84c,#f0d080,#c9a84c,#a07828,#c9a84c);"></div>

        <!-- إطار داخلي -->
        <div style="position:absolute;inset:20px;border:1px solid rgba(201,168,76,0.4);pointer-events:none;"></div>
        <div style="position:absolute;inset:27px;border:1px solid rgba(201,168,76,0.18);pointer-events:none;"></div>

        <!-- زوايا ذهبية -->
        <div style="position:absolute;top:13px;right:13px;font-size:20px;color:#c9a84c;line-height:1;">✦</div>
        <div style="position:absolute;top:13px;left:13px;font-size:20px;color:#c9a84c;line-height:1;">✦</div>
        <div style="position:absolute;bottom:13px;right:13px;font-size:20px;color:#c9a84c;line-height:1;">✦</div>
        <div style="position:absolute;bottom:13px;left:13px;font-size:20px;color:#c9a84c;line-height:1;">✦</div>

        <!-- ============ المحتوى بتخطيط عمودي مضبوط ============ -->
        <div style="
          position: absolute;
          inset: 35px 50px 35px 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
        ">

          <!-- البسملة -->
          <div style="
            font-family: 'Amiri', serif;
            font-size: 19px;
            color: #f0d080;
            font-weight: bold;
            white-space: nowrap;
            margin-bottom: 4px;
            text-shadow: 0 1px 8px rgba(0,0,0,0.4);
          ">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>

          <!-- فاصل -->
          <div style="color:#c9a84c;font-size:12px;letter-spacing:10px;margin-bottom:6px;white-space:nowrap;">── ✦ ──</div>

          <!-- اسم المبادرة -->
          <div style="
            font-size: 15px;
            font-weight: 700;
            color: #f0d080;
            font-family: 'Cairo', sans-serif;
            white-space: nowrap;
            margin-bottom: 2px;
          ">مُبادرة بلِّغوا عنِّي ولو آية</div>

          <!-- المنطقة -->
          <div style="
            font-size: 10px;
            color: rgba(240,208,128,0.6);
            font-family: 'Cairo', sans-serif;
            white-space: nowrap;
            margin-bottom: 16px;
          ">منظومة إتقان وتدبر كتاب الله تعالى &nbsp;•&nbsp; ${student.region || 'مكتب معتمد'}</div>

          <!-- لوحة عنوان الشهادة —  white-space:nowrap يمنع الانكسار -->
          <div style="
            background: rgba(201,168,76,0.18);
            border: 1px solid rgba(201,168,76,0.5);
            border-radius: 4px;
            padding: 9px 70px;
            margin-bottom: 14px;
            white-space: nowrap;
          ">
            <span style="
              font-family: 'Amiri', serif;
              font-size: 26px;
              font-weight: bold;
              color: #f5e8b0;
              letter-spacing: 2px;
              white-space: nowrap;
            ">شهادة إتقان وتميّز</span>
          </div>

          <!-- نص المقدمة —  nowrap يمنع التكسر -->
          <div style="
            font-family: 'Amiri', serif;
            font-size: 14px;
            color: rgba(255,255,255,0.82);
            white-space: nowrap;
            margin-bottom: 8px;
          ">تُسرّ إدارة المبادرة أن تمنح هذه الشهادة للمتعلمة المباركة</div>

          <!-- اسم المتعلمة -->
          <div style="margin-bottom: 14px;">
            <div style="
              font-family: 'Amiri', serif;
              font-size: 40px;
              font-weight: bold;
              color: #ffffff;
              white-space: nowrap;
              text-shadow: 0 2px 16px rgba(0,0,0,0.6);
            ">${student.name}</div>
            <div style="height:2px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);margin-top:4px;"></div>
          </div>

          <!-- وصف الإنجاز -->
          <div style="
            font-family: 'Amiri', serif;
            font-size: 14px;
            color: rgba(255,255,255,0.85);
            line-height: 1.9;
            margin-bottom: 10px;
          ">
            <span style="white-space:nowrap;">نظير اجتيازها متطلبات </span>
            <span style="color:#f0d080;font-weight:bold;white-space:nowrap;">${trackLabel}</span>
            <br>
            <span style="white-space:nowrap;">بنسبة إتقان </span>
            <span style="color:#f0d080;font-size:20px;font-weight:bold;white-space:nowrap;">${student.mastery}%</span>
            <span style="white-space:nowrap;"> &mdash; تقدير </span>
            <span style="color:#f0d080;font-weight:bold;white-space:nowrap;">${masteryLevel}</span>
            <br>
            <span style="font-size:12px;color:rgba(255,255,255,0.6);white-space:nowrap;">بإشراف المبلّغة الفاضلة: </span>
            <span style="font-size:12px;color:#f0d080;white-space:nowrap;">${teacher.name}</span>
          </div>

          <!-- الآية الكريمة —  كتلة واحدة nowrap -->
          <div style="
            font-family: 'Amiri', serif;
            font-size: 16px;
            color: rgba(240,208,128,0.85);
            white-space: nowrap;
            margin-bottom: 0;
          "><span style="unicode-bidi:embed;direction:rtl;">﴿ وَقُل رَّبِّ زِدۡنِي عِلۡمٗا ﴾</span></div>

          <!-- spacer -->
          <div style="flex:1;"></div>

          <!-- قسم التوقيعات —  في أسفل الشهادة -->
          <div style="
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 10px;
          ">
            <!-- المبلغة المشرفة -->
            <div style="text-align:center;min-width:170px;">
              <div style="font-size:10px;color:rgba(240,208,128,0.6);margin-bottom:3px;font-family:'Cairo',sans-serif;white-space:nowrap;">المبلّغة المشرفة</div>
              <div style="font-weight:700;color:#f0d080;font-size:13px;margin-bottom:7px;font-family:'Cairo',sans-serif;white-space:nowrap;">${teacher.name}</div>
              <div style="height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);"></div>
            </div>

            <!-- الدعاء الوسط -->
            <div style="text-align:center;flex:1;padding:0 15px;">
              <div style="font-size:10px;color:rgba(255,255,255,0.4);font-family:'Cairo',sans-serif;">نسأل الله أن يجعل القرآن ربيع قلبها ونور صدرها</div>
            </div>

            <!-- إدارة المبادرة -->
            <div style="text-align:center;min-width:170px;">
              <div style="font-size:10px;color:rgba(240,208,128,0.6);margin-bottom:3px;font-family:'Cairo',sans-serif;white-space:nowrap;">إدارة المبادرة</div>
              <div style="font-weight:700;color:#f0d080;font-size:13px;margin-bottom:7px;font-family:'Cairo',sans-serif;white-space:nowrap;">المشرف العام</div>
              <div style="height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);"></div>
              <div style="font-size:9px;color:rgba(240,208,128,0.5);margin-top:3px;font-family:'Cairo',sans-serif;">${dateStr}</div>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  /**
   * تنزيل الشهادة كصورة PNG عالية الجودة (2x) — صورة واحدة متناسقة
   */
  async downloadCurrentImage(filename = "شهادة_إتقان_الفاتحة.png") {
    const area = document.getElementById("certificate-preview-area");
    if (!area) return;

    const page = area.querySelector(".certificate-page");
    if (!page) {
      AppUI.showToast("لا توجد شهادة للتنزيل", "warning");
      return;
    }

    AppUI.showToast("جاري تجهيز الصورة...", "info");

    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;

      if (typeof htmlToImage === "undefined") {
        AppUI.showToast("تعذر تحميل محرك الصور", "error");
        return;
      }

      const dataUrl = await htmlToImage.toPng(page, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#1a3328',
        skipFonts: false,
        style: { margin: '0', boxShadow: 'none' }
      });

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      AppUI.showToast("تم تنزيل الشهادة كصورة ✓", "success");
    } catch (err) {
      console.error("Image export error:", err);
      AppUI.showToast("حدث خطأ أثناء تنزيل الصورة", "error");
    }
  },

  /**
   * تنزيل الشهادة كـ PDF — صفحة واحدة مضمونة بحجم الشهادة الفعلي
   * الخطوات: htmlToImage → PNG → jsPDF بنفس الأبعاد بالضبط
   */
  async downloadCurrentPDF(filename = "شهادة_إتقان_الفاتحة.pdf") {
    const area = document.getElementById("certificate-preview-area");
    if (!area) return;

    const pages = area.querySelectorAll(".certificate-page");
    if (pages.length === 0) {
      AppUI.showToast("لا توجد شهادة للتنزيل", "warning");
      return;
    }

    AppUI.showToast("جاري تجهيز ملف PDF...", "info");

    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;

      // تحقق من توفر المكتبات
      const jsPdfClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
      if (typeof htmlToImage === "undefined" || !jsPdfClass) {
        // بديل: html2pdf إن كان متوفراً
        if (typeof html2pdf !== "undefined") {
          const opt = {
            margin: 0,
            filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, backgroundColor: '#1a3328', scrollY: 0 },
            jsPDF: { unit: 'px', format: [1122, 720], orientation: 'landscape' },
            pagebreak: { mode: 'avoid-all' }
          };
          await html2pdf().set(opt).from(pages[0]).save();
          AppUI.showToast("تم تنزيل الشهادة بنجاح ✓", "success");
          return;
        }
        AppUI.showToast("تعذر تحميل مكتبة PDF، جاري الطباعة...", "warning");
        window.print();
        return;
      }

      // الطريقة الأمثل: htmlToImage → jsPDF بأبعاد الشهادة بالضبط (صفحة واحدة فقط)
      const certW = 1122; // px
      const certH = 720;  // px

      const pdf = new jsPdfClass({
        orientation: 'landscape',
        unit: 'px',
        format: [certW, certH],
        hotfixes: ['px_scaling']
      });

      // صفحة واحدة فقط — أول certificate-page
      const firstPage = pages[0];
      const dataUrl = await htmlToImage.toPng(firstPage, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#1a3328',
        style: { margin: '0', boxShadow: 'none' }
      });

      // إضافة الصورة لتملأ الصفحة كاملاً بدون هوامش
      pdf.addImage(dataUrl, 'PNG', 0, 0, certW, certH, undefined, 'FAST');

      // في حالة شهادات متعددة: صفحة منفصلة لكل شهادة
      for (let i = 1; i < pages.length; i++) {
        pdf.addPage([certW, certH], 'landscape');
        const url = await htmlToImage.toPng(pages[i], {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#1a3328',
          style: { margin: '0', boxShadow: 'none' }
        });
        pdf.addImage(url, 'PNG', 0, 0, certW, certH, undefined, 'FAST');
      }

      pdf.save(filename);
      AppUI.showToast("تم تنزيل الشهادة بنجاح ✓", "success");

    } catch (err) {
      console.error("PDF generation error:", err);
      AppUI.showToast("حدث خطأ أثناء إنشاء PDF", "error");
      window.print();
    }
  },

  /**
   * طباعة الشهادة مباشرة
   */
  printCertificate() {
    document.body.classList.add('printing-certificate');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-certificate');
    }, 1000);
  },

  /**
   * فتح نافذة التصدير المجمّع
   */
  openBatchExportModal() {
    const modal = document.getElementById("batch-certificates-modal");
    if (!modal) return;

    this.selectedStudentIds.clear();

    const currentUser = auth.getCurrentUser();
    let eligibleStudents = db.getStudents().filter(s => s.mastery >= 85 || s.status === "completed" || s.promotedToTeacherId);

    if (auth.isTeacher() && !auth.isHeadTeacher() && !auth.isAdmin()) {
      eligibleStudents = eligibleStudents.filter(s => s.teacherId === currentUser.id);
    } else if (auth.isHeadTeacher()) {
      const myTeachers = db.getTeachers().filter(t => t.id === currentUser.id || t.supervisorId === currentUser.id).map(t => t.id);
      eligibleStudents = eligibleStudents.filter(s => myTeachers.includes(s.teacherId));
    }

    const container = document.getElementById("batch-students-list");
    if (!container) return;

    if (eligibleStudents.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:2rem;color:var(--color-on-surface-variant);">
          <span style="font-size:2.5rem;opacity:0.4;">🏅</span>
          <div style="font-weight:bold;margin-top:0.5rem;">لا توجد متعلمات مؤهلات للشهادات حالياً (نسبة 85%+ أو متقنة)</div>
        </div>
      `;
    } else {
      container.innerHTML = eligibleStudents.map(s => {
        const teacher = db.getTeacherById(s.teacherId);
        return `
          <label style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem 1rem;background:var(--color-surface-container);border-radius:0.75rem;cursor:pointer;margin-bottom:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <input type="checkbox" value="${s.id}" onchange="CertificatesModule.toggleBatchSelect('${s.id}')" style="width:1.2rem;height:1.2rem;accent-color:var(--color-primary);" />
              <div>
                <strong style="font-size:0.95rem;">${s.name}</strong>
                <div class="text-xs text-muted">المبلّغة: ${teacher ? teacher.name : 'غير محددة'} • ${s.region}</div>
              </div>
            </div>
            <div style="text-align:left;">
              <span class="badge badge-primary">${s.mastery}%</span>
            </div>
          </label>
        `;
      }).join("");
    }

    modal.classList.remove("hidden");
  },

  closeBatchModal() {
    const modal = document.getElementById("batch-certificates-modal");
    if (modal) modal.classList.add("hidden");
  },

  toggleBatchSelect(id) {
    if (this.selectedStudentIds.has(id)) {
      this.selectedStudentIds.delete(id);
    } else {
      this.selectedStudentIds.add(id);
    }
    const countSpan = document.getElementById("batch-selected-count");
    if (countSpan) countSpan.textContent = this.selectedStudentIds.size;
  },

  selectAllBatch(selectAll = true) {
    const checkboxes = document.querySelectorAll("#batch-students-list input[type='checkbox']");
    checkboxes.forEach(cb => {
      cb.checked = selectAll;
      if (selectAll) this.selectedStudentIds.add(cb.value);
    });
    if (!selectAll) this.selectedStudentIds.clear();
    const countSpan = document.getElementById("batch-selected-count");
    if (countSpan) countSpan.textContent = this.selectedStudentIds.size;
  },

  /**
   * توليد كافة الشهادات المحددة وعرضها
   */
  exportSelectedBatchPDF() {
    if (this.selectedStudentIds.size === 0) {
      AppUI.showToast("يرجى اختيار متعلمة واحدة على الأقل لإصدار شهادتها", "warning");
      return;
    }

    const students = Array.from(this.selectedStudentIds).map(id => db.getStudentById(id)).filter(Boolean);
    if (students.length === 0) return;

    this.closeBatchModal();

    const modal = document.getElementById("certificate-modal");
    const container = document.getElementById("certificate-preview-area");
    if (!modal || !container) return;

    container.innerHTML = students.map(s => this.renderCertificateHTML(s, true)).join("");
    modal.classList.remove("hidden");

    AppUI.showToast(`تم تجهيز ${students.length} شهادة. اضغطي على "تنزيل PDF" للتحميل.`, "success");
  }
};
