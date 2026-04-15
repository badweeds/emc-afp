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
        Schema::create('news_articles', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('title');
            $table->string('scope')->nullable(); // Added Scope (Local/National/International)
            $table->string('media_outlet'); // From Media.csv
            $table->string('reporter')->nullable(); // From Reporter.csv
            $table->string('unit_involved'); // 10ID, 4ID, EMC, etc.
            $table->string('topic'); // Accomplishment, Encounter, etc.
            $table->enum('category', ['Favorable', 'Neutral', 'Unfavorable']);
            $table->text('summary')->nullable();
            $table->string('url')->nullable();
            $table->string('image_path')->nullable(); // Added Image Path for screenshots
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_articles');
    }
};