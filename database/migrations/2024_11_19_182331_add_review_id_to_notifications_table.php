<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReviewIdToNotificationsTable extends Migration
{
    public function up()
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Add review_id as a foreign key column
            $table->unsignedBigInteger('review_id')->nullable()->after('submittedby'); // Adjust the position if needed

            // Create a foreign key constraint to the reviews table
            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Drop the foreign key constraint and column if we roll back the migration
            $table->dropForeign(['review_id']);
            $table->dropColumn('review_id');
        });
    }
}