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
   * توليد كود HTML لشهادة متعلمة بتصميم نسائي وقفي إسلامي فاخر
   */
  renderCertificateHTML(student, isMulti = false) {
    const teacher = db.getTeacherById(student.teacherId) || { name: "مبلّغة معتمدة" };
    const dateStr = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

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

    return `
      <div class="certificate-page" style="
        width: 1122px;
        height: 720px;
        box-sizing: border-box;
        margin: 0 auto 20px auto;
        padding: 0;
        background: linear-gradient(135deg, #fefcf6 0%, #f5f0e8 50%, #faf7f0 100%);
        font-family: 'Amiri', 'Cairo', 'Arial', sans-serif;
        direction: rtl;
        position: relative;
        overflow: hidden;
        word-break: keep-all;
        word-wrap: normal;
        font-feature-settings: 'liga' 1, 'calt' 1;
        -webkit-font-smoothing: antialiased;
        ${isMulti ? 'page-break-after: always;' : ''}
      ">
        
        <!-- خلفية زخرفية ناعمة -->
        <div style="position:absolute;inset:0;opacity:0.03;pointer-events:none;background-image:radial-gradient(circle at 20% 30%, #2e4f3a 1px, transparent 1px), radial-gradient(circle at 80% 70%, #bba36c 1px, transparent 1px);background-size:60px 60px;"></div>
        
        <!-- إطار ثلاثي أنيق -->
        <div style="position:absolute;inset:18px;border:3px solid #c9a84c;pointer-events:none;"></div>
        <div style="position:absolute;inset:24px;border:1px solid #3a5a3e;pointer-events:none;"></div>
        <div style="position:absolute;inset:28px;border:2px double #c9a84c;pointer-events:none;"></div>
        
        <!-- زخارف ركنية -->
        <div style="position:absolute;top:18px;right:18px;font-size:28px;color:#c9a84c;line-height:1;">❁</div>
        <div style="position:absolute;top:18px;left:18px;font-size:28px;color:#c9a84c;line-height:1;">❁</div>
        <div style="position:absolute;bottom:18px;right:18px;font-size:28px;color:#c9a84c;line-height:1;">❁</div>
        <div style="position:absolute;bottom:18px;left:18px;font-size:28px;color:#c9a84c;line-height:1;">❁</div>

        <!-- المحتوى الرئيسي -->
        <div style="position:relative;z-index:10;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:45px 60px;text-align:center;">
          
          <!-- البسملة -->
          <div style="font-family:'Amiri',serif;font-size:22px;color:#2e4f3a;font-weight:bold;margin-bottom:6px;">
            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
          </div>
          
          <!-- زخرفة فاصلة -->
          <div style="color:#c9a84c;font-size:18px;margin-bottom:10px;letter-spacing:8px;">✦ ❋ ✦</div>
          
          <!-- اسم المبادرة -->
          <div style="font-size:18px;font-weight:700;color:#2e4f3a;font-family:'Cairo','Amiri',sans-serif;margin-bottom:3px;">
            مُبادرة بلِّغوا عنِّي ولو آية
          </div>
          <div style="font-size:11px;color:#5a6e60;font-family:'Cairo',sans-serif;margin-bottom:14px;">
            منظومة إتقان وتدبر كتاب الله تعالى • ${student.region || 'مكتب معتمد'}
          </div>
          
          <!-- عنوان الشهادة -->
          <div style="margin-bottom:14px;">
            <div style="display:inline-block;background:linear-gradient(90deg,#2e4f3a,#3e6b4f,#2e4f3a);color:#fff;padding:8px 50px;border-radius:30px;font-size:22px;font-weight:bold;font-family:'Amiri',serif;">
              شهادة إتقان وتميّز
            </div>
          </div>
          
          <!-- المقدمة -->
          <div style="font-size:16px;color:#445247;line-height:1.5;margin-bottom:8px;font-family:'Amiri',serif;">
            تسرّ إدارة المبادرة أن تمنح هذه الشهادة للمتعلمة المباركة
          </div>
          
          <!-- اسم المتعلمة -->
          <div style="margin-bottom:10px;">
            <div style="display:inline-block;border-bottom:2px solid #c9a84c;padding:0 35px 8px;">
              <div style="font-family:'Amiri',serif;font-size:32px;font-weight:bold;color:#1e3325;">${student.name}</div>
            </div>
          </div>
          
          <!-- وصف الإنجاز -->
          <div style="font-size:15px;color:#3b4d40;line-height:1.7;max-width:650px;margin:0 auto 12px;font-family:'Amiri',serif;">
            نظير اجتيازها متطلبات
            <strong style="color:#2e4f3a;"> ${trackLabel}</strong>
            بنسبة إتقان <strong style="color:#c9a84c;font-size:18px;">${student.mastery}%</strong> 
            وتقدير <strong style="color:#c9a84c;">${masteryLevel}</strong>
            <br/>
            تحت إشراف المبلّغة الفاضلة: <strong style="color:#2e4f3a;">${teacher.name}</strong>
          </div>
          
          <!-- آية -->
          <div style="font-family:'Amiri',serif;font-size:17px;color:#2e4f3a;margin-bottom:4px;">
            ﴿ وَقُل رَّبِّ زِدۡنِي عِلۡمٗا ﴾
          </div>
          
          <!-- دعاء -->
          <div style="font-size:12px;color:#6b7f70;line-height:1.5;font-family:'Cairo',sans-serif;margin-bottom:18px;">
            نسأل الله أن يجعل القرآن ربيع قلبها ونور صدرها
          </div>
          
          <!-- التوقيعات -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;width:100%;padding:0 30px;font-family:'Cairo',sans-serif;">
            <div style="text-align:center;width:160px;">
              <div style="font-size:11px;color:#6b7f70;margin-bottom:4px;">المبلّغة المشرفة</div>
              <div style="font-weight:700;color:#2e4f3a;font-size:13px;margin-bottom:6px;">${teacher.name}</div>
              <div style="border-top:1px solid #c9a84c;"></div>
            </div>
            
            <div style="text-align:center; width: 65px;">
              <!-- تمت إزالة الدائرة والنجمة حسب الطلب -->
            </div>
            
            <div style="text-align:center;width:160px;">
              <div style="font-size:11px;color:#6b7f70;margin-bottom:4px;">إدارة المبادرة</div>
              <div style="font-weight:700;color:#2e4f3a;font-size:13px;margin-bottom:6px;">المشرف العام</div>
              <div style="border-top:1px solid #c9a84c;"></div>
              <div style="font-size:10px;color:#888;margin-top:4px;">${dateStr}</div>
            </div>
          </div>
          
        </div>
      </div>
    `;
  },

  /**
   * تنزيل الشهادة المعروضة مباشرة كملف صورة عالية الدقة (PNG) خالية تماماً من أي تقسيم صفحات
   * باستخدام مكتبة html-to-image المعتمدة رسمياً
   */
  async downloadCurrentImage(filename = "شهادة_إتقان_الفاتحة.png") {
    const area = document.getElementById("certificate-preview-area");
    if (!area) return;

    const page = area.querySelector(".certificate-page");
    if (!page) {
      AppUI.showToast("لا توجد شهادة للتنزيل", "warning");
      return;
    }

    AppUI.showToast("جاري تجهيز الشهادة كصورة عالية الدقة...", "info");

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      if (typeof htmlToImage !== "undefined") {
        const dataUrl = await htmlToImage.toPng(page, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#fefcf6',
          style: {
            margin: '0',
            boxShadow: 'none'
          }
        });

        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        AppUI.showToast("تم تنزيل الشهادة كصورة بنجاح ✓", "success");
        return;
      }

      AppUI.showToast("تعذر تحميل محرك الصور، جاري التنزيل كـ PDF...", "warning");
      this.downloadCurrentPDF();
    } catch (err) {
      console.error("Image export error:", err);
      AppUI.showToast("حدث خطأ أثناء تنزيل الصورة، جاري التحويل للطباعة...", "error");
    }
  },

  /**
   * تنزيل الشهادة المعروضة كملف PDF في صفحة واحدة متناسقة تماماً
   */
  async downloadCurrentPDF(filename = "شهادة_إتقان_الفاتحة.pdf") {
    const area = document.getElementById("certificate-preview-area");
    if (!area) return;

    const pages = area.querySelectorAll(".certificate-page");
    if (pages.length === 0) {
      AppUI.showToast("لا توجد شهادة للتنزيل", "warning");
      return;
    }

    AppUI.showToast("جاري تجهيز الشهادة بصيغة PDF صفحة واحدة...", "info");

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // الطريقة المعتمدة الأولى: htmlToImage مع jsPDF بحجم الصفحة الفعلي بدقة 100%
      if (typeof htmlToImage !== "undefined") {
        const jsPdfClass = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
        if (jsPdfClass) {
          const firstPage = pages[0];
          const width = firstPage.offsetWidth || 1122;
          const height = firstPage.offsetHeight || 720;

          const pdf = new jsPdfClass({
            orientation: 'landscape',
            unit: 'px',
            format: [width, height],
            hotfixes: ['px_scaling']
          });

          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const dataUrl = await htmlToImage.toPng(page, {
              quality: 1.0,
              pixelRatio: 2,
              backgroundColor: '#fefcf6',
              style: {
                margin: '0',
                boxShadow: 'none'
              }
            });

            if (i > 0) {
              pdf.addPage([width, height], 'landscape');
            }
            pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST');
          }

          pdf.save(filename);
          AppUI.showToast("تم تنزيل الشهادة بنجاح ✓", "success");
          return;
        }
      }

      // البديل: html2pdf لعنصر الشهادة فقط بدون هوامش
      if (typeof html2pdf !== "undefined") {
        const targetElement = pages.length === 1 ? pages[0] : area;
        const opt = {
          margin:       0,
          filename:     filename,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#fefcf6', scrollY: 0 },
          jsPDF:        { unit: 'px', format: [1122, 720], orientation: 'landscape' },
          pagebreak:    { mode: 'avoid-all' }
        };
        await html2pdf().set(opt).from(targetElement).save();
        AppUI.showToast("تم تنزيل الشهادة بنجاح ✓", "success");
        return;
      }

      // البديل الأخير
      window.print();
    } catch (err) {
      console.error("PDF generation error:", err);
      AppUI.showToast("حدث تنبيه أثناء التنزيل، جاري فتح نافذة الطباعة...", "warning");
      window.print();
    }
  },

  /**
   * طباعة الشهادة مباشرة من المتصفح بأعلى دقة متجهة
   */
  printCertificate() {
    document.body.classList.add('printing-certificate');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-certificate');
    }, 1000);
  },

  /**
   * فتح نافذة التصدير المجمّع لشهادات أكثر من متعلمة في ملف واحد
   */
  openBatchExportModal() {
    const modal = document.getElementById("batch-certificates-modal");
    if (!modal) return;

    this.selectedStudentIds.clear();

    const currentUser = auth.getCurrentUser();
    let eligibleStudents = db.getStudents().filter(s => s.mastery >= 85 || s.status === "completed" || s.promotedToTeacherId);

    // تصفية حسب الصلاحية
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
   * توليد كافة الشهادات المحددة وعرضها - التنزيل عند ضغط المستخدم فقط
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
