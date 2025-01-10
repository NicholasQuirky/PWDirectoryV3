<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            'name' => 'RampITUp Admin',
            'email' => 'pwdirectoryv3main@gmail.com',
            'username' => 'Admin',
            'password' => Hash::make('Pwdirectoryv3admin1!'),
            'usertype' => 'admin',
            'created_at' => now(),
            'updated_at' => now(),
            'email_verified_at' => now(),
        ]);
    }
}
