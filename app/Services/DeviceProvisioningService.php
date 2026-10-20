<?php
/**
 * Módulo B · Tarjetas — Lógica de aprovisionamiento.
 *
 * Reimplementa limpio lo que avaspace hacía en `Spacecard::crear_spacetools`,
 * `reclamar_spacecard`, `guardarEstadoImpreso/Enviado` y `obtenerCodigoQR`,
 * pero con transacciones, Eloquent y el generador QR ya instalado.
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Services;

use App\Models\Device;
use App\Models\DeviceBatch;
use App\Models\User;
use F9WebLtd\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DeviceProvisioningService
{
    /**
     * Crea un lote y genera N dispositivos con código único, en una transacción.
     * Sustituye al bucle con MAX(id_lote)+1 de avaspace.
     *
     * @return DeviceBatch  El lote recién creado, con sus dispositivos cargados.
     */
    public function provisionBatch(
        User $admin,
        string $name,
        string $type,
        int $quantity,
        ?string $notes = null,
    ): DeviceBatch {
        if ($quantity < 1 || $quantity > 5000) {
            throw new RuntimeException('La cantidad del lote debe estar entre 1 y 5000.');
        }

        return DB::transaction(function () use ($admin, $name, $type, $quantity, $notes) {
            $batch = DeviceBatch::create([
                'name'       => $name,
                'type'       => $type,
                'quantity'   => $quantity,
                'notes'      => $notes,
                'created_by' => $admin->id,
            ]);

            $rows = [];
            for ($i = 0; $i < $quantity; $i++) {
                $rows[] = [
                    'code'       => Device::generateUniqueCode(),
                    'type'       => $type,
                    'has_qr'     => true,
                    'status'     => 'stock',
                    'batch_id'   => $batch->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            Device::insert($rows);

            return $batch->load('devices');
        });
    }

    /**
     * Reclama (activa) una tarjeta y la asigna a un usuario.
     * Equivale a `reclamar_spacecard`: falla si ya tiene dueño.
     */
    public function claim(Device $device, User $user): Device
    {
        if ($device->isClaimed()) {
            throw new RuntimeException('Esta tarjeta ya fue reclamada.');
        }

        $device->forceFill([
            'owner_id'   => $user->id,
            'status'     => 'claimed',
            'claimed_at' => now(),
        ])->save();

        return $device;
    }

    /**
     * Genera el QR de una tarjeta (apunta a su URL de resolución) y marca la fecha.
     * Devuelve el contenido SVG listo para incrustar o guardar.
     */
    public function generateQr(Device $device, int $size = 320): string
    {
        $svg = QrCode::format('svg')
            ->size($size)
            ->margin(1)
            ->errorCorrection('M')
            ->generate($device->resolveUrl());

        $device->forceFill(['qr_generated_at' => now()])->save();

        return (string) $svg;
    }

    /**
     * Marca un dispositivo como impreso (idempotente).
     */
    public function markPrinted(Device $device): Device
    {
        if ($device->printed_at === null) {
            $device->forceFill(['printed_at' => now()])->save();
        }

        return $device;
    }

    /**
     * Marca un dispositivo como enviado. Requiere haberlo impreso antes.
     */
    public function markShipped(Device $device): Device
    {
        if ($device->printed_at === null) {
            throw new RuntimeException('No se puede enviar una tarjeta que no ha sido impresa.');
        }

        if ($device->shipped_at === null) {
            $device->forceFill(['shipped_at' => now()])->save();
        }

        return $device;
    }
}
