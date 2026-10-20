<?php
/**
 * Migración para crear la tabla de bloques modulares de un espacio (space_blocks).
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
        Schema::create('space_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->onDelete('cascade');
            $table->string('type'); // link, social, header, email, phone, whatsapp, file, embed
            $table->string('label');
            $table->text('url')->nullable();
            $table->string('icon')->nullable();
            $table->integer('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('space_blocks');
    }
};
