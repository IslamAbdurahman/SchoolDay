import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, PieChart, Users, Building2 } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
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
            icon: LayoutGrid,
        },
        {
            title: t('sidebar.branches', 'Branches'),
            href: '/branches',
            icon: Building2,
        },
        {
            title: t('sidebar.shifts', 'Shifts'),
            href: '/shifts',
            icon: LayoutGrid,
        },
        {
            title: t('sidebar.classes', 'Classes'),
            href: '/classes',
            icon: BookOpen,
        },
        {
            title: t('sidebar.students', 'Students'),
            href: '/students',
            icon: Users,
        },
        {
            title: t('sidebar.reports', 'Reports'),
            href: '/reports',
            icon: PieChart,
        },
    ];

    if (user?.roles?.includes('Superadmin')) {
        items.push({
            title: t('sidebar.users', 'Users'),
            href: '/users',
            icon: Users,
        });
    }

    return items;
};

import { usePage } from '@inertiajs/react';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { t } = useTranslation();
    const { auth } = usePage().props as unknown as { auth: { user: any } };
    const mainNavItems = getMainNavItems(t, auth?.user);
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

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
