<?php
/**
 * Comando: crear o promover al usuario maestro (dueño SaaS).
 *
 *   php artisan spacecard:make-master correo@dominio.com
 *   php artisan spacecard:make-master correo@dominio.com --name="Nombre" --password="secreta"
 *
 * Si el usuario ya existe, lo promueve a maestro (y admin). Si no, lo crea.
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MakeMasterUser extends Command
{
    protected $signature = 'spacecard:make-master
                            {email : Correo del usuario maestro}
                            {--name= : Nombre a mostrar (si se crea)}
                            {--password= : Contraseña (si se omite, se genera una)}';

    protected $description = 'Crea o promueve al usuario maestro (dueño de la plataforma SaaS).';

    public function handle(): int
    {
        $email = strtolower(trim($this->argument('email')));
        $password = $this->option('password');
        $generated = false;

        if (empty($password)) {
            $password = Str::password(14);
            $generated = true;
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->forceFill([
                'is_master' => true,
                'is_admin'  => true,
                'plan'      => 'pro',
                'plan_expires_at' => now()->addYears(10),
            ]);
            if ($this->option('password')) {
                $user->password = Hash::make($password);
            }
            $user->save();
            $this->info("✓ Usuario existente promovido a MAESTRO: {$email}");
        } else {
            $user = User::create([
                'name'              => $this->option('name') ?: 'Master',
                'email'             => $email,
                'password'          => Hash::make($password),
                'email_verified_at' => now(),
                'is_master'         => true,
                'is_admin'          => true,
                'plan'              => 'pro',
                'plan_expires_at'   => now()->addYears(10),
                'activated_at'      => now(),
            ]);
            $this->info("✓ Usuario MAESTRO creado: {$email}");
        }

        $this->newLine();
        $this->line('  <fg=cyan>Correo:</>     ' . $email);
        if ($generated || $this->option('password')) {
            $this->line('  <fg=cyan>Contraseña:</> ' . $password);
            if ($generated) {
                $this->warn('  Guarda esta contraseña ahora. Cámbiala tras iniciar sesión.');
            }
        } else {
            $this->line('  <fg=cyan>Contraseña:</> (sin cambios — usa la existente)');
        }
        $this->line('  <fg=cyan>Panel:</>      /admin');

        return self::SUCCESS;
    }
}
