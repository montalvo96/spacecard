<?php
/**
 * Módulo A · Cuentas.
 * Extiende `users` con los campos de perfil que aportaba avaspace:
 * nickname (con control de cambio), teléfono, bio, foto, activación y referido.
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
            $table->string('nickname')->nullable()->unique()->after('email');
            $table->dateTime('nickname_changed_at')->nullable()->after('nickname');
            $table->string('phone', 32)->nullable()->after('nickname_changed_at');
            $table->text('bio')->nullable()->after('phone');
            $table->string('avatar_url')->nullable()->after('bio');
            $table->dateTime('activated_at')->nullable()->after('avatar_url');
            $table->foreignId('invited_by')->nullable()->after('activated_at')
                ->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('invited_by');
            $table->dropColumn([
                'nickname', 'nickname_changed_at', 'phone',
                'bio', 'avatar_url', 'activated_at',
            ]);
        });
    }
};
