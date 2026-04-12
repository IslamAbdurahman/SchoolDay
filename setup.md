# SchoolDay - Loyihani Ishga Tushirish Bo'yicha Qo'llanma (Setup Guide)

Ushbu qo'llanma **SchoolDay** (Laravel + React/Inertia + Vite + Hikvision Integratsiyasi) loyihasini yangi kompyuterda yoki serverda noldan ishga tushirish qadamlarini batafsil tushuntirib beradi.

## 1. Talab Qilinadigan Dasturlar (Prerequisites)
Loyihani ishga tushirishdan oldin server yoki kompyuteringizda quyidagilar o'rnatilganligiga ishonch hosil qiling:
- **PHP** (v8.2 yoki undan yuqori)
- **Composer** (v2.x)
- **Node.js** (v18 yoki undan yuqori) va **npm**
- **MySQL** yoki **MariaDB**
- **Supervisor** (Orqa fonga vazifalarni (queue) boshqarish uchun - faqat Linux serverlarda)
- **Git**

---

## 2. Loyihani O'rnatish

### 2.1. Tarmoqdan ko'chirib olish
Dastlab loyihani GitHub yoki GitLab dan yuklab oling va papka ichiga kiring:
```bash
git clone <repo_url> schoolday
cd schoolday
```

### 2.2. Paketlarni o'rnatish
PHP va Node.js kutubxonalarini o'rnating:
```bash
composer install
npm install
```

### 2.3. Muhit o'zgaruvchilari (Environment Variables)
`.env.example` faylidan `.env` faylini yarating:
```bash
cp .env.example .env
```
So'ngra ilova kalitini generatsiya qiling:
```bash
php artisan key:generate
```

`.env` faylini ochib, ma'lumotlar bazasi va ishlash muhitiga mos kerakli ma'lumotlarni to'ldiring:
```env
APP_NAME=SchoolDay
APP_ENV=production
APP_DEBUG=false
APP_URL=https://schoolday.payday.uz   # O'zingizning domeningiz

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=schoolday_db              # Bazangiz nomi
DB_USERNAME=root                      # O'zingizning bazangiz logini
DB_PASSWORD=your_password             # O'zingizning bazangiz paroli

QUEUE_CONNECTION=database             # Albatta database bo'lishi kerak

TELEGRAM_BOT_TOKEN=your_bot_token     # Telegram bot uchun (ixtiyoriy)
```

### 2.4. Ma'lumotlar Bazasini Migratsiya Qilish
Ma'lumotlar bazasini strukturasini yaratish va boshlang'ich foydalanuvchilar (Superadmin va Admin) ma'lumotlarini bazaga yozish uchun:
```bash
php artisan migrate --seed
```
*Eslatma: Seeder ishlagach, tizimga kirish uchun standart logın/parollar yaratiladi.*
- **SuperAdmin:** superadmin@schoolday.uz / 11221122
- **Admin:** admin@schoolday.uz / 11221122

### 2.5. Frontend'ni Kompilyatsiya Qilish
Kodni yig'ish (build) maqsadida Vite'ni ishga tushiring:
```bash
# Serverda yoki Production uchun:
npm run build

# Lokal kompyuterda ishlab chiqish (Development) uchun:
npm run dev
```

### 2.6. Xotirani va Fayllarni Bog'lash
Laravel'dagi rasmlar va yuklanmalar ommasiga (public) yetib kelishi uchun link yarating:
```bash
php artisan storage:link
```
Papka uchun kerakli ruxsatlarni (permissions) bering (Linux/Mac da):
```bash
chmod -R 777 storage bootstrap/cache
```

---

## 3. Queue Worker va Supervisor Sozlamalari (Faqat Server uchun)

Excel import qilish kabi orqa fonga yo'naltirilgan og'ir jarayonlar (asinxron vazifalar) muvaffaqiyatli ishlashi uchun Supervisor orqali Laravel Worker doimiy ishlab turishi kerak. 

Serverda quyidagicha configuratsiya qiling:

**1. Supervisor konfiguratsiya fayli yarating:**
```bash
sudo nano /etc/supervisor/conf.d/schoolday-worker.conf
```

**2. Ichi quyidagicha bo'lsin:**
*(Eslatma: `/var/www/schoolday` o'rniga loyihangiz qayerda turgan bo'lsa, o'sha to'liq manzilni yozing!)*
```ini
[program:schoolday-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/schoolday/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=root
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/schoolday/storage/logs/worker.log
stopwaitsecs=3600
```

**3. Supervisorni yangilang va ishga tushiring:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start schoolday-worker:*
```

### 3.2. Laravel Reverb (WebSocket) Sozlamalari
Real-vaqt monitoring (LIVE) ishlashi uchun Reverb serveri ham doimiy ishlab turishi kerak.

**1. Reverb uchun Supervisor konfiguratsiya fayli yarating:**
```bash
sudo nano /etc/supervisor/conf.d/schoolday-reverb.conf
```

**2. Ichi quyidagicha bo'lsin:**
```ini
[program:schoolday-reverb]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/schoolday/artisan reverb:start --host=0.0.0.0 --port=8080 --hostname=schoolday.payday.uz
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=root
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/schoolday/storage/logs/reverb.log
stopwaitsecs=3600
```

**3. Supervisorni yangilang va ishga tushiring:**
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start schoolday-reverb:*
```

**Xizmat ishlaganini tekshirish uchun:**
```bash
sudo supervisorctl status
```

---

## 4. Loyihani Lokal Ishga Tushirish
Agar Windows/Mac'da ishlayotgan bo'lsangiz 3 ta terminalni ochib ilovani yurgizing:

1-terminal (Veb server):
```bash
php artisan serve
```

2-terminal (Navbatlar/Queue):
```bash
php artisan queue:work
```

3-terminal (WebSocket/Reverb):
```bash
php artisan reverb:start
```
*(Bu Monitoring sahifasida ma'lumotlarni real-vaqtda ko'rsatish uchun xizmat qiladi)*

Veb brauzeringizda **http://localhost:8000** manziliga kiring va loyihaga ishga tushganini ko'ring!
