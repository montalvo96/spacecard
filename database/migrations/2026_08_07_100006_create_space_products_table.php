<?php
/**
 * Módulo C · Spaces — Catálogo (productos).
 * Equivale a la tabla `productos` de avaspace, pero acotado a un Space.
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
        Schema::create('space_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()
                ->constrained('space_product_categories')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->string('currency', 3)->default('MXN');
            $table->string('image_url')->nullable();
            $table->string('cta_url')->nullable();       // link de compra / WhatsApp
            $table->boolean('is_active')->default(true);
            $table->integer('position')->default(0);
            $table->timestamps();

            $table->index(['space_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_products');
    }
};
