<?php
/**
 * Migración para crear la tabla de artículos de pedido (order_items).
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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('product_type'); // card, bracelet, review_plate
            $table->integer('quantity');
            
            // Personalización física del tag
            $table->string('color_primary')->nullable(); // HEX o color literal
            $table->string('color_secondary')->nullable(); // HEX o color literal
            $table->string('logo_url')->nullable(); // Imagen del logotipo del cliente
            
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
