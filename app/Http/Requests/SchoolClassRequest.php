<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SchoolClassRequest extends FormRequest
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
            'shift_id' => 'required|exists:shifts,id',
            'telegram_group_id' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Sinf nomini kiritish majburiy.',
            'shift_id.required' => 'Smenani tanlash majburiy.',
            'shift_id.exists' => 'Tanlangan smena topilmadi.',
        ];
    }
}
