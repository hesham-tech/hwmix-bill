# HWNix Bill Frontend (واجهة نظام إدارة الفواتير والاشتراكات)

واجهة أمامية متكاملة وقوية مبنية باستخدام تقنيات الويب الحديثة لإدارة الشركات، الفروع، الفواتير، المخزون، والعمليات المالية.

---

## 🚀 التقنيات المستخدمة (Tech Stack)

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **UI Library**: Vuetify 3
- **State Management**: Pinia
- **HTTP Client**: Axios (مع إدارة مركزية للتوكن والصلاحيات وسياق الفروع والشركات)

---

## 🛠️ التشغيل المحلي (Local Setup)

### 1. تثبيت الاعتمادات (Install Dependencies)
```bash
npm install
```

### 2. إعداد متغيرات البيئة (Environment Variables)
قم بإنشاء ملف `.env` في المسار الرئيسي للواجهة بالمتغيرات التالية:
```env
VITE_API_URL=http://127.0.0.1:8000
VITE_APP_NAME="HWNix Bill"
```

### 3. تشغيل خادم التطوير (Run Development Server)
```bash
npm run dev
```

### 4. البناء للإنتاج (Build for Production)
```bash
npm run build
```

---

## 📐 هيكلية طبقة الاتصال (API Architecture & Unification)

تم توحيد خدمات الاتصال بقاعدة البيانات والواجهة الخلفية:
- **axios.config.js** (`src/api/axios.config.js`): هو مركز إرسال الطلبات، حيث يتولى تلقائياً:
  - حقن توثيق Sanctum (`Bearer Token`).
  - حقن الهيدرز الأمنية وسياق الشركة النشطة (`X-Company-Id`) والفرع النشط (`X-Branch-Id`).
  - معالجة وإزالة بادئة `v1/` من الروابط تلقائياً لتوحيد الخدمات القديمة والجديدة.
  - إرفاق مفتاح تكرار الطلبات (`X-Idempotency-Key`) للمعاملات الحساسة لمنع معالجة الحركات المالية المكررة.
- **BaseService** (`src/api/base.service.js`): كلاس أب لجميع كلاسات الخدمات يدير معالجة الاستجابة الموحدة والأخطاء المعربة.
- **api.js** (`src/services/api.js`): دوال مساعدة (Helper functions) لـ: `getAll`, `getOne`, `saveItem`, `deleteOne`, `updateItem`, `deleteAll`, `deleteItem`, `archiveItem`, `restoreItem`.

---

## 🗂️ هيكل المشروع (Project Structure)

```
src/
├── api/
│   ├── axios.config.js     # ⭐ مركز الاتصال الموحد
│   ├── base.service.js     # الكلاس الأب لجميع الخدمات
│   ├── index.js            # نقطة تصدير الـ Services
│   └── services/           # 28+ خدمة موحدة (invoice, product, user...)
├── modules/                # وحدات الميزات (features)
├── stores/                 # Pinia stores (auth, user, branch...)
├── router/                 # Vue Router
├── utils/                  # Utilities (translateErrors, logger...)
└── services/
    └── api.js              # Helper functions (getAll, saveItem...)
```

---

*آخر تحديث: يونيو 2026 — المرحلة 6-7 مكتملة*

