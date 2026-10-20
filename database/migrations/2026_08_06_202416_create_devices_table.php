<?php
/**
 * Migración para crear la tabla de dispositivos físicos (devices).
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
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type'); // card, bracelet, review_plate, sticker, keychain
            $table->boolean('has_qr')->default(true);
            $table->string('status')->default('stock'); // stock, claimed, disabled
            
            // Asignación de dueño
            $table->foreignId('owner_id')->nullable()->index()->constrained('users')->onDelete('set null');
            $table->dateTime('claimed_at')->nullable();
            
            // Destinos del redireccionamiento
            $table->string('destination_type')->default('none'); // space, external, review, none
            $table->text('external_url')->nullable();
            $table->foreignId('space_id')->nullable()->constrained('spaces')->onDelete('set null');
            $table->foreignId('review_target_id')->nullable()->constrained('review_targets')->onDelete('set null');
            
            // Personalización física para impresión / fábrica
            $table->string('design_logo_url')->nullable();
            $table->string('design_color_primary')->nullable();
            $table->string('design_color_secondary')->nullable();
            
            // Lote de producción
            $table->foreignId('batch_id')->nullable()->constrained('device_batches')->onDelete('set null');
            
            // Relación con artículo de compra
            $table->foreignId('order_item_id')->nullable()->constrained('order_items')->onDelete('set null');
            
            $table->timestamps();
            
            // Índices adicionales
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
