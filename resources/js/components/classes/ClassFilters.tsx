import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ClassFiltersProps {
    filterData: { shift_id: string; search: string; per_page: string };
    shifts: any[];
    setFilterData: (key: string, value: string) => void;
    onFilter: () => void;
    onClear: () => void;
}

export function ClassFilters({ filterData, shifts, setFilterData, onFilter, onClear }: ClassFiltersProps) {
    const { t } = useTranslation();

    const hasActiveFilters = filterData.search || filterData.shift_id || filterData.per_page !== '20';

    return (
        <div className="bg-card p-4 rounded-xl border border-sidebar-border dark:border-sidebar-border shadow-sm flex flex-col md:flex-row gap-3 items-center">
            <div className="relative w-full md:flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-8"
                    placeholder={t('classes.search', 'Search...')}
                    value={filterData.search}
                    onChange={e => setFilterData('search', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && onFilter()}
                />
            </div>
            <div className="w-full md:w-56">
                <Combobox
                    value={filterData.shift_id}
                    onChange={val => setFilterData('shift_id', val === 'all' ? '' : val)}
                    placeholder={t('classes.all_shifts', 'All Shifts')}
                    searchPlaceholder={t('common.search', 'Qidirish...')}
                    emptyText={t('common.not_found', 'Topilmadi')}
                    options={[
                        { value: 'all', label: t('classes.all_shifts', 'All Shifts') },
                        ...shifts.map(shift => ({ value: String(shift.id), label: `${shift.name} (${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)})${shift.branch ? ` - ${shift.branch.name}` : ''}` })),
                    ]}
                />
            </div>
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
            <Button onClick={onFilter}>{t('classes.filter', 'Filter')}</Button>
            {hasActiveFilters && (
                <Button variant="ghost" size="icon" onClick={onClear} title="Clear Filters">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
