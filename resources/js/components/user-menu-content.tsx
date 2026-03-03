import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, Monitor, Moon, Sun } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import type { User } from '@/types';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { useTranslation } from 'react-i18next';
import { useAppearance } from '@/hooks/use-appearance';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { t, i18n } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">{t('settings.appearance', 'Appearance')}</DropdownMenuLabel>
                <div className="flex px-2 py-1 gap-2">
                    <button onClick={() => updateAppearance('light')} className={`flex items-center gap-1.5 text-xs px-2 py-1 flex-1 justify-center rounded border transition-colors ${appearance === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                        <Sun className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => updateAppearance('dark')} className={`flex items-center gap-1.5 text-xs px-2 py-1 flex-1 justify-center rounded border transition-colors ${appearance === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                        <Moon className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => updateAppearance('system')} className={`flex items-center gap-1.5 text-xs px-2 py-1 flex-1 justify-center rounded border transition-colors ${appearance === 'system' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
                        <Monitor className="h-3.5 w-3.5" />
                    </button>
                </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">{t('sidebar.language', 'Language')}</DropdownMenuLabel>
                <div className="flex px-2 py-1 gap-2">
                    <button onClick={() => i18n.changeLanguage('uz')} className={`text-xs px-2 py-1 rounded border ${i18n.language === 'uz' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>UZ</button>
                    <button onClick={() => i18n.changeLanguage('ru')} className={`text-xs px-2 py-1 rounded border ${i18n.language === 'ru' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>RU</button>
                    <button onClick={() => i18n.changeLanguage('en')} className={`text-xs px-2 py-1 rounded border ${i18n.language === 'en' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>EN</button>
                </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        {t('sidebar.settings', 'Settings')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    {t('sidebar.logout', 'Log out')}
                </Link>
            </DropdownMenuItem>
        </>
    );
}
