<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Add status column with default value 'pending'
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->after('feedback');
            
            // Add soft delete column
            $table->softDeletes()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Drop status column
            $table->dropColumn('status');
            
            // Drop soft deletes column
            $table->dropSoftDeletes();
        });
    }
};
