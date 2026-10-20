<?php
/**
 * SpaceShop · Vincula la orden con el usuario comprador (si tiene sesión).
 * Permite que la tarjeta comprada se refleje en su cuenta y que el maestro
 * sepa a qué usuario corresponde cada tarjeta para enviársela.
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
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
