<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateNotificationsTableForMultipleForeignKeys extends Migration
{
    public function up()
    {
        Schema::table('notifications', function (Blueprint $table) {        
            // Add the new foreign keys
            $table->unsignedBigInteger('submittedby')->nullable();
            $table->unsignedBigInteger('reviewedbyadmin')->nullable();
    
            // Add foreign key constraints for the new columns
            $table->foreign('submittedby')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('reviewedbyadmin')->references('id')->on('users')->onDelete('set null');
        });
    }
    
    public function down()
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Drop the new columns and foreign keys if rolling back
            $table->dropForeign(['submittedby']);
            $table->dropForeign(['reviewedbyadmin']);
            
            $table->dropColumn('submittedby');
            $table->dropColumn('reviewedbyadmin');
    
            // Re-add the original 'user_id' column with the foreign key constraint
            $table->unsignedBigInteger('user_id')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
} 