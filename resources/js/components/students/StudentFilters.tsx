import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FilterData {
    class_id: string;
    status: string;
    search: string;
    per_page: string;
}

interface StudentFiltersProps {
    filterData: FilterData;
    classes: any[];
    setFilterData: (key: string, value: string) => void;
    onFilter: () => void;
    onClear: () => void;
}

export function StudentFilters({ filterData, classes, setFilterData, onFilter, onClear }: StudentFiltersProps) {
    const { t } = useTranslation();

    const hasActiveFilters =
        filterData.search || filterData.class_id || filterData.status || filterData.per_page !== '20';

    return (
        <div className="bg-card p-4 rounded-xl border border-sidebar-border dark:border-sidebar-border shadow-sm flex flex-col md:flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative w-full md:flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-8"
                    placeholder={t('students.placeholder_search', 'Search by name, phone, or ID...')}
                    value={filterData.search}
                    onChange={e => setFilterData('search', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onFilter()}
                />
            </div>

            {/* Class */}
            <div className="w-full md:w-48">
                <Combobox
                    value={filterData.class_id}
                    onChange={val => setFilterData('class_id', val === 'all' ? '' : val)}
                    placeholder={t('students.all_classes', 'All Classes')}
                    searchPlaceholder={t('common.search', 'Qidirish...')}
                    emptyText={t('common.not_found', 'Topilmadi')}
                    options={[
                        { value: 'all', label: t('students.all_classes', 'All Classes') },
                        ...classes.map(cls => ({ value: String(cls.id), label: `${cls.name}${cls.shift ? ` (${cls.shift.name}${cls.shift.branch ? ` - ${cls.shift.branch.name}` : ''})` : ''}` })),
                    ]}
                />
            </div>

            {/* Status */}
            <div className="w-full md:w-40">
                <Select
                    value={filterData.status}
                    onValueChange={val => setFilterData('status', val === 'all' ? '' : val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('students.all_status', 'All Status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('students.all_status', 'All Status')}</SelectItem>
                        <SelectItem value="active">{t('students.active', 'Active')}</SelectItem>
                        <SelectItem value="inactive">{t('students.inactive', 'Inactive')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Per page */}
            <div className="w-full md:w-28">
                <Select value={filterData.per_page} onValueChange={val => setFilterData('per_page', val)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="20">20 {t('common.items', 'ta')}</SelectItem>
                        <SelectItem value="50">50 {t('common.items', 'ta')}</SelectItem>
                        <SelectItem value="100">100 {t('common.items', 'ta')}</SelectItem>
                        <SelectItem value="all">{t('common.all', 'Barchasi')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={onFilter}>{t('students.filter', 'Filter')}</Button>

            {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={onClear} title="Clear Filters">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
