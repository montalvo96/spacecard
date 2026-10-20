<?php
/**
 * Módulo B · Tarjetas.
 * Añade a `devices` los estados de producción de avaspace:
 * impreso / enviado y la marca de generación de QR.
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
        Schema::table('devices', function (Blueprint $table) {
            $table->dateTime('printed_at')->nullable()->after('claimed_at');
            $table->dateTime('shipped_at')->nullable()->after('printed_at');
            $table->dateTime('qr_generated_at')->nullable()->after('shipped_at');
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn(['printed_at', 'shipped_at', 'qr_generated_at']);
        });
    }
};
