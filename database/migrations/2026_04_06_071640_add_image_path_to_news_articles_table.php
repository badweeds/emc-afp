<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('news_articles', function (Blueprint $table) {
            // Add the image_path column after the url column
            $table->string('image_path')->nullable()->after('url');
            // Also adding scope (Local, National, International) since we added it to the form
            $table->string('scope')->nullable()->after('summary');
        });
    }

    public function down(): void
    {
        Schema::table('news_articles', function (Blueprint $table) {
            $table->dropColumn(['image_path', 'scope']);
        });
    }
};