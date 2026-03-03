// ===== Translations =====
const translations = {
    uz: {
        badge: "Yangi avlod maktab boshqaruvi",
        heading1: "Maktabingizni",
        heading2: "eng yuqori aniqlikda boshqaring",
        description: "SchoolDay — maktab va bog'chalarda davomatni qayd etish, o'quvchilarni aqlli boshqarish va real vaqtda Hikvision tizimi orqali nazorat qilish uchun eng mukammal yechim.",
        btn_login: "Tizimga kirish",
        btn_contact: "Bog'lanish",
        feature1_title: "Maktab Davomat Tizimi",
        feature1_desc: "Maktabingiz uchun zamonaviy elektron davomat tizimi. Har bir o'quvchi harakati real vaqt rejimida qayd etiladi va hisobotlar avtomatik shakllanadi.",
        feature2_title: "Turniket va Face ID",
        feature2_desc: "Eng so'nggi Hikvision turniket tizimlari va yuzni tanish texnologiyasi. Bog'cha va maktab kirish joylarida xavfsizlikni eng yuqori darajaga olib chiqing.",
        feature3_title: "Telegram Xabarnomalar",
        feature3_desc: "Farzandingiz maktabga kelganida yoki ketganida darhol xabar oling. Ota-onalar xotirjamligi uchun Telegram bot orqali tezkor integratsiya.",
        contact_title: "Biz bilan bog'laning",
        contact_desc: "Savollaringiz bormi? Biz bilan quyidagi usullar orqali bog'laning.",
        contact_telegram: "Telegram orqali tez aloqa",
        contact_phone: "Telefon",
        contact_phone_desc: "Bizga qo'ng'iroq qiling",
        contact_phone_desc2: "Qo'shimcha telefon raqam",
        footer: "Barcha huquqlar himoyalangan.",
        page_title: "SchoolDay - Maktab va Bog'chalar uchun Aqlli Davomat va Turniket Tizimi",
        meta_desc: "Maktab va bog'chalar uchun innovatsion turniket, yuzni tanish (Face ID) va davomat tizimi. O'quvchilar xavfsizligini ta'minlash va ota-onalarga Telegram orqali tezkor xabarnomalar."
    },
    ru: {
        badge: "Управление школами нового поколения",
        heading1: "Управляйте своей школой",
        heading2: "с высочайшей точностью",
        description: "SchoolDay предоставляет интегрированную экосистему для учета посещаемости, умного управления учащимися и контроля доступа Hikvision в реальном времени.",
        btn_login: "Войти в систему",
        btn_contact: "Связаться с нами",
        feature1_title: "Система посещаемости",
        feature1_desc: "Современная электронная система посещаемости для вашей школы. Каждое движение ученика фиксируется в реальном времени, отчеты формируются автоматически.",
        feature2_title: "Турникеты и Face ID",
        feature2_desc: "Новейшие системы турникетов Hikvision и распознавание лиц. Обеспечьте максимальный уровень безопасности в учебных заведениях.",
        feature3_title: "Telegram Уведомления",
        feature3_desc: "Получайте мгновенные уведомления о приходе или уходе ребенка. Быстрая интеграция с Telegram для спокойствия родителей.",
        contact_title: "Свяжитесь с нами",
        contact_desc: "Есть вопросы? Свяжитесь с нами любым удобным способом.",
        contact_telegram: "Быстрая связь через Telegram",
        contact_phone: "Телефон",
        contact_phone_desc: "Позвоните нам",
        contact_phone_desc2: "Дополнительный номер",
        footer: "Все права защищены.",
        page_title: "SchoolDay - Умная система посещаемости и турникетов",
        meta_desc: "Инновационные турникеты, распознавание лиц и система учета посещаемости для образовательных учреждений."
    },
    en: {
        badge: "Next Generation School Management",
        heading1: "Manage your school with",
        heading2: "ultimate precision",
        description: "SchoolDay provides a highly integrated ecosystem for attendance tracking, student management, and real-time Hikvision access control.",
        btn_login: "Sign In",
        btn_contact: "Contact Us",
        feature1_title: "School Attendance System",
        feature1_desc: "A modern electronic attendance system. Every student movement is recorded in real-time, and reports are generated automatically.",
        feature2_title: "Turnstiles and Face ID",
        feature2_desc: "Latest Hikvision turnstile systems and face recognition technology. Bring security to the next level in schools and kindergartens.",
        feature3_title: "Telegram Notifications",
        feature3_desc: "Get instant notifications when your child arrives or leaves school. Quick Telegram integration for parent peace of mind.",
        contact_title: "Get in Touch",
        contact_desc: "Have questions? Reach out to us through any of the following channels.",
        contact_telegram: "Quick contact via Telegram",
        contact_phone: "Phone",
        contact_phone_desc: "Give us a call",
        contact_phone_desc2: "Secondary phone number",
        footer: "All rights reserved.",
        page_title: "SchoolDay - Smart Attendance and Turnstile System",
        meta_desc: "Innovative turnstiles, face recognition and attendance systems for educational institutions."
    }
};

// ===== State =====
let currentLang = localStorage.getItem('sd-lang') || 'uz';
let currentTheme = localStorage.getItem('sd-theme') || 'dark';

// ===== Theme =====
function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sd-theme', theme);
}

function toggleTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ===== Language =====
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('sd-lang', lang);
    const t = translations[lang];

    // Update text content
    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    updateText('badge-text', t.badge);
    updateText('heading1', t.heading1 + ' ');
    updateText('heading2', t.heading2);
    updateText('description', t.description);
    updateText('btn-login', t.btn_login);
    updateText('btn-contact', t.btn_contact);
    updateText('feature1-title', t.feature1_title);
    updateText('feature1-desc', t.feature1_desc);
    updateText('feature2-title', t.feature2_title);
    updateText('feature2-desc', t.feature2_desc);
    updateText('feature3-title', t.feature3_title);
    updateText('feature3-desc', t.feature3_desc);
    updateText('contact-title', t.contact_title);
    updateText('contact-desc', t.contact_desc);
    updateText('contact-telegram-desc', t.contact_telegram);
    updateText('contact-phone1-name', t.contact_phone);
    updateText('contact-phone1-desc', t.contact_phone_desc);
    updateText('contact-phone2-name', t.contact_phone);
    updateText('contact-phone2-desc', t.contact_phone_desc2);
    updateText('footer-rights', t.footer);

    // Update page title & meta
    document.title = t.page_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t.meta_desc);

    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    setTheme(currentTheme);
    setLanguage(currentLang);

    const header = document.querySelector('.header');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Scroll effect for header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header?.classList.add('header--scrolled');
        } else {
            header?.classList.remove('header--scrolled');
        }
    });

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});
