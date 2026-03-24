# 🎮 Skru Score - قاعدة صحاب

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-purple.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**الرفيق الرقمي المثالي لتسجيل نقاط الألعاب والجلسات مع الأصدقاء**

[Live Demo](https://skru-score.vercel.app) • [Features](#-features) • [Screenshots](#-screenshots) • [Installation](#-installation)

</div>

---

## 📖 **About | عن المشروع**

**قاعدة صحاب (Skru Score)** is a modern, beautiful score tracking app designed for card games, board games, and casual gaming sessions with friends. Built with a retro-brutalist aesthetic and smooth animations.

**قاعدة صحاب** تطبيق عصري وجميل لتسجيل نقاط ألعاب الورق والألعاب اللوحية والجلسات مع الأصدقاء. مبني بتصميم brutalist عصري مع حركات سلسة.

---

## ✨ **Features | المميزات**

### 🎯 **Core Features**
- ✅ **2-10 Players Support** - دعم من 2 إلى 10 لاعبين
- ✅ **Dynamic Rounds** - عدد الجولات يساوي عدد اللاعبين
- ✅ **Double Last Round** - ضاعف النقاط في الجولة الأخيرة (اختياري)
- ✅ **Live Score Calculation** - حساب النقاط مباشرة
- ✅ **Leader Indicator** - تاج ذهبي للاعب المتصدر
- ✅ **Undo System** - تراجع عن آخر إجراء (history tracking)
- ✅ **Match History** - سجل المباريات السابقة

### 💾 **Persistence**
- ✅ **Auto-save** - حفظ تلقائي لجميع البيانات
- ✅ **LocalStorage** - لا يضيع التقدم عند تحديث الصفحة
- ✅ **Session Continuity** - استمرار الجلسة حتى بعد الإغلاق

### 🎨 **UI/UX**
- ✅ **Retro-Brutalist Design** - تصميم عصري brutalist
- ✅ **Smooth Animations** - حركات سلسة (Framer Motion)
- ✅ **Fully Responsive** - متجاوب تماماً (mobile-first)
- ✅ **Dark Theme** - ثيم داكن مريح للعين
- ✅ **Custom Fonts** - خطوط مخصصة (Montserrat, Poppins, JetBrains Mono)
- ✅ **Confirm Modals** - تأكيدات للإجراءات الحساسة

### 🕹️ **Gameplay**
- ✅ **Add/Remove Players Mid-Game** - إضافة/إزالة لاعبين أثناء اللعب
- ✅ **Editable Player Names** - تعديل أسماء اللاعبين
- ✅ **Score Multipliers** - مضاعفات النقاط (x2 للجولة الأخيرة)
- ✅ **Winner Detection** - كشف الفائز تلقائياً
- ✅ **New Match** - بدء مباراة جديدة مع نفس اللاعبين

---

## 🎬 **Screenshots | لقطات الشاشة**

### Main Menu | القائمة الرئيسية
<img src="https://via.placeholder.com/800x450/551A8B/FFB300?text=Main+Menu" alt="Main Menu" width="600">

### Game Board | لوحة اللعب
<img src="https://via.placeholder.com/800x450/1A1A1A/FFB300?text=Game+Board" alt="Game Board" width="600">

### Match History | سجل المباريات
<img src="https://via.placeholder.com/800x450/551A8B/FFB300?text=Match+History" alt="Match History" width="600">

---

## 🛠️ **Tech Stack | التقنيات المستخدمة**

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 19, TypeScript 5.8 |
| **Build Tool** | Vite 6.2 |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion (motion) 12.38 |
| **Icons** | Lucide React |
| **Storage** | LocalStorage (persistent) |
| **Deployment** | Vercel |

---

## 🚀 **Installation | التثبيت**

### Prerequisites | المتطلبات
- Node.js 18+ 
- npm or yarn

### Setup | الإعداد

```bash
# 1. Clone the repository | استنساخ المشروع
git clone https://github.com/mohamedatef90/skru-score.git
cd skru-score

# 2. Install dependencies | تثبيت المكتبات
npm install

# 3. Run development server | تشغيل السيرفر
npm run dev

# 4. Open browser | افتح المتصفح
# http://localhost:3000
```

### Build for Production | بناء النسخة النهائية

```bash
npm run build
npm run preview
```

---

## 🎮 **How to Play | كيفية اللعب**

### 1️⃣ **Setup | الإعداد**
1. اختر عدد اللاعبين (2-10)
2. أدخل أسماء اللاعبين
3. فعّل "Double Last Round" إذا كنت تريد مضاعفة الجولة الأخيرة
4. اضغط "INITIALIZE GAME"

### 2️⃣ **During Game | أثناء اللعب**
1. أدخل نقاط كل لاعب في كل جولة
2. النقاط تُحسب تلقائياً
3. التاج يظهر على اللاعب المتصدر (الأقل نقاطاً)
4. يمكنك:
   - **UNDO** - التراجع عن آخر إجراء
   - **ADD PLAYER** - إضافة لاعب جديد
   - **MENU** - العودة للقائمة
   - **NEW MATCH** - بدء مباراة جديدة

### 3️⃣ **End Game | نهاية اللعب**
- اضغط "NEW MATCH" لحفظ النتائج وبدء مباراة جديدة
- سيُحفظ الفائز ونقاط الجميع في سجل المباريات

---

## 🏗️ **Project Structure | بنية المشروع**

```
skru-score/
├── src/
│   ├── hooks/
│   │   └── useLocalStorage.ts   # LocalStorage hook
│   ├── App.tsx                   # Main component
│   ├── types.ts                  # TypeScript types
│   ├── index.css                 # Global styles
│   └── main.tsx                  # Entry point
├── public/
│   └── (static assets)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎨 **Design System | نظام التصميم**

### Colors | الألوان
```css
--color-skru-purple: #551A8B  /* Primary */
--color-skru-gold: #FFB300    /* Accent */
--color-skru-white: #F0F0F0   /* Text */
--color-skru-black: #1A1A1A   /* Background */
--color-skru-red: #D32F2F     /* Danger */
--color-skru-green: #4CAF50   /* Success */
```

### Typography | الخطوط
- **Display:** Montserrat (700, 800, 900)
- **Body:** Poppins (400, 500, 600)
- **Mono:** JetBrains Mono (700)

### Spacing | المسافات
- Grid: 8px base unit
- Borders: 4px brutalist style
- Shadows: 8px 3D effect

---

## 📝 **License | الترخيص**

MIT License - أنت حر في استخدام وتعديل وتوزيع المشروع.

---

## 👨‍💻 **Author | المطور**

**Mohamed Atef (Tifo)**  
- GitHub: [@mohamedatef90](https://github.com/mohamedatef90)
- Email: matefm20@gmail.com

---

## 🙏 **Acknowledgments | شكر وتقدير**

- **برعاية ابو الميكا وصحبته الرايقة** 🎮
- Inspired by card game sessions with friends
- Built with ❤️ for the gaming community

---

## 🔗 **Links | الروابط**

- **Live Demo:** [skru-score.vercel.app](https://skru-score.vercel.app)
- **GitHub:** [github.com/mohamedatef90/skru-score](https://github.com/mohamedatef90/skru-score)
- **Report Bug:** [Open an issue](https://github.com/mohamedatef90/skru-score/issues)

---

<div align="center">

**Made with ❤️ and ☕ by Mohamed Atef**

⭐ Star this repo if you find it useful!

</div>
