<?php
/**
 * Control de uso de cada tarjeta de un lote (checklist del admin):
 * cuándo se marcó como utilizada/entregada y una nota (a quién / dónde).
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->timestamp('used_at')->nullable()->after('shipped_at');
            $table->string('used_note', 255)->nullable()->after('used_at');
        });
    }

    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn(['used_at', 'used_note']);
        });
    }
};
