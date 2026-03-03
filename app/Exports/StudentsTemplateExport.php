<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class StudentsTemplateExport implements FromArray, WithHeadings
{
    public function array(): array
    {
        return [
            [
                'name' => 'Ali Valiyev',
                'phone' => '+998901234567',
                'gender' => '1',
            ],
            [
                'name' => 'Guli Valiyeva',
                'phone' => '+998901234568',
                'gender' => '0',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'name',
            'phone',
            'gender',
        ];
    }
}