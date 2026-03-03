<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleSuperadmin = Role::firstOrCreate(['name' => 'Superadmin']);
        $roleAdmin = Role::firstOrCreate(['name' => 'Admin']);

        // Superadmin
        $superadmin = User::where('email', 'abdurahmanislam304@gmail.com')
            ->orWhere('phone', '+998911157709')
            ->first();

        if ($superadmin) {
            $superadmin->update([
                'email' => 'abdurahmanislam304@gmail.com',
                'phone' => '+998911157709',
                'name' => 'Superadmin',
                'password' => Hash::make('11221122aa.A'),
            ]);
        }
        else {
            $superadmin = User::create([
                'email' => 'abdurahmanislam304@gmail.com',
                'phone' => '+998911157709',
                'name' => 'Superadmin',
                'password' => Hash::make('11221122aa.A'),
            ]);
        }
        $superadmin->assignRole($roleSuperadmin);

        // Admin
        $admin = User::where('email', 'admin@gmail.com')
            ->orWhere('phone', '+998901234567')
            ->first();

        if ($admin) {
            $admin->update([
                'email' => 'admin@gmail.com',
                'phone' => '+998901234567',
                'name' => 'Admin',
                'password' => Hash::make('11221122'),
            ]);
        }
        else {
            $admin = User::create([
                'email' => 'admin@gmail.com',
                'phone' => '+998901234567',
                'name' => 'Admin',
                'password' => Hash::make('11221122'),
            ]);
        }
        $admin->assignRole($roleAdmin);

        Setting::firstOrCreate(
        ['key' => 'branch_limit'],
        ['value' => '1']
        );
    }
}