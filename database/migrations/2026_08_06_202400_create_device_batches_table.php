<?php
/**
 * Migración para crear la tabla de lotes de dispositivos (device_batches).
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
        Schema::create('device_batches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // card, bracelet, review_plate, sticker, keychain
            $table->integer('quantity');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('device_batches');
    }
};
