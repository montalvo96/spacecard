<?php
/**
 * Feature · "Agregar a Apple Wallet / Google Wallet" (modelo rekuCard).
 *
 * El que escanea guarda la tarjeta en la wallet nativa de su teléfono con un
 * toque, SIN crear cuenta:
 *   - Apple Wallet: genera y firma un paquete .pkpass.
 *   - Google Wallet: genera el "Save to Google Wallet" link (JWT RS256).
 *
 * Las credenciales se leen de config/services.php (.env). Si no están
 * configuradas, los métodos isXConfigured() devuelven false y la UI muestra
 * el fallback de vCard.
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Services;

use App\Models\Space;
use RuntimeException;
use ZipArchive;

class WalletPassService
{
    // ------------------------------------------------------------------
    // Disponibilidad
    // ------------------------------------------------------------------

    public function isAppleConfigured(): bool
    {
        $c = config('services.apple_wallet');
        return !empty($c['pass_type_id']) && !empty($c['team_id'])
            && !empty($c['cert_path']) && is_file($c['cert_path'] ?? '')
            && !empty($c['wwdr_path']) && is_file($c['wwdr_path'] ?? '');
    }

    public function isGoogleConfigured(): bool
    {
        $c = config('services.google_wallet');
        return !empty($c['issuer_id'])
            && !empty($c['service_account_path']) && is_file($c['service_account_path'] ?? '');
    }

    // ------------------------------------------------------------------
    // Google Wallet
    // ------------------------------------------------------------------

    /**
     * Devuelve el enlace "Save to Google Wallet" para un Space.
     * El JWT lleva la clase y el objeto inline (fat JWT), así no hay que
     * pre-crear la clase vía API.
     */
    public function googleSaveUrl(Space $space): string
    {
        if (!$this->isGoogleConfigured()) {
            throw new RuntimeException('Google Wallet no está configurado.');
        }

        $cfg = config('services.google_wallet');
        $sa  = json_decode((string) file_get_contents($cfg['service_account_path']), true);
        if (!isset($sa['client_email'], $sa['private_key'])) {
            throw new RuntimeException('El service account de Google Wallet es inválido.');
        }

        $issuerId    = $cfg['issuer_id'];
        $classId     = "{$issuerId}.{$cfg['class_suffix']}";
        $objectId    = "{$issuerId}.space_{$space->id}";
        $primary     = $this->primaryColor($space);

        $genericClass = [
            'id'                 => $classId,
            'classTemplateInfo'  => (object) [],
        ];

        $genericObject = [
            'id'              => $objectId,
            'classId'         => $classId,
            'state'           => 'ACTIVE',
            'cardTitle'       => ['defaultValue' => ['language' => 'es', 'value' => config('services.apple_wallet.org_name', 'SpaceCard')]],
            'header'          => ['defaultValue' => ['language' => 'es', 'value' => $space->display_name]],
            'subheader'       => ['defaultValue' => ['language' => 'es', 'value' => $space->headline ?? '']],
            'hexBackgroundColor' => $primary,
            'barcode'         => [
                'type'  => 'QR_CODE',
                'value' => $space->devices()->first()?->resolveUrl() ?? route('spaces.show', $space->slug),
            ],
            'textModulesData' => array_values(array_filter([
                $space->company ? ['id' => 'company', 'header' => 'Empresa', 'body' => $space->company] : null,
                $space->contact_phone ? ['id' => 'phone', 'header' => 'Teléfono', 'body' => $space->contact_phone] : null,
                $space->contact_email ? ['id' => 'email', 'header' => 'Correo', 'body' => $space->contact_email] : null,
            ])),
            'linksModuleData' => [
                'uris' => [[
                    'uri'         => route('spaces.show', $space->slug),
                    'description' => 'Ver mi tarjeta',
                    'id'          => 'space_link',
                ]],
            ],
        ];

        if ($space->avatar_url) {
            $genericObject['logo'] = [
                'sourceUri' => ['uri' => $this->absoluteUrl($space->avatar_url)],
            ];
        }

        $claims = [
            'iss'     => $sa['client_email'],
            'aud'     => 'google',
            'origins' => [config('app.url')],
            'typ'     => 'savetowallet',
            'iat'     => time(),
            'payload' => [
                'genericClasses'  => [$genericClass],
                'genericObjects'  => [$genericObject],
            ],
        ];

        $jwt = $this->signJwtRs256($claims, $sa['private_key']);

        return 'https://pay.google.com/gp/v/save/' . $jwt;
    }

    // ------------------------------------------------------------------
    // Apple Wallet
    // ------------------------------------------------------------------

    /**
     * Construye y firma un .pkpass para un Space. Devuelve el binario del zip.
     */
    public function applePkpass(Space $space): string
    {
        if (!$this->isAppleConfigured()) {
            throw new RuntimeException('Apple Wallet no está configurado.');
        }

        $cfg = config('services.apple_wallet');

        // 1. Certificado y llave privada desde el .p12
        $p12 = file_get_contents($cfg['cert_path']);
        $certs = [];
        if (!openssl_pkcs12_read($p12, $certs, (string) $cfg['cert_password'])) {
            throw new RuntimeException('No se pudo leer el certificado .p12 de Apple Wallet (¿contraseña correcta?).');
        }

        // 2. pass.json
        $resolveUrl = $space->devices()->first()?->resolveUrl() ?? route('spaces.show', $space->slug);
        $pass = [
            'formatVersion'        => 1,
            'passTypeIdentifier'   => $cfg['pass_type_id'],
            'teamIdentifier'       => $cfg['team_id'],
            'organizationName'     => $cfg['org_name'],
            'serialNumber'         => 'space-' . $space->id . '-' . substr(md5($space->slug), 0, 8),
            'description'          => 'Tarjeta de ' . $space->display_name,
            'logoText'             => $space->display_name,
            'foregroundColor'      => 'rgb(255,255,255)',
            'backgroundColor'      => $this->rgb($this->primaryColor($space)),
            'labelColor'           => 'rgb(255,255,255)',
            'barcodes'             => [[
                'format'          => 'PKBarcodeFormatQR',
                'message'         => $resolveUrl,
                'messageEncoding' => 'iso-8859-1',
            ]],
            'generic' => [
                'primaryFields'   => [[
                    'key' => 'name', 'label' => '', 'value' => $space->display_name,
                ]],
                'secondaryFields' => array_values(array_filter([
                    $space->headline ? ['key' => 'headline', 'label' => '', 'value' => $space->headline] : null,
                    $space->company ? ['key' => 'company', 'label' => 'Empresa', 'value' => $space->company] : null,
                ])),
                'backFields'      => array_values(array_filter([
                    $space->contact_phone ? ['key' => 'phone', 'label' => 'Teléfono', 'value' => $space->contact_phone] : null,
                    $space->contact_email ? ['key' => 'email', 'label' => 'Correo', 'value' => $space->contact_email] : null,
                    $space->contact_website ? ['key' => 'web', 'label' => 'Web', 'value' => $space->contact_website] : null,
                    ['key' => 'space', 'label' => 'Tarjeta', 'value' => route('spaces.show', $space->slug)],
                ])),
            ],
        ];

        $passJson = json_encode($pass, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        // 3. Imágenes obligatorias (icon/logo) generadas al vuelo
        $files = [
            'pass.json'   => $passJson,
            'icon.png'    => $this->solidPng(29, 29, $this->primaryColor($space)),
            'icon@2x.png' => $this->solidPng(58, 58, $this->primaryColor($space)),
            'logo.png'    => $this->solidPng(160, 50, $this->primaryColor($space)),
        ];

        // 4. manifest.json (sha1 de cada archivo)
        $manifest = [];
        foreach ($files as $name => $content) {
            $manifest[$name] = sha1($content);
        }
        $manifestJson = json_encode($manifest, JSON_UNESCAPED_SLASHES);
        $files['manifest.json'] = $manifestJson;

        // 5. signature (PKCS#7 detached, DER)
        $files['signature'] = $this->signManifest($manifestJson, $certs['cert'], $certs['pkey'], $cfg['wwdr_path']);

        // 6. Empaquetar en .pkpass (zip)
        return $this->zipPass($files);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /** Firma PKCS#7 detached del manifest y devuelve el DER binario. */
    private function signManifest(string $manifestJson, string $certPem, string $keyPem, string $wwdrPath): string
    {
        $manifestFile = tempnam(sys_get_temp_dir(), 'man');
        $sigFile      = tempnam(sys_get_temp_dir(), 'sig');
        file_put_contents($manifestFile, $manifestJson);

        $ok = openssl_pkcs7_sign(
            $manifestFile,
            $sigFile,
            $certPem,
            $keyPem,
            [],
            PKCS7_BINARY | PKCS7_DETACHED,
            $wwdrPath
        );

        if (!$ok) {
            @unlink($manifestFile);
            @unlink($sigFile);
            throw new RuntimeException('Falló la firma PKCS#7 del pase de Apple Wallet.');
        }

        // openssl_pkcs7_sign genera S/MIME; extraemos la parte firmada y la pasamos a DER.
        $smime = file_get_contents($sigFile);
        @unlink($manifestFile);
        @unlink($sigFile);

        // Aísla el bloque base64 de la firma dentro del S/MIME.
        $parts = preg_split('/\n\n/', $smime);
        $der = base64_decode(preg_replace('/\s+/', '', $parts[3] ?? ''));
        if ($der === false || $der === '') {
            throw new RuntimeException('No se pudo extraer el DER de la firma de Apple Wallet.');
        }

        return $der;
    }

    /** Empaqueta los archivos en un zip en memoria y devuelve el binario. */
    private function zipPass(array $files): string
    {
        $zipPath = tempnam(sys_get_temp_dir(), 'pkpass');
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::OVERWRITE);
        foreach ($files as $name => $content) {
            $zip->addFromString($name, $content);
        }
        $zip->close();

        $bin = file_get_contents($zipPath);
        @unlink($zipPath);

        return $bin;
    }

    /** JWT firmado RS256 con la llave privada del service account. */
    private function signJwtRs256(array $claims, string $privateKey): string
    {
        $header = ['alg' => 'RS256', 'typ' => 'JWT'];
        $segments = [
            $this->b64url(json_encode($header, JSON_UNESCAPED_SLASHES)),
            $this->b64url(json_encode($claims, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)),
        ];
        $input = implode('.', $segments);

        $sig = '';
        if (!openssl_sign($input, $sig, $privateKey, OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('No se pudo firmar el JWT de Google Wallet.');
        }
        $segments[] = $this->b64url($sig);

        return implode('.', $segments);
    }

    private function b64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /** Color primario del tema del space (hex #rrggbb). */
    private function primaryColor(Space $space): string
    {
        $c = data_get($space->theme_config, 'palette.primary');
        return (is_string($c) && preg_match('/^#[0-9a-f]{6}$/i', $c)) ? strtoupper($c) : '#8B5CF6';
    }

    /** Convierte #rrggbb a "rgb(r,g,b)". */
    private function rgb(string $hex): string
    {
        [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');
        return "rgb($r,$g,$b)";
    }

    /** Genera un PNG sólido del color dado (requiere GD para Apple Wallet). */
    private function solidPng(int $w, int $h, string $hex): string
    {
        if (!function_exists('imagecreatetruecolor')) {
            throw new RuntimeException('La extensión GD de PHP es necesaria para generar el .pkpass.');
        }
        [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');
        $img = imagecreatetruecolor($w, $h);
        imagefill($img, 0, 0, imagecolorallocate($img, $r, $g, $b));
        ob_start();
        imagepng($img);
        $png = ob_get_clean();
        imagedestroy($img);
        return $png;
    }

    /** Convierte una ruta /storage/... en URL absoluta para Google. */
    private function absoluteUrl(string $url): string
    {
        return str_starts_with($url, 'http') ? $url : rtrim(config('app.url'), '/') . $url;
    }
}
