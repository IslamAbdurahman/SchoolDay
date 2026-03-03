import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface ReportFiltersProps {
    filterData: {
        start_date: string;
        end_date: string;
        branch_id: string;
        shift_id: string;
        class_id: string;
        student_id: string;
        status: string;
        per_page: string;
    };
    branches: any[];
    shifts: any[];
    classes: any[];
    students: any[];
    setData: (key: string, value: string) => void;
    onSubmit: (e: FormEvent) => void;
}

export function ReportFilters({ filterData, branches, shifts, classes, students, setData, onSubmit }: ReportFiltersProps) {
    const { t } = useTranslation();

    return (
        <div className="bg-card p-4 rounded-xl border border-sidebar-border dark:border-sidebar-border shadow-sm mb-4">
            <form onSubmit={onSubmit} className="flex flex-col md:flex-row flex-wrap gap-3 items-center">
                <div className="w-full flex-1 min-w-[240px] shrink-0">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal border-sidebar-border bg-card hover:bg-muted ${!filterData.start_date || !filterData.end_date ? 'text-muted-foreground' : ''
                                    }`}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filterData.start_date || filterData.end_date ? (
                                    <span>
                                        {filterData.start_date ? filterData.start_date : '...'} - {filterData.end_date ? filterData.end_date : '...'}
                                    </span>
                                ) : (
                                    <span>{t('reports.select_date', 'Sanani tanlang')}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-4" align="start">
                            <div className="flex flex-col gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{t('reports.from_date', 'Dan:')}</label>
                                    <Input
                                        type="date"
                                        value={filterData.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        required
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">{t('reports.to_date', 'Gacha:')}</label>
                                    <Input
                                        type="date"
                                        value={filterData.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        required
                                        className="h-9"
                                    />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="w-full flex-1 min-w-[200px]">
                    <Combobox
                        value={filterData.branch_id}
                        onChange={val => setData('branch_id', val)}
                        placeholder={t('reports.all_branches', 'Barcha filiallar')}
                        searchPlaceholder={t('common.search', 'Qidirish...')}
                        emptyText={t('common.not_found', 'Topilmadi')}
                        options={[
                            { value: '', label: t('reports.all_branches', 'Barcha filiallar') },
                            ...branches.map((b: any) => ({ value: String(b.id), label: b.name })),
                        ]}
                    />
                </div>
                <div className="w-full flex-1 min-w-[200px]">
                    <Combobox
                        value={filterData.shift_id}
                        onChange={val => setData('shift_id', val)}
                        placeholder={t('reports.all_shifts', 'Barcha smenalar')}
                        searchPlaceholder={t('common.search', 'Qidirish...')}
                        emptyText={t('common.not_found', 'Topilmadi')}
                        options={[
                            { value: '', label: t('reports.all_shifts', 'Barcha smenalar') },
                            ...shifts.map((s: any) => ({ value: String(s.id), label: `${s.name} (${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)})${s.branch ? ` - ${s.branch.name}` : ''}` })),
                        ]}
                    />
                </div>
                <div className="w-full flex-1 min-w-[200px]">
                    <Combobox
                        value={filterData.class_id}
                        onChange={val => setData('class_id', val)}
                        placeholder={t('reports.all_classes', 'Barcha sinflar')}
                        searchPlaceholder={t('common.search', 'Qidirish...')}
                        emptyText={t('common.not_found', 'Topilmadi')}
                        options={[
                            { value: '', label: t('reports.all_classes', 'Barcha sinflar') },
                            ...classes.map((c: any) => ({ value: String(c.id), label: `${c.name}${c.shift ? ` (${c.shift.name}${c.shift.branch ? ` - ${c.shift.branch.name}` : ''})` : ''}` })),
                        ]}
                    />
                </div>
                <div className="w-full flex-1 min-w-[200px]">
                    <Combobox
                        value={filterData.student_id}
                        onChange={val => setData('student_id', val)}
                        placeholder={t('reports.all_students', "Barcha o'quvchilar")}
                        searchPlaceholder={t('common.search', 'Qidirish...')}
                        emptyText={t('common.not_found', 'Topilmadi')}
                        options={[
                            { value: '', label: t('reports.all_students', "Barcha o'quvchilar") },
                            ...students.map((s: any) => ({ value: String(s.id), label: s.name })),
                        ]}
                    />
                </div>
                <div className="w-[140px] shrink-0">
                    <Select value={filterData.status} onValueChange={val => setData('status', val)}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('reports.status', 'Holat')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('reports.status_all', 'Barchasi')}</SelectItem>
                            <SelectItem value="present">{t('reports.status_present', 'Kelganlar')}</SelectItem>
                            <SelectItem value="absent">{t('reports.status_absent', 'Kelmaganlar')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-[100px] shrink-0">
                    <Select value={filterData.per_page} onValueChange={val => setData('per_page', val)}>
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
                <Button type="submit">{t('reports.filter', 'Filter Report')}</Button>
            </form>
        </div>
    );
}
