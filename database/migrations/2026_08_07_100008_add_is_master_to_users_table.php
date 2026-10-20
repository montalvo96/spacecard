<?php
/**
 * SaaS · Usuario maestro (dueño de la plataforma).
 * Un master ve/administra a TODOS los usuarios, gestiona admins y recibe la
 * infraestructura de impresión/configuración de tarjetas. Un master siempre
 * es también admin.
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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_master')->default(false)->after('is_admin');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_master');
        });
    }
};
