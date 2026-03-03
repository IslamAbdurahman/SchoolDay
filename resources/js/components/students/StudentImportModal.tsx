import { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    classes: any[];
}

export function StudentImportModal({ isOpen, onClose, classes }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        excel_file: null as File | null,
        class_id: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/students/import', {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                clearErrors();
                reset();
                onClose();
            }
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('students.import_excel', 'Excel orqali yuklash')}</DialogTitle>
                    <DialogDescription className="space-y-3">
                        <p>{t('students.import_description', "Excel fayl namunasida ustunlar nomi mos bo'lishi kerak: name, phone, gender (0 - ayol, 1 - erkak)")}</p>
                        <a href="/students/template" target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            {t('students.download_template', 'Shablonni yuklab olish')}
                        </a>
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('students.class', 'Sinf')} <span className="text-destructive">*</span></Label>
                        <Combobox
                            value={data.class_id}
                            onChange={(val) => setData('class_id', val)}
                            placeholder={t('students.assign_class', 'Sinfni tanlang...')}
                            options={classes.map(c => ({ value: String(c.id), label: c.name }))}
                            searchPlaceholder={t('common.search', 'Qidirish...')}
                            emptyText={t('common.not_found', 'Topilmadi')}
                        />
                        {errors.class_id && <p className="text-xs text-destructive">{errors.class_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('students.excel_file', 'Excel fayl')} <span className="text-destructive">*</span></Label>
                        <Input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            required
                            onChange={(e) => setData('excel_file', e.target.files ? e.target.files[0] : null)}
                        />
                        {errors.excel_file && <p className="text-xs text-destructive">{errors.excel_file}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            {t('common.cancel', 'Bekor qilish')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {t('common.save', 'Yuklash')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
