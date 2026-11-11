<?php
/**
 * Limpieza de los pedidos de prueba que hacen los administradores en SpaceShop
 * (sin pago). Solo borra pedidos marcados como prueba, junto con las tarjetas
 * que se hayan generado para ellos y sus lotes automáticos si quedan vacíos.
 */

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceBatch;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class TestOrderController extends Controller
{
    public function destroy(int $id)
    {
        $order = Order::with('items')->findOrFail($id);

        if (!$order->is_test) {
            return redirect()->back()->with('error', 'Solo se pueden borrar pedidos de prueba.');
        }

        $folio = '#SPC-' . (10000 + $order->id);

        DB::transaction(function () use ($order) {
            $devices = Device::whereIn('order_item_id', $order->items->pluck('id'))->get();
            $batchIds = $devices->pluck('batch_id')->filter()->unique();

            // Las tarjetas de prueba se borran con sus escaneos (cascada en la base).
            Device::whereIn('id', $devices->pluck('id'))->delete();

            // Lotes automáticos del surtido que quedaron sin tarjetas.
            DeviceBatch::whereIn('id', $batchIds)->whereDoesntHave('devices')->delete();

            $order->delete();   // los artículos se borran en cascada
        });

        return redirect()->back()->with('success', "Pedido de prueba {$folio} borrado.");
    }
}
