# Product Requirements Document (PRD) & Test Specification
## Project: Al-Fatiha Tracking System (بلغوا عني ولو آية)

### 1. Overview & Live URL
- **Application Name**: بلغوا عني ولو آية (Al-Fatiha Tracking Platform)
- **Live URL**: `https://akram-akl.github.io/al-fatiha-tracking/`
- **Description**: A comprehensive Quranic tracking and evaluation web application dedicated to mastering Surah Al-Fatiha recitation, memorization, and tafseer for women's Quran circles.

---

### 2. User Roles & Test Credentials

Please use the following exact test credentials to test all role flows:

| Role | Identifier / Phone | Password / Code | Capabilities & Access |
| :--- | :--- | :--- | :--- |
| **Admin (المشرف العام)** | N/A (Admin Code login) | `112234` | Full access to all teachers, all students, all geographic offices, invite links generator, and backup tools. |
| **Teacher (المبلّغة)** | `0565933458` | `123456` | Manages only her assigned students, registers new learners, updates recitation/tafseer mistakes, promotes learners to teachers, exports batch certificates. |
| **Student (المتعلمة)** | `0542706313` | `123456` | Views personal learning progress, mastery percentage, learning track details, and earned certificate. |

---

### 3. Core Features & Testing Scenarios

#### Feature 1: Authentication & Role-Based Access Control (RBAC)
- **Admin Login**: Click on Login modal, select Admin, enter `112234`. Should unlock all administrative tabs.
- **Teacher Login**: Enter phone `0565933458` and code `123456`. Should display only students under this teacher.
- **Student Login**: Enter phone `0542706313` and password `123456`.
- **Negative Tests**: Entering incorrect phone numbers or passwords must show appropriate error toast messages and deny access.
- **Session Logout**: Logging out clears stored session state and reverts UI to guest/logged-out state.

#### Feature 2: Data Isolation & Permissions
- A logged-in Teacher (`0565933458`) must **NEVER** see students or data belonging to other teachers.
- Regional student exploration buttons in Geographic view must be visible only to the Admin (`112234`).

#### Feature 3: Student Management & Evaluation
- **Add Student**: Required fields include Student Name, Phone, Teacher, Region, and Learning Track.
- **Default Status**: Newly added students must default to `في مرحلة الحفظ والتكرار` (In Progress).
- **Mastery Calculation**:
  - **Memorization Track (حفظ وتكرار)**: 29 words total. 0 errors = 100%. Each error deducts proportionally.
  - **Tafseer Track (تفسير وغريب الكلمات)**: 18 items total (7 verses + 11 vocabulary items).
  - **Combined Track (كلاهما)**: Average of recitation mastery and tafseer mastery.
  - **Automatic Completion**: When mastery reaches 95% or higher, status automatically transitions to `completed` (أتمت الإتقان).
- **Edit Student**: Updating mistakes and notes must persist without errors.

#### Feature 4: Student Promotion (ترقية المتعلمة لمبلّغة)
- Students with high mastery can be promoted to become independent teachers.
- The promoted teacher inherits the student's phone and password, and is linked to her former teacher as a supervisor.

#### Feature 5: Digital Certificates Engine (إصدار الشهادات)
- **Eligibility**: Students with mastery >= 85% or completed status qualify for certificates.
- **Single Certificate Preview & Download**: Opens high-resolution certificate modal (landscape 1122px x 720px) with custom styling and downloads via PDF button.
- **Batch Export**: Multiple qualifying students can be selected simultaneously and exported together.

#### Feature 6: Geographic Distribution (المكاتب المعتمدة)
- Regional organization into four authorized offices:
  - مكتب الشرق (East Office)
  - مكتب الشمال (North Office)
  - مكتب الجنوب (South Office)
  - مكتب الوسط (Central Office)
- Accurate aggregation of teacher count, student count, and average mastery per office.
