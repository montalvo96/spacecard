<?php
/**
 * Job en cola para registrar analíticas de escaneo de forma asíncrona.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Jobs;

use App\Models\Scan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RegisterScanJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected int $deviceId;
    protected ?int $spaceId;
    protected ?int $reviewTargetId;
    protected string $ip;
    protected string $userAgent;
    protected ?string $referrer;

    /**
     * Create a new job instance.
     */
    public function __construct(
        int $deviceId,
        ?int $spaceId,
        ?int $reviewTargetId,
        string $ip,
        string $userAgent,
        ?string $referrer
    ) {
        $this->deviceId = $deviceId;
        $this->spaceId = $spaceId;
        $this->reviewTargetId = $reviewTargetId;
        $this->ip = $ip;
        $this->userAgent = $userAgent;
        $this->referrer = $referrer;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $country = null;
        $city = null;

        // Geolocalización por IP usando ip-api.com (con timeout de 2 segundos)
        // Evitamos geolocalizar IPs locales de pruebas
        if ($this->ip !== '127.0.0.1' && $this->ip !== '::1') {
            try {
                $response = Http::timeout(2)->get("http://ip-api.com/json/{$this->ip}");
                if ($response->successful()) {
                    $data = $response->json();
                    if (($data['status'] ?? '') === 'success') {
                        $country = $data['country'] ?? null;
                        $city = $data['city'] ?? null;
                    }
                }
            } catch (\Exception $e) {
                Log::warning("No se pudo geolocalizar la IP {$this->ip}: " . $e->getMessage());
            }
        }

        // Determinar la familia del dispositivo basándonos en el User Agent
        $deviceFamily = $this->parseDeviceFamily($this->userAgent);

        // Crear el registro de analíticas
        Scan::create([
            'device_id' => $this->deviceId,
            'space_id' => $this->spaceId,
            'review_target_id' => $this->reviewTargetId,
            'scanned_at' => now(),
            'ip' => $this->ip,
            'country' => $country,
            'city' => $city,
            'device_family' => $deviceFamily,
            'referrer' => $this->referrer ? Str::limit($this->referrer, 255) : null,
        ]);
    }

    /**
     * Deduce si el dispositivo es mobile, tablet o desktop a partir del User Agent.
     */
    protected function parseDeviceFamily(string $userAgent): string
    {
        $userAgent = strtolower($userAgent);
        
        if (str_contains($userAgent, 'tablet') || str_contains($userAgent, 'ipad') || (str_contains($userAgent, 'android') && !str_contains($userAgent, 'mobile'))) {
            return 'tablet';
        }
        
        if (str_contains($userAgent, 'mobile') || str_contains($userAgent, 'iphone') || str_contains($userAgent, 'ipod') || str_contains($userAgent, 'opera mini') || str_contains($userAgent, 'blackberry')) {
            return 'mobile';
        }
        
        return 'desktop';
    }
}
