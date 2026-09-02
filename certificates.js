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
      <div style="width:297mm; min-height:210mm; margin:auto; padding:0; background:#fffef8; font-family:'Cairo','Amiri',sans-serif; direction:rtl; position:relative; overflow:hidden; ${isMulti ? 'page-break-after:always; margin-bottom:2rem;' : ''}">
        
        <!-- خلفية زخرفية -->
        <div style="position:absolute;inset:0;opacity:0.04;pointer-events:none;background:repeating-linear-gradient(45deg,#516447 0,#516447 1px,transparent 0,transparent 50%);background-size:30px 30px;"></div>
        
        <!-- الإطار الخارجي الذهبي -->
        <div style="position:absolute;inset:8mm;border:3px solid #8B7D3C;border-radius:8px;pointer-events:none;"></div>
        <div style="position:absolute;inset:11mm;border:1.5px solid #B8A95E;border-radius:6px;pointer-events:none;"></div>
        
        <!-- الزوايا الذهبية -->
        <div style="position:absolute;top:10mm;right:10mm;width:35px;height:35px;border-top:4px solid #8B7D3C;border-right:4px solid #8B7D3C;border-radius:0 8px 0 0;"></div>
        <div style="position:absolute;top:10mm;left:10mm;width:35px;height:35px;border-top:4px solid #8B7D3C;border-left:4px solid #8B7D3C;border-radius:8px 0 0 0;"></div>
        <div style="position:absolute;bottom:10mm;right:10mm;width:35px;height:35px;border-bottom:4px solid #8B7D3C;border-right:4px solid #8B7D3C;border-radius:0 0 8px 0;"></div>
        <div style="position:absolute;bottom:10mm;left:10mm;width:35px;height:35px;border-bottom:4px solid #8B7D3C;border-left:4px solid #8B7D3C;border-radius:0 0 0 8px;"></div>
        
        <!-- المحتوى الرئيسي -->
        <div style="position:relative;z-index:1;padding:18mm 25mm;">
          
          <!-- البسملة -->
          <div style="text-align:center;font-family:'Amiri',serif;font-size:1.6rem;color:#516447;margin-bottom:6px;letter-spacing:2px;">
            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
          </div>
          
          <!-- خط فاصل ذهبي مزخرف -->
          <div style="text-align:center;color:#B8A95E;font-size:1.2rem;letter-spacing:8px;margin-bottom:10px;">✦ ❋ ✦</div>
          
          <!-- اسم المبادرة -->
          <div style="text-align:center;margin-bottom:4px;">
            <div style="font-size:1.5rem;font-weight:900;color:#3A4A30;letter-spacing:3px;">مُبَادَرَةُ بَلِّغُوا عَنِّي وَلَوْ آيَة</div>
            <div style="font-size:0.85rem;color:#6B7B5E;margin-top:4px;">منظومة إتقان وتدبر كتاب الله تعالى • ${student.region || 'مكتب معتمد'}</div>
          </div>
          
          <!-- عنوان الشهادة -->
          <div style="text-align:center;margin:18px 0 14px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#516447 0%,#6B8A5E 50%,#516447 100%);color:#fff;padding:10px 50px;border-radius:50px;font-size:1.6rem;font-weight:900;letter-spacing:4px;box-shadow:0 4px 16px rgba(81,100,71,0.3);">
              شَهَادَةُ إِتْقَانٍ وَتَمَيُّز
            </div>
          </div>
          
          <!-- النص التمهيدي -->
          <div style="text-align:center;font-size:1rem;color:#4A5A3E;line-height:2;margin-bottom:8px;">
            تَسُرُّ إدارة المبادرة ومكتب الحلقات النسائية أن تمنح هذه الشهادة للمتعلمة المباركة
          </div>
          
          <!-- اسم المتعلمة -->
          <div style="text-align:center;margin:10px 0 14px;">
            <div style="display:inline-block;position:relative;padding:8px 60px;">
              <div style="font-family:'Amiri',serif;font-size:2.2rem;font-weight:700;color:#2C3E22;letter-spacing:2px;">${student.name}</div>
              <div style="position:absolute;bottom:0;left:15%;right:15%;height:2px;background:linear-gradient(90deg,transparent,#B8A95E,transparent);"></div>
            </div>
          </div>
          
          <!-- تفاصيل الإنجاز -->
          <div style="text-align:center;font-size:1rem;color:#4A5A3E;line-height:2.2;max-width:600px;margin:0 auto 10px;">
            نظير جهودها المباركة واجتيازها بفضل الله تعالى متطلبات
            <strong style="color:#3A4A30;"> ${trackLabel}</strong>
            <br/>
            بنسبة إتقان بلغت 
            <span style="display:inline-block;background:#516447;color:#fff;padding:2px 14px;border-radius:20px;font-weight:900;font-size:1.1rem;margin:0 4px;">${student.mastery}%</span>
            وبتقدير 
            <span style="font-weight:900;color:#8B7D3C;">(${masteryLevel})</span>
            <br/>
            تحت إشراف المبلّغة الفاضلة: <strong style="color:#3A4A30;">${teacher.name}</strong>
          </div>
          
          <!-- الآية -->
          <div style="text-align:center;font-family:'Amiri',serif;font-size:1.4rem;color:#516447;margin:14px 0 6px;letter-spacing:1px;">
            ﴿ وَقُل رَّبِّ زِدۡنِي عِلۡمٗا ﴾
          </div>
          <div style="text-align:center;font-size:0.85rem;color:#7A8B6E;margin-bottom:20px;line-height:1.8;">
            سائلين المولى عز وجل أن يجعل القرآن العظيم ربيع قلبها ونور صدرها، وأن يبارك في جهودها.
          </div>
          
          <!-- خط فاصل -->
          <div style="text-align:center;color:#B8A95E;font-size:0.9rem;letter-spacing:12px;margin-bottom:16px;">✧ ✧ ✧</div>
          
          <!-- التوقيعات -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:30px;">
            
            <!-- المبلّغة المشرفة -->
            <div style="text-align:center;flex:1;">
              <div style="font-size:0.8rem;color:#7A8B6E;margin-bottom:6px;">المبلّغة المشرفة</div>
              <div style="font-weight:700;color:#3A4A30;font-size:0.95rem;margin-bottom:8px;">${teacher.name}</div>
              <div style="width:70%;margin:0 auto;border-top:1.5px dashed #B8A95E;"></div>
            </div>
            
            <!-- الختم المركزي -->
            <div style="text-align:center;flex:0 0 auto;">
              <div style="width:75px;height:75px;border-radius:50%;border:2.5px solid #516447;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto;background:rgba(81,100,71,0.05);">
                <span class="material-symbols-outlined" style="font-size:1.8rem;color:#516447;font-variation-settings:'FILL' 1;">verified</span>
                <div style="font-size:0.5rem;font-weight:900;color:#516447;margin-top:1px;">إتقان معتمد</div>
              </div>
            </div>
            
            <!-- إدارة المبادرة -->
            <div style="text-align:center;flex:1;">
              <div style="font-size:0.8rem;color:#7A8B6E;margin-bottom:6px;">إدارة المبادرة والمكتب</div>
              <div style="font-weight:700;color:#3A4A30;font-size:0.95rem;margin-bottom:8px;">المشرف العام</div>
              <div style="width:70%;margin:0 auto;border-top:1.5px dashed #B8A95E;"></div>
              <div style="font-size:0.7rem;color:#999;margin-top:5px;">تاريخ الإصدار: ${dateStr}</div>
            </div>
          </div>
          
        </div>
      </div>
    `;
  },

  /**
   * تنزيل الشهادة المعروضة مباشرة كملف PDF
   */
  downloadCurrentPDF(filename = "شهادة_إتقان_الفاتحة.pdf") {
    const area = document.getElementById("certificate-preview-area");
    if (!area) return;

    if (typeof html2pdf === "undefined") {
      window.print();
      return;
    }

    AppUI.showToast("جاري تجهيز وتنزيل الشهادة بصيغة PDF عالية الدقة...", "info");

    const opt = {
      margin:       [6, 6, 6, 6],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.99 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(area).save().then(() => {
      AppUI.showToast("تم تنزيل الشهادة بنجاح", "success");
    }).catch(err => {
      console.error(err);
      window.print();
    });
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
          <span class="material-symbols-outlined" style="font-size:2.5rem;opacity:0.4;">workspace_premium</span>
          <div class="mt-2 font-bold">لا توجد متعلمات مؤهلات للشهادات حالياً (نسبة 85%+ أو متقنة)</div>
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
   * توليد وتنزيل كافة الشهادات المحددة في ملف واحد مجمع
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

    AppUI.showToast(`تم تجهيز ${students.length} شهادة. يمكنك الآن تنزيلها معاً في ملف واحد.`, "success");
  }
};
