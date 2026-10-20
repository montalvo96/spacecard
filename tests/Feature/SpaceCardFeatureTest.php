<?php
/**
 * Pruebas de integración automatizadas para SpaceCard (Resolvedor, Reclamos, vCard).
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace Tests\Feature;

use App\Models\Device;
use App\Models\DeviceBatch;
use App\Models\Space;
use App\Models\ReviewTarget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use App\Jobs\RegisterScanJob;
use Tests\TestCase;

class SpaceCardFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $user;
    protected DeviceBatch $batch;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear usuarios de prueba
        $this->admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@avaspaceio.com',
            'password' => bcrypt('password'),
            'plan' => 'pro',
            'is_admin' => true
        ]);

        $this->user = User::create([
            'name' => 'Regular User',
            'email' => 'user@avaspaceio.com',
            'password' => bcrypt('password'),
            'plan' => 'free',
            'is_admin' => false
        ]);

        // Crear lote
        $this->batch = DeviceBatch::create([
            'name' => 'Lote Test',
            'type' => 'card',
            'quantity' => 10,
            'created_by' => $this->admin->id
        ]);
    }

    /**
     * Prueba que el resolvedor de dispositivos maneja un dispositivo desactivado.
     */
    public function test_resolver_handles_disabled_device(): void
    {
        $device = Device::create([
            'code' => 'SPC-TEST-DISA',
            'type' => 'card',
            'status' => 'disabled',
            'batch_id' => $this->batch->id
        ]);

        $response = $this->get(route('devices.resolve', ['code' => $device->code]));

        $response->assertStatus(200);
        $response->assertViewIs('devices.disabled');
    }

    /**
     * Prueba que el resolvedor lleva a claim si el dispositivo está en stock.
     */
    public function test_resolver_redirects_stock_to_claim_landing(): void
    {
        $device = Device::create([
            'code' => 'SPC-TEST-STOC',
            'type' => 'card',
            'status' => 'stock',
            'batch_id' => $this->batch->id
        ]);

        $response = $this->get(route('devices.resolve', ['code' => $device->code]));

        $response->assertRedirect(route('devices.claim.landing', ['code' => $device->code]));
        $this->assertEquals($device->code, session('claim_code'));
    }

    /**
     * Prueba que el resolvedor redirige a enlaces externos de forma directa.
     */
    public function test_resolver_redirects_claimed_device_to_external_url(): void
    {
        Queue::fake();

        $device = Device::create([
            'code' => 'SPC-TEST-EXTE',
            'type' => 'card',
            'status' => 'claimed',
            'owner_id' => $this->user->id,
            'destination_type' => 'external',
            'external_url' => 'https://example.com/externallink',
            'batch_id' => $this->batch->id
        ]);

        $response = $this->get(route('devices.resolve', ['code' => $device->code]));

        $response->assertRedirect('https://example.com/externallink');
        Queue::assertPushed(RegisterScanJob::class);
    }

    /**
     * Prueba que un usuario autenticado puede reclamar un dispositivo.
     */
    public function test_authenticated_user_can_claim_device(): void
    {
        $device = Device::create([
            'code' => 'SPC-TEST-CLAI',
            'type' => 'card',
            'status' => 'stock',
            'batch_id' => $this->batch->id
        ]);

        $response = $this->actingAs($this->user)
            ->post(route('devices.claim.confirm', ['code' => $device->code]));

        $response->assertRedirect(route('dashboard'));
        
        $device->refresh();
        $this->assertEquals('claimed', $device->status);
        $this->assertEquals($this->user->id, $device->owner_id);
    }

    /**
     * Prueba que se genera la vCard correctamente.
     */
    public function test_vcard_generation_returns_valid_vcf(): void
    {
        $space = Space::create([
            'owner_id' => $this->user->id,
            'slug' => 'test-profile',
            'display_name' => 'John Doe',
            'contact_phone' => '12345678',
            'contact_email' => 'john@doe.com'
        ]);

        $response = $this->get(route('spaces.vcard', ['slug' => $space->slug]));

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/vcard; charset=utf-8');
        
        $content = $response->getContent();
        $this->assertStringContainsString('BEGIN:VCARD', $content);
        $this->assertStringContainsString('FN:John Doe', $content);
        $this->assertStringContainsString('TEL;TYPE=CELL,VOICE:12345678', $content);
        $this->assertStringContainsString('EMAIL;TYPE=PREFER,INTERNET:john@doe.com', $content);
        $this->assertStringContainsString('END:VCARD', $content);
    }

    /**
     * Prueba que el formulario público de compras renderiza correctamente.
     */
    public function test_public_shop_renders_correctly(): void
    {
        $response = $this->get(route('shop.comprar'));
        $response->assertStatus(200);
        $response->assertSee('Configura tu Dispositivo');
    }

    /**
     * Prueba que el checkout público crea la orden y los order_items correspondientes.
     */
    public function test_checkout_creates_order_and_items(): void
    {
        $response = $this->post(route('shop.checkout'), [
            'product_type' => 'card',
            'quantity' => 2,
            'color_primary' => '#ff0055',
            'color_secondary' => '#000000',
            'customer_name' => 'Comprador Test',
            'customer_email' => 'comprador@test.com',
            'shipping_address' => 'Dirección de Prueba 123'
        ]);

        $order = \App\Models\Order::where('customer_email', 'comprador@test.com')->first();
        $this->assertNotNull($order);
        $this->assertEquals('paid', $order->status);
        $this->assertEquals(59.98, $order->total); // 29.99 * 2

        $item = $order->items()->first();
        $this->assertNotNull($item);
        $this->assertEquals('card', $item->product_type);
        $this->assertEquals(2, $item->quantity);
        $this->assertEquals('#ff0055', $item->color_primary);

        $response->assertRedirect(route('shop.success', ['id' => $order->id]));
    }

    /**
     * Prueba que el administrador genera los dispositivos a partir del pedido pagado.
     */
    public function test_admin_generates_devices_from_paid_order(): void
    {
        // 1. Crear pedido pagado
        $order = \App\Models\Order::create([
            'status' => 'paid',
            'customer_name' => 'Comprador Admin',
            'customer_email' => 'admincompras@test.com',
            'shipping_address' => 'Dirección Admin 456',
            'total' => 39.99
        ]);

        $item = \App\Models\OrderItem::create([
            'order_id' => $order->id,
            'product_type' => 'review_plate',
            'quantity' => 1,
            'price' => 39.99
        ]);

        // 2. Ejecutar acción de procesamiento admin
        $response = $this->actingAs($this->admin)
            ->post(route('admin.orders.generate', ['id' => $order->id]));

        $response->assertRedirect();
        
        $order->refresh();
        $this->assertEquals('completed', $order->status);

        // Verificar que se creó el dispositivo físico en stock con los detalles correspondientes
        $device = Device::where('order_item_id', $item->id)->first();
        $this->assertNotNull($device);
        $this->assertEquals('stock', $device->status);
        $this->assertEquals('review_plate', $device->type);
        $this->assertTrue($device->has_qr);
    }
}
