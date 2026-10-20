<?php
/**
 * Controlador para el Dashboard privado del cliente (Inertia/React).
 * Maneja el onboarding y todo el CRUD de dispositivos, Spaces y ReviewTargets.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Space;
use App\Models\SpaceBlock;
use App\Models\ReviewTarget;
use App\Enums\SpaceBlockType;
use App\Services\AiSpaceGeneratorService;
use App\Services\SpaceBuilderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Muestra el panel principal del cliente y procesa reclamos pendientes en sesión.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $successMessage = null;
        $errorMessage = null;

        // Verificar si hay un reclamo pendiente en sesión
        if (session()->has('claim_code')) {
            $code = session('claim_code');

            try {
                DB::transaction(function () use ($code, $user) {
                    $device = Device::where('code', $code)
                        ->where('status', 'stock')
                        ->lockForUpdate()
                        ->first();

                    if ($device) {
                        $device->update([
                            'owner_id' => $user->id,
                            'status' => 'claimed',
                            'claimed_at' => now(),
                            'destination_type' => 'none',
                        ]);
                        Log::info("Dispositivo {$code} reclamado automáticamente por el usuario {$user->id} tras autenticación.");
                    } else {
                        throw new \Exception("El dispositivo ya no está disponible.");
                    }
                });

                $successMessage = "¡Dispositivo {$code} vinculado correctamente a tu cuenta!";
            } catch (\Exception $e) {
                $errorMessage = "No se pudo vincular el dispositivo {$code}: ya fue reclamado o no existe.";
            }

            // Limpiar la sesión
            session()->forget('claim_code');
        }

        // Obtener la información del usuario para el Dashboard
        $devices = $user->devices()->with(['space', 'reviewTarget'])->get();
        $spaces = $user->spaces()->get();
        $reviewTargets = $user->reviewTargets()->get();

        $analytics = [];
        $leads = [];

        if ($user->isPro()) {
            $deviceIds = $devices->pluck('id')->toArray();
            $spaceIds = $spaces->pluck('id')->toArray();
            $reviewTargetIds = $reviewTargets->pluck('id')->toArray();

            // 1. Escaneos agrupados por fecha (últimos 30 días)
            $analytics['scans_by_date'] = DB::table('scans')
                ->whereIn('device_id', $deviceIds)
                ->where('scanned_at', '>=', now()->subDays(30))
                ->selectRaw('DATE(scanned_at) as date, count(*) as count')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get();

            // 2. Dispositivos escaneadores (families)
            $analytics['device_families'] = DB::table('scans')
                ->whereIn('device_id', $deviceIds)
                ->selectRaw('device_family, count(*) as count')
                ->groupBy('device_family')
                ->get();

            // 3. Distribución por país
            $analytics['countries'] = DB::table('scans')
                ->whereIn('device_id', $deviceIds)
                ->selectRaw('country, count(*) as count')
                ->groupBy('country')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get();

            // 4. Últimos escaneos detallados
            $analytics['recent_scans'] = \App\Models\Scan::whereIn('device_id', $deviceIds)
                ->with(['device'])
                ->orderBy('scanned_at', 'desc')
                ->limit(20)
                ->get();

            // 5. Leads capturados
            $leads = \App\Models\Lead::whereIn('space_id', $spaceIds)
                ->orWhereIn('review_target_id', $reviewTargetIds)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return Inertia::render('Dashboard', [
            'devices' => $devices,
            'spaces' => $spaces,
            'reviewTargets' => $reviewTargets,
            'analytics' => $analytics,
            'leads' => $leads,
            'userPlan' => [
                'plan' => $user->plan,
                'is_pro' => $user->isPro(),
                'expires_at' => $user->plan_expires_at ? $user->plan_expires_at->toDateString() : null,
                'max_spaces' => $user->maxSpaces(),
                'spaces_used' => $spaces->count(),
                'can_create_space' => $user->canCreateSpace(),
                'ai_enabled' => !empty(config('services.anthropic.key')),
            ],
            'flash' => [
                'success' => $successMessage ?? session('success'),
                'error' => $errorMessage ?? session('error'),
            ]
        ]);
    }

    /**
     * Actualiza el destino de redirección de un dispositivo.
     */
    public function updateDestination(Request $request, int $id)
    {
        $user = $request->user();
        $device = $user->devices()->findOrFail($id);

        $request->validate([
            'destination_type' => ['required', Rule::in(['space', 'external', 'review', 'none'])],
            'external_url' => 'nullable|required_if:destination_type,external|url',
            'space_id' => [
                'nullable',
                'required_if:destination_type,space',
                Rule::exists('spaces', 'id')->where('owner_id', $user->id)
            ],
            'review_target_id' => [
                'nullable',
                'required_if:destination_type,review',
                Rule::exists('review_targets', 'id')->where('owner_id', $user->id)
            ],
        ]);

        $device->update([
            'destination_type' => $request->input('destination_type'),
            'external_url' => $request->input('destination_type') === 'external' ? $request->input('external_url') : null,
            'space_id' => $request->input('destination_type') === 'space' ? $request->input('space_id') : null,
            'review_target_id' => $request->input('destination_type') === 'review' ? $request->input('review_target_id') : null,
        ]);

        return redirect()->back()->with('success', 'Destino del dispositivo actualizado.');
    }

    /**
     * Actualiza el diseño físico (logo y colores) del dispositivo para imprenta.
     */
    public function updateDesign(Request $request, int $id)
    {
        $user = $request->user();
        $device = $user->devices()->findOrFail($id);

        $request->validate([
            'design_color_primary' => 'nullable|string|max:10',
            'design_color_secondary' => 'nullable|string|max:10',
            'design_logo' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $data = [
            'design_color_primary' => $request->input('design_color_primary'),
            'design_color_secondary' => $request->input('design_color_secondary'),
        ];

        if ($request->hasFile('design_logo')) {
            // Eliminar logo anterior si existe
            if ($device->design_logo_url) {
                $oldPath = str_replace('/storage/', '', $device->design_logo_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('design_logo')->store('devices/logos', 'public');
            $data['design_logo_url'] = Storage::url($path);
        }

        $device->update($data);

        return redirect()->back()->with('success', 'Diseño físico actualizado.');
    }

    /**
     * Crea un nuevo destino de reseñas (Google Reviews).
     */
    public function storeReviewTarget(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'business_name' => 'required|string|max:255',
            'place_id' => 'required|string|max:255',
            'feedback_enabled' => 'required|boolean',
        ]);

        // Construir el deep-link de reseñas oficiales de Google
        $placeId = $request->input('place_id');
        $reviewUrl = "https://search.google.com/local/writereview?placeid={$placeId}";

        $target = ReviewTarget::create([
            'owner_id' => $user->id,
            'business_name' => $request->input('business_name'),
            'platform' => 'google',
            'place_id' => $placeId,
            'review_url' => $reviewUrl,
            'feedback_enabled' => $request->input('feedback_enabled'),
        ]);

        return redirect()->back()->with('success', 'Negocio conectado correctamente.');
    }

    /**
     * Crea un nuevo Space (Networking).
     */
    public function storeSpace(Request $request)
    {
        $user = $request->user();

        // Gating por plan: Free = 1 Space, Pro = 3 Spaces.
        if (!$user->canCreateSpace()) {
            $msg = $user->isPro()
                ? 'Alcanzaste el máximo de ' . User::MAX_SPACES_PRO . ' Spaces del plan Pro.'
                : 'El plan gratuito permite ' . User::MAX_SPACES_FREE . ' Space. Haz upgrade a Pro para tener hasta ' . User::MAX_SPACES_PRO . '.';
            return redirect()->back()->with('error', $msg);
        }

        $request->validate([
            'slug' => 'required|string|max:100|unique:spaces,slug',
            'display_name' => 'required|string|max:255',
            'headline' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
        ]);

        // Configuración inicial del tema
        $themeConfig = [
            'layout' => 'stack',
            'background' => 'solid',
            'palette' => [
                'primary' => '#8b5cf6',
                'secondary' => '#6b7280',
                'background' => '#0c0b14',
                'text' => '#ffffff',
            ],
            'font_pair' => 'Outfit_Inter',
            'button_style' => 'filled',
            'corner_radius' => '8px',
            'avatar_shape' => 'circle',
        ];

        Space::create([
            'owner_id' => $user->id,
            'slug' => Str::slug($request->input('slug')),
            'display_name' => $request->input('display_name'),
            'headline' => $request->input('headline'),
            'company' => $request->input('company'),
            'bio' => $request->input('bio'),
            'theme_template' => 'corporate', // Default tema básico
            'theme_config' => $themeConfig,
            'is_public' => true,
            'show_branding' => true, // Por defecto en free se muestra
        ]);

        return redirect()->back()->with('success', 'Space digital creado con éxito.');
    }

    /**
     * Crea un Space generado por IA a partir de una descripción libre.
     */
    public function generateSpaceWithAi(Request $request, AiSpaceGeneratorService $ai, SpaceBuilderService $builder)
    {
        $user = $request->user();

        // Mismo gating por plan que la creación manual.
        if (!$user->canCreateSpace()) {
            $msg = $user->isPro()
                ? 'Alcanzaste el máximo de ' . User::MAX_SPACES_PRO . ' Spaces del plan Pro.'
                : 'El plan gratuito permite ' . User::MAX_SPACES_FREE . ' Space. Haz upgrade a Pro para tener hasta ' . User::MAX_SPACES_PRO . '.';
            return redirect()->back()->with('error', $msg);
        }

        $request->validate([
            'description'  => 'required|string|min:20|max:2000',
            'display_name' => 'required|string|max:255',
            'slug'         => 'required|string|max:100|unique:spaces,slug',
        ]);

        try {
            $generated = $ai->generate($request->input('description'), $request->input('display_name'));
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        // Crear el Space con lo que devolvió la IA.
        $space = Space::create([
            'owner_id'       => $user->id,
            'slug'           => Str::slug($request->input('slug')),
            'display_name'   => $request->input('display_name'),
            'headline'       => $generated['headline'],
            'company'        => $generated['company'],
            'bio'            => $generated['bio'],
            'contact_email'  => $user->email,
            'theme_template' => $user->isPro() ? $generated['theme_template'] : 'corporate',
            'is_public'      => true,
            'show_branding'  => !$user->isPro(),
        ]);

        // Materializar los bloques generados.
        foreach ($generated['blocks'] as $block) {
            /** @var SpaceBlockType $type */
            $type = $block['type'];
            $data = $type->isRichSection() ? ($block['items'] ?? []) : [];
            $builder->addBlock($space, $type, [
                'label'   => $block['label'] ?? null,
                'heading' => $block['heading'] ?? null,
                'url'     => $block['url'] ?? null,
                'icon'    => $block['icon'] ?? null,
            ], $data);
        }

        return redirect()->back()->with('success', '✨ Space generado con IA. Revísalo y ajústalo a tu gusto.');
    }

    /**
     * Actualiza el perfil y tema de un Space.
     */
    public function updateSpace(Request $request, int $id)
    {
        $user = $request->user();
        $space = $user->spaces()->findOrFail($id);

        $request->validate([
            'slug' => ['required', 'string', 'max:100', Rule::unique('spaces', 'slug')->ignore($space->id)],
            'display_name' => 'required|string|max:255',
            'headline' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:100',
            'contact_website' => 'nullable|url|max:255',
            'theme_template' => ['required', Rule::in(['aurora', 'bento', 'editorial', 'neon', 'corporate'])],
            'theme_config' => 'required|array',
            'is_public' => 'required|boolean',
            'show_branding' => 'required|boolean',
            'avatar' => 'nullable|image|max:1024',
            'cover' => 'nullable|image|max:2048',
        ]);

        // Gating Pro:
        // Free solo permite temas básicos: corporate o editorial
        if (!$user->isPro()) {
            if (in_style_premium($request->input('theme_template'))) {
                return redirect()->back()->with('error', 'El tema seleccionado es premium (Pro). Por favor actualiza tu plan.');
            }
            if (!$request->input('show_branding')) {
                return redirect()->back()->with('error', 'Ocultar el branding de Avaspace requiere el plan Pro.');
            }
        }

        $data = [
            'slug' => Str::slug($request->input('slug')),
            'display_name' => $request->input('display_name'),
            'headline' => $request->input('headline'),
            'company' => $request->input('company'),
            'bio' => $request->input('bio'),
            'contact_phone' => $request->input('contact_phone'),
            'contact_email' => $request->input('contact_email'),
            'contact_website' => $request->input('contact_website'),
            'theme_template' => $request->input('theme_template'),
            'theme_config' => $request->input('theme_config'),
            'is_public' => $request->input('is_public'),
            'show_branding' => $request->input('show_branding'),
        ];

        // Guardar imágenes si vienen en la petición
        if ($request->hasFile('avatar')) {
            if ($space->avatar_url) {
                $oldPath = str_replace('/storage/', '', $space->avatar_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('avatar')->store('spaces/avatars', 'public');
            $data['avatar_url'] = Storage::url($path);
        }

        if ($request->hasFile('cover')) {
            if ($space->cover_url) {
                $oldPath = str_replace('/storage/', '', $space->cover_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('cover')->store('spaces/covers', 'public');
            $data['cover_url'] = Storage::url($path);
        }

        $space->update($data);

        return redirect()->back()->with('success', 'Space digital actualizado.');
    }

    /**
     * Guarda y reordena los bloques de un Space.
     */
    public function saveBlocks(Request $request, int $id)
    {
        $user = $request->user();
        $space = $user->spaces()->findOrFail($id);

        $request->validate([
            'blocks' => 'required|array',
            'blocks.*.type' => ['required', Rule::in(['link', 'social', 'header', 'email', 'phone', 'whatsapp', 'file', 'embed'])],
            'blocks.*.label' => 'required|string|max:255',
            'blocks.*.url' => 'nullable|string',
            'blocks.*.icon' => 'nullable|string|max:100',
            'blocks.*.is_active' => 'required|boolean',
        ]);

        $blocksData = $request->input('blocks', []);

        // Realizar los cambios de bloques en una transacción
        DB::transaction(function () use ($space, $blocksData) {
            $sentIds = collect($blocksData)->pluck('id')->filter()->toArray();

            // Eliminar bloques anteriores que ya no vienen en la lista
            $space->blocks()->whereNotIn('id', $sentIds)->delete();

            foreach ($blocksData as $index => $data) {
                $space->blocks()->updateOrCreate(
                    ['id' => $data['id'] ?? null],
                    [
                        'type' => $data['type'],
                        'label' => $data['label'],
                        'url' => $data['url'] ?? null,
                        'icon' => $data['icon'] ?? null,
                        'position' => $index,
                        'is_active' => $data['is_active'],
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Bloques del Space actualizados.');
    }
}

/**
 * Función helper para verificar si un tema es Pro.
 */
function in_style_premium(string $template): bool
{
    // Temas Pro: aurora (mesh+glass), neon (dark+glow), bento (grid)
    // Temas Free: corporate, editorial
    return in_array($template, ['aurora', 'neon', 'bento']);
}
