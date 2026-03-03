import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface ImageModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

export function ImageModal({ imageUrl, onClose }: ImageModalProps) {
    const { t } = useTranslation();
    return (
        <Dialog open={!!imageUrl} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="sm:max-w-2xl flex justify-center p-0 overflow-hidden border-none bg-transparent shadow-none"
                aria-describedby="student-photo-description"
            >
                <DialogTitle className="sr-only">{t('students.student_photo', 'Student Photo')}</DialogTitle>
                <DialogDescription id="student-photo-description" className="sr-only">
                    {t('students.full_photo_desc', 'A full size photo of the student.')}
                </DialogDescription>
                {imageUrl && (
                    <p className="bg-transparent text-center">
                        <img
                            src={imageUrl}
                            alt="Face"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        />
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
