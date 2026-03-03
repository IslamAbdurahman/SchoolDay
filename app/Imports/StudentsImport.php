<?php

namespace App\Imports;

use App\Models\Student;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class StudentsImport implements ToCollection, WithHeadingRow, WithChunkReading, ShouldQueue
{
    protected $classId;

    public function __construct($classId)
    {
        $this->classId = $classId;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            try {
                // Determine array depending on whether $row is array or Collection
                $rowArray = is_array($row) ? $row : $row->toArray();
                $lowerRow = array_change_key_case($rowArray, CASE_LOWER);

                $name = $lowerRow['name'] ?? $lowerRow['ism'] ?? null;
                $phone = $lowerRow['phone'] ?? $lowerRow['telefon'] ?? null;
                $jins = $lowerRow['gender'] ?? $lowerRow['jins'] ?? null;

                if (empty($name)) {
                    continue;
                }

                if ($phone) {
                    $phone = trim((string)$phone);
                    if (!str_starts_with($phone, '+')) {
                        $phone = '+' . $phone;
                    }
                }

                $gender = 'unknown';
                if ($jins !== null) {
                    if ((string)$jins === '0' || strtolower((string)$jins) === 'ayol' || strtolower((string)$jins) === 'female') {
                        $gender = 'female';
                    }
                    elseif ((string)$jins === '1' || strtolower((string)$jins) === 'erkak' || strtolower((string)$jins) === 'male') {
                        $gender = 'male';
                    }
                }

                $student = Student::create([
                    'name' => $name,
                    'phone' => $phone ? (string)$phone : null,
                    'class_id' => $this->classId,
                    'gender' => $gender,
                    'status' => 'active',
                    'local_ui_right' => false,
                    'valid_enabled' => false,
                ]);

                // Update employeeNoString based on auto-incrementing ID
                $student->update(['employeeNoString' => (string)$student->id]);

            }
            catch (\Exception $e) {
                Log::error("Excel Import Student xatoligi: " . $e->getMessage(), ['row' => $row]);
                continue;
            }
        }
    }

    public function chunkSize(): int
    {
        return 100;
    }
}