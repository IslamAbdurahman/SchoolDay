<div align="center">
  <img src="https://ui-avatars.com/api/?name=School+Day&background=0f172a&color=fff&size=120&rounded=true&font-size=0.4" alt="SchoolDay Logo" width="120" />
  <h1>🎓 SchoolDay</h1>
  <p><strong>Zamonaviy Maktab Boshqaruvi va Xavfsizlik Platformasi</strong></p>
  
  <p>
    <a href="https://laravel.com/"><img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel 12" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://www.php.net/"><img src="https://img.shields.io/badge/PHP-8.2%2B-777BB4?style=for-the-badge&logo=php" alt="PHP 8.2" /></a>
    <a href="https://inertiajs.com/"><img src="https://img.shields.io/badge/Inertia.js-Black?style=for-the-badge" alt="Inertia.js" /></a>
  </p>
</div>

<br />

## 🌟 Loyiha Haqida

**SchoolDay** — bu zamonaviy maktablar, lisey va o'quv markazlari uchun maxsus ishlab chiqilgan ilg'or va kompleks boshqaruv tizimidir. Platformaning markazida o'quv maskanidagi jarayonlarni maksimal raqamlashtirish, yuqori xavfsizlikni ta'minlash va ota-onalar bilan shaffof aloqani o'rnatish g'oyasi yotadi.

O'zining **Hikvision kameralari** bilan integratsiyasi orqali tizim o'quvchilar va xodimlarning maktabga kelish-ketish qaydlarini **yuz orqali tanish (Face Recognition)** yordamida avtomatik hisoblab, bu haqida maxsus **Telegram Bot** orqali ota-onalarga real vaqt rejimida bildirishnoma jo'natadi.

## ✨ Raqobatbardosh Imkoniyatlari

- 🎥 **Hikvision Integratsiyasi:** Maktabga kirish/chiqish punktlarida to'liq nazorat va avtomatlashtirilgan davomat tizimi.
- 📱 **Tezkor Telegram Xabarnomalar:** O'quvchilar maktabga kirgani va qaytganida ota-onalarga avtomatik xabar yetib borishi.
- ⚡ **Chaqmoqdek Tezlik:** React 19, Inertia.js va Vite hamkorligi orqali Single Page Application (SPA) darajasidagi yuklanishsiz sahifa almashinuvi.
- 📊 **Ommaviy Ma'lumotlar Boshqaruvi:** Excel yordamida (Import/Export) o'quvchilar, xodimlar va boshqa rekordlarni tezkor kiritish va yuklab olish.
- 🔐 **Kengaytirilgan Ruxsatlar (Roles & Permissions):** Tizim turli xil foydalanuvchilar (SuperAdmin, Admin, O'qituvchi va h.k.) uchun alohida boshqaruv panellariga va huquqlarga ega.
- 🌐 **Ilk Navbatda Mobil (PWA Support):** Smartfon ekraniga o'rnatib olish mumkin bo'lgan **Progressive Web App** qo'llab-quvvatlovi va a'lo darajadagi responsiv dizayn.
- 🎨 **Premium UI/UX Dizayn:** Eng yangi Tailwind CSS 4 va Radix UI hamkorligida shashqator animatsiyalar bilan qoplangan, ko'zni qamashtiruvchi interfeys (Dark/Light rejimi bilan).

## 🛠 Arxitektura va Texnologiyalar Steki

| Texnologiya Kategoriya | Ishlatilgan Dasturlar va Kutubxonalar |
| --------------------- | ------------------------------------- |
| **Backend (Mantiq)** | Laravel 12.0, PHP 8.2+ |
| **Frontend (Ko'rinish)** | React 19.2, TypeScript 5.7.2, Inertia.js |
| **Dizayn va Komponentlar** | Tailwind CSS 4.0, Radix UI Primitives, Lucide Icons, Shadcn-like komponentlar |
| **Ma'lumotlar Bazasi** | MySQL / MariaDB |
| **Tashqi Xizmatlar & Integratsiya** | Telegram Bot SDK (irazasyed/telegram-bot-sdk), Excel (maatwebsite/excel) |
| **Infratuzilma** | Laravel Queues (Supervisor), Vite, Tailwind-merge, clsx |

---

## 🚀 Loyihani Lokal Ishga Tushirish

Loyihani o'z kompyuteringiz yoki mahalliy serveringizda sinab ko'rish va ishga tushirish uchun quyidagi ko'rsatmalarni diqqat bilan bajaring.

### Oldindan Talab Qilinadi:
- **PHP** (v8.2 yoki undan yuqori) va modullari
- **Composer** (PHP kutubxonalar menejeri)
- **Node.js** (v18+) va **npm**
- **MySQL** / **MariaDB** bazasi

### 1. Repozitoriy va Paketlar
Birinchi navbatda loyihani terminal (bash) da oching va dasturlarni o'rnating:
```bash
git clone <repo_url> schoolday
cd schoolday

# Backend va Frontend kutubxonalarini o'rnatish
composer install
npm install
```

### 2. Muhit Sozlamalari (.env)
Лойиҳанинг `.env` faylini maxsus nusxadan yarating, hamda ilova kalitini generatsiya qiling:
```bash
cp .env.example .env
php artisan key:generate
```
`.env` faylning ichini o'zingizning bazangiz ma'lumotlari (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), navbat ishlari sozlamalari (`QUEUE_CONNECTION=database`) va bot uchun maxsus token (`TELEGRAM_BOT_TOKEN`) bilan boyiting.

### 3. Ma'lumotlar Bazasi va Storage
Zarur ma'lumotlarni bazaga import qilish hamda public bilan bog'lash uchun:
```bash
# Bazani yaratish, tahrirlash va birlamchi userni (Admin) kiritish
php artisan migrate --seed

# Yuklangan/rasmlar jamoatga ko'rinishi uchun
php artisan storage:link
```

> **Eslatma:** Dastlab ishga tushirilganda tayyor admin profillar beriladi:
> 👤 `superadmin@schoolday.uz` yoki `admin@schoolday.uz`
> 🔑 Parol: `11221122`

### 4. Aktivatsiya
Frontendni build qilish (yoki dev) va serverni hamda vazifa kutubxonalarini yoqish uchun kamida 2-3 xil terminaldan foydalaning (Supervisorsiz holatda):

*1-Terminal (Web Server):*
```bash
php artisan serve
```

*2-Terminal (Frontend Dev Server):*
```bash
npm run dev
```

*3-Terminal (Orqa fon xizmatlari, Telegram va h.k):*
```bash
php artisan queue:work
```

Brauzer sahifasiga o'tib [http://localhost:8000](http://localhost:8000) havolasini oching va ajoyib ishlangan premium vizualdan bahramand bo'ling!

---

<div align="center">
  <p>💡 Loyihaga oid savollar bo'lsa, jamoa rahbariga bot/aloqa orqali bog'laning!</p>
  <p>&copy; 2026 <strong>SchoolDay</strong> — Loyiha huquqlari himoyalangan.</p>
</div>
