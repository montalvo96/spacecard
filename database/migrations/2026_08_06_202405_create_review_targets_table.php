<?php
/**
 * Migración para crear la tabla de destinos de reseñas (review_targets).
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

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
        Schema::create('review_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('business_name');
            $table->string('platform')->default('google'); // google, facebook, tripadvisor
            $table->string('place_id')->nullable();
            $table->text('review_url')->nullable();
            $table->boolean('feedback_enabled')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_targets');
    }
};
