<?php
/**
 * Módulo B · Tarjetas — Etiquetas.
 * Reemplaza la clase `Etiquetas` de avaspace: cada usuario agrupa/clasifica
 * sus dispositivos con etiquetas de color. Relación N:M vía pivote.
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
        Schema::create('device_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 16)->nullable(); // hex, ej. #22c55e
            $table->timestamps();

            $table->unique(['owner_id', 'name']);
        });

        Schema::create('device_device_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
            $table->foreignId('device_tag_id')->constrained('device_tags')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['device_id', 'device_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_device_tag');
        Schema::dropIfExists('device_tags');
    }
};
