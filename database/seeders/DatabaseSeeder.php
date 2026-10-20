<?php
/**
 * Seeder principal de la base de datos (DatabaseSeeder).
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace Database\Seeders;

use App\Models\User;
use App\Models\Device;
use App\Models\DeviceBatch;
use App\Models\Space;
use App\Models\SpaceBlock;
use App\Models\ReviewTarget;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear Administrador de Avaspace
        $admin = User::create([
            'name' => 'Avaspace Admin',
            'email' => 'admin@avaspaceio.com',
            'password' => Hash::make('password'),
            'plan' => 'pro',
            'is_admin' => true,
        ]);

        // 2. Crear Usuario Free de prueba
        $juan = User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'password' => Hash::make('password'),
            'plan' => 'free',
            'is_admin' => false,
        ]);

        // 3. Crear Usuario Pro de prueba
        $maria = User::create([
            'name' => 'María López',
            'email' => 'maria@example.com',
            'password' => Hash::make('password'),
            'plan' => 'pro',
            'plan_expires_at' => now()->addYear(),
            'is_admin' => false,
        ]);

        // 4. Crear Lotes de manufactura para pruebas
        $batchNetworking = DeviceBatch::create([
            'name' => 'Lote Inicial Networking Card',
            'type' => 'card',
            'quantity' => 10,
            'notes' => 'Lote de tarjetas inteligentes para networking personal y corporativo.',
            'created_by' => $admin->id,
        ]);

        $batchReviews = DeviceBatch::create([
            'name' => 'Lote Inicial Placas de Reviews',
            'type' => 'review_plate',
            'quantity' => 10,
            'notes' => 'Placas NFC/QR de mesa para capturar reseñas de Google.',
            'created_by' => $admin->id,
        ]);

        // 5. Crear Datos para el usuario Free (Juan Pérez)
        // Juan no tiene Space (networking), prefiere un link externo dinámico.
        $juanDevice = Device::create([
            'code' => 'SPC-JUAN-NFC1',
            'type' => 'card',
            'has_qr' => true,
            'status' => 'claimed',
            'owner_id' => $juan->id,
            'claimed_at' => now()->subDays(5),
            'destination_type' => 'external',
            'external_url' => 'https://www.linkedin.com/in/juan-perez-marketing',
            'batch_id' => $batchNetworking->id,
        ]);

        // 6. Crear Datos para el usuario Pro (María López)
        // María tiene una tarjeta de networking que apunta a su Space
        $mariaSpace = Space::create([
            'owner_id' => $maria->id,
            'slug' => 'maria-lopez',
            'display_name' => 'María López',
            'headline' => 'Consultora de Negocios Digitales & UX',
            'company' => 'Avaspace Solutions',
            'bio' => 'Apasionada por crear productos y experiencias digitales memorables. Conéctate conmigo para transformar tu marca.',
            'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
            'cover_url' => 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
            'contact_phone' => '+521234567890',
            'contact_email' => 'maria@example.com',
            'contact_website' => 'https://avaspaceio.com',
            'theme_template' => 'aurora',
            'theme_config' => [
                'layout' => 'stack',
                'background' => 'mesh',
                'palette' => [
                    'primary' => '#ff007f',
                    'secondary' => '#7f00ff',
                    'background' => '#0c0b14',
                    'text' => '#ffffff',
                ],
                'font_pair' => 'Outfit_Inter',
                'button_style' => 'glass',
                'corner_radius' => '16px',
                'avatar_shape' => 'squircle',
            ],
            'is_public' => true,
            'show_branding' => false, // Pro puede ocultar branding
        ]);

        // Bloques del Space de María
        SpaceBlock::create([
            'space_id' => $mariaSpace->id,
            'type' => 'header',
            'label' => 'Mis Canales Oficiales',
            'position' => 1,
            'is_active' => true,
        ]);

        SpaceBlock::create([
            'space_id' => $mariaSpace->id,
            'type' => 'link',
            'label' => 'Mi Portafolio Web',
            'url' => 'https://avaspaceio.com/maria-lopez',
            'icon' => 'globe',
            'position' => 2,
            'is_active' => true,
        ]);

        SpaceBlock::create([
            'space_id' => $mariaSpace->id,
            'type' => 'social',
            'label' => 'Sígueme en Instagram',
            'url' => 'https://instagram.com/maria_digital',
            'icon' => 'instagram',
            'position' => 3,
            'is_active' => true,
        ]);

        SpaceBlock::create([
            'space_id' => $mariaSpace->id,
            'type' => 'whatsapp',
            'label' => 'Escríbeme por WhatsApp',
            'url' => 'https://wa.me/521234567890',
            'icon' => 'whatsapp',
            'position' => 4,
            'is_active' => true,
        ]);

        // Vincular tarjeta de María a su Space
        $mariaDeviceCard = Device::create([
            'code' => 'SPC-MARI-CARD',
            'type' => 'card',
            'has_qr' => true,
            'status' => 'claimed',
            'owner_id' => $maria->id,
            'claimed_at' => now()->subDays(10),
            'destination_type' => 'space',
            'space_id' => $mariaSpace->id,
            'batch_id' => $batchNetworking->id,
        ]);

        // María también tiene una placa de reviews (negocio local: "Café Bonito")
        $mariaReviewTarget = ReviewTarget::create([
            'owner_id' => $maria->id,
            'business_name' => 'Café Bonito',
            'platform' => 'google',
            'place_id' => 'ChIJ2d2G245u0oUR5hJ1K3J9z8A', // Place ID ficticio
            'review_url' => 'https://search.google.com/local/writereview?placeid=ChIJ2d2G245u0oUR5hJ1K3J9z8A',
            'feedback_enabled' => true, // Feedback opcional sin gating habilitado
        ]);

        // Vincular placa de reviews de María a su target
        $mariaDevicePlate = Device::create([
            'code' => 'SPC-MARI-PLAT',
            'type' => 'review_plate',
            'has_qr' => true,
            'status' => 'claimed',
            'owner_id' => $maria->id,
            'claimed_at' => now()->subDays(10),
            'destination_type' => 'review',
            'review_target_id' => $mariaReviewTarget->id,
            'batch_id' => $batchReviews->id,
        ]);

        // 7. Generar Dispositivos de prueba en Stock (listos para ser reclamados)
        // 3 Tarjetas en stock
        for ($i = 0; $i < 3; $i++) {
            Device::create([
                'code' => Device::generateUniqueCode(),
                'type' => 'card',
                'has_qr' => true,
                'status' => 'stock',
                'batch_id' => $batchNetworking->id,
            ]);
        }

        // 3 Pulseras en stock (has_qr => false)
        for ($i = 0; $i < 3; $i++) {
            Device::create([
                'code' => Device::generateUniqueCode(),
                'type' => 'bracelet',
                'has_qr' => false,
                'status' => 'stock',
                'batch_id' => $batchNetworking->id,
            ]);
        }

        // 3 Placas de reviews en stock
        for ($i = 0; $i < 3; $i++) {
            Device::create([
                'code' => Device::generateUniqueCode(),
                'type' => 'review_plate',
                'has_qr' => true,
                'status' => 'stock',
                'batch_id' => $batchReviews->id,
            ]);
        }
    }
}
