<?php
/**
 * Módulo C · Spaces — Bloques ricos.
 * avaspace repartía cada sección (testimonios, diferenciadores, pasos, FAQ,
 * clientes, media, video...) en tablas separadas. Aquí las unificamos en un
 * único `space_blocks` ordenable con un payload JSON `data` por tipo de bloque.
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
        Schema::table('space_blocks', function (Blueprint $table) {
            // Payload estructurado según el tipo de bloque (SpaceBlockType).
            $table->json('data')->nullable()->after('icon');
            // Permite ocultar un bloque sin borrarlo (ya existe is_active),
            // y un título de sección opcional para bloques compuestos.
            $table->string('heading')->nullable()->after('label');
        });
    }

    public function down(): void
    {
        Schema::table('space_blocks', function (Blueprint $table) {
            $table->dropColumn(['data', 'heading']);
        });
    }
};
