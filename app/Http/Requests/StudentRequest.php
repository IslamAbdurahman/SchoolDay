<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StudentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'telegram_id' => 'nullable|numeric',
            'class_id' => 'required|exists:classes,id',
            'status' => 'nullable|string|in:active,inactive',
            'face_image' => 'nullable|image|max:5120',
            'employeeNoString' => 'nullable|string|max:255',
            // Hikvision fields
            'gender' => 'nullable|string|in:male,female,unknown',
            'user_verify_mode' => 'nullable|string|in:face,cardAndPw,card,faceAndPw,faceAndCard,cardOrfaceOrPw,cardOrFace,faceOrPw',
            'local_ui_right' => 'nullable|boolean',
            'door_right' => 'nullable|string|max:10',
            'plan_template_no' => 'nullable|string|max:10',
            'valid_enabled' => 'nullable|boolean',
            'valid_begin' => 'nullable|date',
            'valid_end' => 'nullable|date|after_or_equal:valid_begin',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O\'quvchi ismini kiritish majburiy.',
            'class_id.required' => 'Sinfni tanlash majburiy.',
            'class_id.exists' => 'Tanlangan sinf topilmadi.',
            'face_image.image' => 'Rasm faylini yuklang.',
            'face_image.max' => 'Rasm hajmi 5MB dan oshmasligi kerak.',
            'telegram_id.numeric' => 'Telegram ID raqamlardan iborat bo\'lishi kerak.',
        ];
    }
}