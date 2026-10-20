<?php
/**
 * Migración para crear la tabla de espacios de networking (spaces).
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
        Schema::create('spaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('slug')->unique();
            
            // Perfil
            $table->string('display_name');
            $table->string('headline')->nullable();
            $table->string('company')->nullable();
            $table->text('bio')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('cover_url')->nullable();
            
            // Datos de contacto (vCard)
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_website')->nullable();
            
            // Configuración del Tema
            $table->string('theme_template')->default('aurora'); // aurora, bento, editorial, neon, corporate
            $table->json('theme_config')->nullable();
            
            // Ajustes
            $table->boolean('is_public')->default(true);
            $table->boolean('show_branding')->default(true);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spaces');
    }
};
