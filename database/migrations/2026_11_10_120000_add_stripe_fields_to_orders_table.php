<?php
/**
 * Agrega a las órdenes los datos del pago con Stripe Checkout.
 *
 * Última modificación: 2026-11-10
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('stripe_session_id')->nullable()->unique()->after('total');
            $table->string('stripe_payment_intent_id')->nullable()->after('stripe_session_id');
            $table->timestamp('paid_at')->nullable()->after('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['stripe_session_id']);
            $table->dropColumn(['stripe_session_id', 'stripe_payment_intent_id', 'paid_at']);
        });
    }
};
