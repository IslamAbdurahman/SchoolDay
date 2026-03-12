import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useAppearance } from '@/hooks/use-appearance';
import { Moon, Sun, Phone, Send, MessageCircle, Activity } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const year = new Date().getFullYear();
    const { t, i18n } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const toggleTheme = () => {
        const isDark = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        updateAppearance(isDark ? 'light' : 'dark');
    };

    return (
        <>
            <Head>
                <title>{t('seo.welcome_title')}</title>
                <meta name="description" content={t('seo.welcome_description')} />
                <meta name="keywords" content={t('seo.welcome_keywords')} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta property="og:title" content={t('seo.og_title')} />
                <meta property="og:description" content={t('seo.og_description')} />
                <meta property="og:image" content="/images/og-image.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={window.location.href} />
                <meta property="twitter:title" content={t('seo.og_title')} />
                <meta property="twitter:description" content={t('seo.og_description')} />
                <meta property="twitter:image" content="/images/og-image.jpg" />

                <link rel="canonical" href={window.location.href} />
            </Head>
            <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col items-center text-slate-800 dark:text-slate-100 font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300">

                {/* Immersive Background Effects */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/10 dark:bg-blue-600/20 blur-[128px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[128px]"></div>
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-500/10 dark:bg-orange-500/20 blur-[128px]"></div>
                    <div className="absolute inset-0 bg-white/20 dark:bg-[#0f172a]/20 mix-blend-overlay backdrop-blur-[1px]"></div>
                </div>

                {/* Header Navigation */}
                <header className={`fixed top-0 w-full z-100 transition-all duration-300 flex justify-center ${isScrolled ? 'py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-black/5 dark:border-white/10' : 'py-6 bg-transparent'}`}>
                    <div className="w-full max-w-7xl px-6 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-orange-500/30">
                                <img src="/image/logo.jpg" alt="SchoolDay Logo" className="w-10 h-10 object-cover" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                                SchoolDay
                            </span>
                        </div>

                        <nav className="flex items-center gap-2 sm:gap-4">
                            <Link
                                href="/monitoring"
                                className="hidden md:flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-full transition-all border border-emerald-500/20"
                            >
                                <Activity className="w-4 h-4" />
                                Monitoring
                            </Link>
                            <a
                                href="#contact"
                                className="hidden md:block px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                            >
                                {t('welcome.contact_nav', 'Bog\'lanish')}
                            </a>

                            <button
                                onClick={toggleTheme}
                                className="p-2 sm:py-2.5 sm:px-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 rounded-full transition-all backdrop-blur-md flex items-center justify-center shadow-sm"
                                aria-label="Toggle theme"
                            >
                                <Sun className="h-4 w-4 hidden dark:block" />
                                <Moon className="h-4 w-4 block dark:hidden" />
                            </button>

                            <div className="flex bg-black/5 dark:bg-white/10 p-1 rounded-full border border-black/5 dark:border-white/10 backdrop-blur-md">
                                <button onClick={() => changeLanguage('uz')} className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${i18n.language === 'uz' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>UZ</button>
                                <button onClick={() => changeLanguage('ru')} className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${i18n.language === 'ru' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>RU</button>
                                <button onClick={() => changeLanguage('en')} className={`px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${i18n.language === 'en' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>EN</button>
                            </div>

                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 text-slate-800 dark:text-white backdrop-blur-md transition-all font-medium text-xs sm:text-sm shadow-sm"
                                >
                                    {t('welcome.dashboard', 'Dashboard')}
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/5 dark:border-white/10 text-slate-800 dark:text-white backdrop-blur-md transition-all font-medium text-xs sm:text-sm shadow-sm"
                                >
                                    {t('welcome.login', 'Log in')}
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Content */}
                <main className="z-10 w-full max-w-7xl px-6 pt-32 sm:pt-40 lg:pt-48 flex flex-col items-center">

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-10 w-full mb-20">
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs sm:text-sm mb-6 text-orange-600 dark:text-orange-200 backdrop-blur-sm shadow-inner transition-all hover:bg-black/10 dark:hover:bg-white/10 cursor-default">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                </span>
                                {t('welcome.badge', 'Next Generation School Management')}
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 leading-[1.15]">
                                {t('welcome.heading_part1', 'Manage your school with')} <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-indigo-400">
                                    {t('welcome.heading_part2', 'ultimate precision')}
                                </span>
                            </h1>

                            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed font-light">
                                {t('welcome.description', 'SchoolDay provides a highly integrated ecosystem for attendance tracking, intelligent student management, and real-time Hikvision access control.')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-5 w-full sm:w-auto">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold transition-all shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.7)] hover:-translate-y-1 duration-300 text-sm sm:text-base text-center"
                                    >
                                        {t('welcome.enter_dashboard', 'Enter Dashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold transition-all shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_0_60px_-15px_rgba(249,115,22,0.7)] hover:-translate-y-1 duration-300 text-sm sm:text-base text-center"
                                        >
                                            {t('welcome.login_account', 'Log in to your account')}
                                        </Link>
                                        <a
                                            href="#contact"
                                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-slate-800 dark:text-white font-medium transition-all backdrop-blur-sm hover:-translate-y-1 duration-300 text-sm sm:text-base text-center"
                                        >
                                            {t('welcome.btn_contact', 'Bog\'lanish')}
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Hikvision Device Showcase */}
                        <div className="relative flex justify-center items-center lg:justify-end flex-1 w-full lg:w-auto">
                            {/* Glow */}
                            <div
                                className="absolute w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 rounded-full blur-[40px] z-0"
                                style={{
                                    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(249,115,22,0.15) 50%, transparent 70%)',
                                    animation: 'showcaseGlow 4s ease-in-out infinite alternate',
                                }}
                            />
                            {/* Card */}
                            <div className="relative z-10 flex flex-col items-center gap-4 p-6 sm:p-8 md:p-10 rounded-3xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_60px_-15px_rgba(99,102,241,0.15),0_0_40px_-10px_rgba(249,115,22,0.1)] group cursor-default">
                                <img
                                    src="/image/hikvision.png"
                                    alt="Hikvision Face ID Terminal - Yuzni tanish qurilmasi"
                                    className="w-48 sm:w-60 md:w-72 h-auto object-contain rounded-xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 text-white text-[0.65rem] font-bold tracking-wider uppercase">
                                        Hikvision
                                    </span>
                                    <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Face Recognition Terminal
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inline keyframes for glow animation */}
                    <style>{`
                        @keyframes showcaseGlow {
                            0% { transform: scale(0.9); opacity: 0.6; }
                            100% { transform: scale(1.15); opacity: 1; }
                        }
                    `}</style>

                    {/* SEO Semantic Content (visually balanced) */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-6xl pb-20">
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-4 text-orange-500">{t('seo.feature_attendance_title', 'Maktab Davomat Tizimi')}</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('seo.feature_attendance_desc', 'Maktabingiz uchun zamonaviy elektron davomat tizimi. Har bir o\'quvchi harakati real vaqt rejimida qayd etiladi va hisobotlar avtomatik shakllanadi.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-4 text-rose-500">{t('seo.feature_turnstile_title', 'Turniket va Face ID')}</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('seo.feature_turnstile_desc', 'Eng so\'nggi Hikvision turniket tizimlari va yuzni tanish texnologiyasi. Bog\'cha va maktab kirish joylarida xavfsizlikni eng yuqori darajaga olib chiqing.')}
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm">
                            <h2 className="text-xl font-bold mb-4 text-indigo-500">{t('seo.feature_notif_title', 'Telegram Xabarnomalar')}</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {t('seo.feature_notif_desc', 'Farzandingiz maktabga kelganida yoki ketganida darhol xabar oling. Ota-onalar xotirjamligi uchun Telegram bot orqali tezkor integratsiya.')}
                            </p>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div id="contact" className="w-full max-w-6xl pb-20">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                                {t('welcome.contact_title', 'Biz bilan bog\'laning')}
                            </h2>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                                {t('welcome.contact_desc', 'Savollaringiz bormi? Biz bilan quyidagi usullar orqali bog\'laning.')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Telegram */}
                            <a
                                href="https://t.me/Livelongevity"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                                    <Send className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    Telegram
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    {t('welcome.contact_telegram_desc', 'Telegram orqali tez aloqa')}
                                </p>
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 group-hover:text-blue-400 transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    @Livelongevity
                                </span>
                            </a>

                            {/* Phone 1 */}
                            <a
                                href="tel:+998911157709"
                                className="group p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {t('welcome.contact_phone', 'Telefon')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    {t('welcome.contact_phone_desc', 'Bizga qo\'ng\'iroq qiling')}
                                </p>
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 group-hover:text-orange-400 transition-colors">
                                    <Phone className="w-4 h-4" />
                                    +998 91 115 77 09
                                </span>
                            </a>

                            {/* Phone 2 */}
                            <a
                                href="tel:+998993033484"
                                className="group p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    {t('welcome.contact_phone', 'Telefon')}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    {t('welcome.contact_phone_desc2', 'Qo\'shimcha telefon raqam')}
                                </p>
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-500 group-hover:text-indigo-400 transition-colors">
                                    <Phone className="w-4 h-4" />
                                    +998 99 303 34 84
                                </span>
                            </a>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="w-full z-10 text-center text-slate-500 text-xs sm:text-sm font-light px-4 py-6">
                    &copy; {year} SchoolDay Ecosystem. {t('welcome.all_rights', 'All rights reserved.')}
                </footer>
            </div>
        </>
    );
}
