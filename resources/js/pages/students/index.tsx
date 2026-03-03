import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FormEvent, useState, useRef } from 'react';
import type { BreadcrumbItem } from '@/types';
import { useTranslation } from 'react-i18next';

import { ImageModal } from '@/components/students/ImageModal';
import { StudentForm } from '@/components/students/StudentForm';
import { StudentFilters } from '@/components/students/StudentFilters';
import { StudentsTable } from '@/components/students/StudentsTable';
import { StudentImportModal } from '@/components/students/StudentImportModal';


export default function StudentsPage({
    students,
    classes,
    filters,
}: {
    students: any;
    classes: any[];
    filters: any;
    flash?: any;
}) {
    const { t } = useTranslation();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('students.title', 'Students'), href: '/students' }];

    // ─── Filters ────────────────────────────────────────────────────────────────
    const { data: filterData, setData: setFilterData } = useForm({
        class_id: filters?.class_id || '',
        status: filters?.status || '',
        search: filters?.search || '',
        per_page: filters?.per_page || '20',
    });

    const handleFilter = () => {
        router.get('/students', filterData as any, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setFilterData({ class_id: '', status: '', search: '', per_page: '20' });
        router.get('/students', {}, { preserveState: true, replace: true });
    };

    // ─── Form ────────────────────────────────────────────────────────────────────
    const [editing, setEditing] = useState<any>(null);
    const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
    const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        data: formData,
        setData,
        post,
        delete: destroy,
        reset,
        errors,
        transform,
        clearErrors,
    } = useForm({
        name: '',
        phone: '',
        telegram_id: '',
        class_id: '',
        status: 'active',
        face_image: null as File | null,
        gender: 'unknown',
        user_verify_mode: 'face',
        local_ui_right: false,
        door_right: '1',
        plan_template_no: '1',
        valid_enabled: false,
        valid_begin: '',
        valid_end: '',
    });



    // ─── Handlers ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.class_id) {
            alert(t('students.class_required', 'Sinfni tanlash majburiy!'));
            return;
        }

        const targetEmployeeNo = editing
            ? editing.employeeNoString || String(editing.id)
            : Date.now().toString().slice(-8);

        transform((data: any) => ({ ...data, employeeNoString: targetEmployeeNo }));

        if (editing) {
            post(`/students/${editing.id}`, {
                onSuccess: () => {
                    setEditing(null);
                    setFormImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    reset();
                },
            });
        } else {
            post('/students', {
                onSuccess: () => {
                    setFormImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    reset(
                        'name',
                        'phone',
                        'telegram_id',
                        'status',
                        'face_image',
                        'gender',
                        'user_verify_mode',
                        'local_ui_right',
                        'door_right',
                        'plan_template_no',
                        'valid_enabled',
                        'valid_begin',
                        'valid_end'
                    );
                },
            });
        }
    };

    const handleEdit = (student: any) => {
        setEditing(student);
        clearErrors();
        setFormImagePreview(student.face_image || null);
        setData({
            name: student.name || '',
            phone: student.phone || '',
            telegram_id: student.telegram_id || '',
            class_id: student.class_id ? String(student.class_id) : '',
            status: student.status || 'active',
            face_image: null,
            gender: student.gender || 'unknown',
            user_verify_mode: student.user_verify_mode || 'face',
            local_ui_right: student.local_ui_right ?? false,
            door_right: student.door_right || '1',
            plan_template_no: student.plan_template_no || '1',
            valid_enabled: student.valid_enabled ?? false,
            valid_begin: student.valid_begin ? student.valid_begin.slice(0, 16) : '',
            valid_end: student.valid_end ? student.valid_end.slice(0, 16) : '',
        });
    };

    const handleDelete = async (student: any) => {
        if (confirm(t('students.delete_confirm', 'Are you sure you want to delete this student?'))) {
            destroy(`/students/${student.id}`);
        }
    };

    const handleImageChange = (file: File | null) => {
        setData('face_image', file as any);
        if (file) {
            setFormImagePreview(URL.createObjectURL(file));
        } else {
            setFormImagePreview(editing?.face_image || null);
        }
    };

    const handleCancel = () => {
        setEditing(null);
        setFormImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        reset();
        clearErrors();
    };

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('students.title', 'Students')} />

            <ImageModal imageUrl={imageModalUrl} onClose={() => setImageModalUrl(null)} />
            <StudentImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                classes={classes}
            />

            <div className="p-6 grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                {/* Left – Form */}
                <StudentForm
                    editing={editing}
                    formData={formData}
                    errors={errors}
                    formImagePreview={formImagePreview}
                    classes={classes}
                    setData={setData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    onImageChange={handleImageChange}
                    fileInputRef={fileInputRef}
                />

                {/* Right – Filters + Table */}
                <div className="xl:col-span-3 flex flex-col gap-4">
                    <StudentFilters
                        filterData={filterData}
                        classes={classes}
                        setFilterData={setFilterData}
                        onFilter={handleFilter}
                        onClear={clearFilters}
                    />

                    <StudentsTable
                        students={students}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onImageClick={url => setImageModalUrl(url)}
                        onImportClick={() => setIsImportModalOpen(true)}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
