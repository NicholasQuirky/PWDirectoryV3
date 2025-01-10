<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReviewsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id(); // id (int, auto-increment)
            $table->string('placeid', 255); // placeid (varchar 255)
            $table->integer('rating'); // rating (int)
            $table->text('feedback'); // feedback (text)
            $table->string('imagepath')->nullable(); // imagepath (varchar), nullable in case no image is attached
            $table->timestamps(); // created_at and updated_at (timestamp)
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reviews');
    }
}
