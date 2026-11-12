<?php
/**
 * Marca de lectura de los mensajes (leads) para la bandeja del panel:
 * null = sin leer.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->timestamp('read_at')->nullable()->after('note');
            $table->index(['space_id', 'read_at']);
            $table->index(['review_target_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['space_id', 'read_at']);
            $table->dropIndex(['review_target_id', 'read_at']);
            $table->dropColumn('read_at');
        });
    }
};
