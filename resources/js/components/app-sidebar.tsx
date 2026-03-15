import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutDashboard, Clock, GraduationCap, PieChart, Users, Building2, Activity, BarChart3, UserCog, Github, Send } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import { useTranslation } from 'react-i18next';


const getMainNavItems = (t: any, user: any): NavItem[] => {
    const items: NavItem[] = [
        {
            title: t('sidebar.dashboard', 'Dashboard'),
            href: dashboard().url,
            icon: LayoutDashboard,
        },
        {
            title: t('sidebar.branches', 'Branches'),
            href: '/branches',
            icon: Building2,
        },
        {
            title: t('sidebar.shifts', 'Shifts'),
            href: '/shifts',
            icon: Clock,
        },
        {
            title: t('sidebar.classes', 'Classes'),
            href: '/classes',
            icon: GraduationCap,
        },
        {
            title: t('sidebar.students', 'Students'),
            href: '/students',
            icon: Users,
        },
        {
            title: t('sidebar.reports', 'Reports'),
            href: '/reports',
            icon: BarChart3,
        },
        {
            title: t('sidebar.monitoring', 'Monitoring'),
            href: '/monitoring',
            icon: Activity,
        },
    ];

    if (user?.roles?.includes('Superadmin')) {
        items.push({
            title: t('sidebar.users', 'Users'),
            href: '/users',
            icon: UserCog,
        });
    }

    return items;
};

import { usePage } from '@inertiajs/react';

export function AppSidebar() {
    const { t } = useTranslation();
    const { auth } = usePage().props as unknown as { auth: { user: any } };
    const mainNavItems = getMainNavItems(t, auth?.user);

    const footerNavItems: NavItem[] = [
        {
            title: t('sidebar.repository', 'Repository'),
            href: 'https://github.com/islamabdurahman',
            icon: Github,
        },
        {
            title: t('sidebar.telegram', 'Telegram'),
            href: 'https://t.me/livelongevity',
            icon: Send,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-100/50 dark:border-gray-800/50 p-4">
                <NavFooter items={footerNavItems} className="mb-4 opacity-70 hover:opacity-100 transition-opacity" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
