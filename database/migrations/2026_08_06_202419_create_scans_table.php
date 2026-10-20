<?php
/**
 * Migración para crear la tabla de escaneos y analíticas (scans).
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
        Schema::create('scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->onDelete('cascade');
            $table->foreignId('space_id')->nullable()->constrained('spaces')->onDelete('set null');
            $table->foreignId('review_target_id')->nullable()->constrained('review_targets')->onDelete('set null');
            $table->dateTime('scanned_at')->index();
            $table->string('ip');
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('device_family'); // mobile, tablet, desktop
            $table->text('referrer')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scans');
    }
};
