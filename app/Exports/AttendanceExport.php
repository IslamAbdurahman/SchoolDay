<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class AttendanceExport implements FromCollection, WithHeadings, WithMapping
{
    protected $collection;

    public function __construct(Collection $collection)
    {
        $this->collection = $collection;
    }

    public function collection()
    {
        return $this->collection;
    }

    public function headings(): array
    {
        return [
            'Sana',
            'O\'quvchi',
            'Sinf',
            'Kirish',
            'Chiqish',
            'Status',
        ];
    }

    public function map($item): array
    {
        $status = '';
        if ($item->is_absent_placeholder) {
            $status = 'Kelmagan';
        } else {
            if ($item->is_late) {
                $status = 'Kechikkan';
            } else {
                $status = 'Vaqtida';
            }

            if ($item->is_left_early && $item->last_check_out) {
                $status .= ', Vaqtidan oldin ketgan';
            }
        }

        return [
            $item->date instanceof Carbon ? $item->date->toDateString() : substr($item->date, 0, 10),
            $item->student?->name ?? 'Noma\'lum',
            $item->student?->schoolClass?->name ?? '-',
            $item->first_check_in ? Carbon::parse($item->first_check_in)->format('H:i') : '-',
            $item->last_check_out ? Carbon::parse($item->last_check_out)->format('H:i') : '-',
            $status,
        ];
    }
}
