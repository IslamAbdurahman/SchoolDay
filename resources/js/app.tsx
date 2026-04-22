import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import '../css/app.css';
import './i18n';
import { initializeTheme } from './hooks/use-appearance';
import { configureEcho } from '@laravel/echo-react';

configureEcho({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost:
        import.meta.env.VITE_REVERB_HOST === 'localhost' ||
        import.meta.env.VITE_REVERB_HOST === '127.0.0.1'
            ? window.location.hostname
            : import.meta.env.VITE_REVERB_HOST,
    wsPort:
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
            ? import.meta.env.VITE_REVERB_PORT ?? 80
            : 80,
    wssPort:
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
            ? import.meta.env.VITE_REVERB_PORT ?? 443
            : 443,
    forceTLS:
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
            ? (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https'
            : true,
    enabledTransports: ['ws', 'wss'],
});

// ── Axios global defaults ────────────────────────────────────────────────────
// Laravel web routes require the XSRF-TOKEN cookie on every non-GET request.
// axios reads the XSRF-TOKEN cookie and attaches it as X-XSRF-TOKEN header.
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// ────────────────────────────────────────────────────────────────────────────

const appName = import.meta.env.VITE_APP_NAME || 'SchoolDay';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
