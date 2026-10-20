<?php
/**
 * Módulo C · Spaces — Catálogo (categorías).
 * Equivale a CATEGORIAS_SPACE_PERSONAL de avaspace.
 *
 * Autor: SpaceCard 2.0
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('space_product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->cascadeOnDelete();
            $table->string('name');
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->index(['space_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_product_categories');
    }
};
