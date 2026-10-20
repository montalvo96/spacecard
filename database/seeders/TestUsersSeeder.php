<?php
/**
 * Seeder de usuarios de prueba para la plataforma.
 *
 * Genera cuentas con credenciales conocidas (password: "password") y las llena
 * con data real usando los services de los Módulos A, B y C:
 *  - Perfil completo (nickname, teléfono, bio, avatar) — ProfileService
 *  - Un lote de tarjetas, algunas reclamadas, con etiquetas — DeviceProvisioningService
 *  - Un Space con plantilla inicial de secciones + catálogo — SpaceBuilderService
 *
 * Es idempotente: si el email ya existe, omite ese usuario.
 *
 * Uso:  php artisan db:seed --class=TestUsersSeeder
 *
 * Autor: SpaceCard 2.0
 */

namespace Database\Seeders;

use App\Enums\SpaceBlockType;
use App\Models\Space;
use App\Models\User;
use App\Services\DeviceProvisioningService;
use App\Services\ProfileService;
use App\Services\SpaceBuilderService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $profile = app(ProfileService::class);
        $prov    = app(DeviceProvisioningService::class);
        $builder = app(SpaceBuilderService::class);

        foreach ($this->people() as $p) {
            if (User::where('email', $p['email'])->exists()) {
                $this->command?->warn("· {$p['email']} ya existe, se omite.");
                continue;
            }

            // ---- Módulo A: cuenta + perfil ----
            $user = User::create([
                'name'              => $p['name'],
                'email'             => $p['email'],
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'plan'              => $p['plan'],
                'plan_expires_at'   => $p['plan'] === 'pro' ? now()->addYear() : null,
            ]);
            $profile->updateProfile($user, [
                'phone'      => $p['phone'],
                'bio'        => $p['bio'],
                'avatar_url' => $p['avatar'],
            ]);
            $profile->changeNickname($user, $p['nickname']);
            $user->activate();

            // ---- Módulo C: Space con plantilla + catálogo ----
            $space = Space::create([
                'owner_id'        => $user->id,
                'slug'            => $p['nickname'],
                'display_name'    => $p['name'],
                'headline'        => $p['headline'],
                'company'         => $p['company'],
                'bio'             => $p['bio'],
                'avatar_url'      => $p['avatar'],
                'contact_phone'   => $p['phone'],
                'contact_email'   => $p['email'],
                'theme_template'  => $p['theme'],
                'is_public'       => true,
                'show_branding'   => $p['plan'] === 'free',
            ]);
            $builder->applyStarterTemplate($space);

            // Un enlace social real + catálogo de ejemplo
            $builder->addBlock($space, SpaceBlockType::Social, [
                'label' => 'Instagram',
                'url'   => "https://instagram.com/{$p['nickname']}",
                'icon'  => 'instagram',
            ]);
            $cat = $builder->addCategory($space, 'Servicios');
            foreach ($p['products'] as $prod) {
                $builder->addProduct($space, $prod + ['category_id' => $cat->id]);
            }

            // ---- Módulo B: lote de tarjetas, reclamar, etiquetar ----
            $batch = $prov->provisionBatch($user, "Lote de {$p['name']}", 'card', 3, 'Seed de prueba');
            $card  = $batch->devices->first();
            $prov->claim($card, $user);
            $card->forceFill(['destination_type' => 'space', 'space_id' => $space->id])->save();
            $prov->generateQr($card);
            $prov->markPrinted($card);

            $tag = $user->deviceTags()->create(['name' => 'Principal', 'color' => '#22c55e']);
            $card->tags()->attach($tag->id);

            $this->command?->info("✓ {$p['name']}  ({$p['email']})  nick=@{$p['nickname']}  space=/{$space->slug}  card={$card->code}");
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function people(): array
    {
        return [
            [
                'name' => 'Ana Torres', 'email' => 'ana@test.com', 'nickname' => 'anatorres',
                'plan' => 'pro', 'phone' => '+52 55 1111 2222',
                'headline' => 'Coach de Ventas B2B', 'company' => 'Impulsa',
                'bio' => 'Ayudo a equipos comerciales a cerrar más y mejor.',
                'avatar' => 'https://i.pravatar.cc/150?img=47', 'theme' => 'aurora',
                'products' => [
                    ['name' => 'Sesión 1:1', 'price' => 1200, 'description' => 'Coaching individual 60 min'],
                    ['name' => 'Taller de equipo', 'price' => 8500, 'description' => 'Medio día in-company'],
                ],
            ],
            [
                'name' => 'Carlos Ramírez', 'email' => 'carlos@test.com', 'nickname' => 'carlosr',
                'plan' => 'free', 'phone' => '+52 33 3333 4444',
                'headline' => 'Fotógrafo de producto', 'company' => 'Estudio CR',
                'bio' => 'Hago que tus productos se vean irresistibles.',
                'avatar' => 'https://i.pravatar.cc/150?img=12', 'theme' => 'neon',
                'products' => [
                    ['name' => 'Paquete 10 fotos', 'price' => 2500, 'description' => 'Fondo blanco + edición'],
                ],
            ],
            [
                'name' => 'Sofía Herrera', 'email' => 'sofia@test.com', 'nickname' => 'sofiah',
                'plan' => 'pro', 'phone' => '+52 81 5555 6666',
                'headline' => 'Nutrióloga clínica', 'company' => 'NutreBien',
                'bio' => 'Planes de alimentación personalizados y sostenibles.',
                'avatar' => 'https://i.pravatar.cc/150?img=5', 'theme' => 'editorial',
                'products' => [
                    ['name' => 'Plan mensual', 'price' => 900, 'description' => 'Seguimiento + menús'],
                    ['name' => 'Primera consulta', 'price' => 600, 'description' => 'Valoración completa'],
                ],
            ],
            [
                'name' => 'Diego Flores', 'email' => 'diego@test.com', 'nickname' => 'diegof',
                'plan' => 'free', 'phone' => '+52 55 7777 8888',
                'headline' => 'Desarrollador web freelance', 'company' => 'DF Studio',
                'bio' => 'Sitios rápidos y a la medida en Laravel + Vue.',
                'avatar' => 'https://i.pravatar.cc/150?img=33', 'theme' => 'corporate',
                'products' => [
                    ['name' => 'Landing page', 'price' => 6000, 'description' => 'Diseño + desarrollo'],
                ],
            ],
            [
                'name' => 'Valeria Cruz', 'email' => 'valeria@test.com', 'nickname' => 'valeriacruz',
                'plan' => 'pro', 'phone' => '+52 55 9999 0000',
                'headline' => 'Agente inmobiliaria', 'company' => 'Casas MX',
                'bio' => 'Encuentra tu hogar ideal sin complicaciones.',
                'avatar' => 'https://i.pravatar.cc/150?img=20', 'theme' => 'bento',
                'products' => [
                    ['name' => 'Asesoría de compra', 'price' => 0, 'description' => 'Sin costo para compradores'],
                ],
            ],
        ];
    }
}
