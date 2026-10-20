<?php
/**
 * SpaceShop · Guarda el diseño completo de la tarjeta (2 caras): fondos,
 * posiciones de logo/QR/textos e información de negocio. Estructura flexible
 * para el diseñador visual.
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
        Schema::table('order_items', function (Blueprint $table) {
            $table->json('design_config')->nullable()->after('logo_url');
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('design_config');
        });
    }
};
