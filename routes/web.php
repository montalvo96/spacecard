<?php
/**
 * Rutas de la aplicación web de SpaceCard.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ResolveDeviceController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ClaimController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\PlacesProxyController;
use App\Http\Controllers\SpaceController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ShopController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Proxy de Google Places
    Route::get('/api/places/autocomplete', [PlacesProxyController::class, 'autocomplete'])->name('api.places.autocomplete');
    Route::get('/api/places/details', [PlacesProxyController::class, 'details'])->name('api.places.details');

    // CRUD de Dispositivos y Onboarding
    Route::post('/devices/{id}/destination', [DashboardController::class, 'updateDestination'])->name('devices.update.destination');
    Route::post('/devices/{id}/design', [DashboardController::class, 'updateDesign'])->name('devices.update.design');
    Route::post('/review-targets', [DashboardController::class, 'storeReviewTarget'])->name('review-targets.store');

    // CRUD de Spaces y Bloques (usamos POST para actualizar el perfil para soportar subida de imágenes en PHP/Inertia)
    Route::post('/spaces', [DashboardController::class, 'storeSpace'])->name('spaces.store');
    Route::post('/spaces/ai-generate', [DashboardController::class, 'generateSpaceWithAi'])->name('spaces.ai-generate');
    Route::post('/spaces/{id}', [DashboardController::class, 'updateSpace'])->name('spaces.update');
    Route::post('/spaces/{id}/blocks', [DashboardController::class, 'saveBlocks'])->name('spaces.save-blocks');
});

// Ruta de resolución única para dispositivos físicos NFC/QR
Route::get('/t/{code}', [ResolveDeviceController::class, 'resolve'])->name('devices.resolve');

// Ruta para enviar feedback privado de reseñas
Route::post('/r/{id}/feedback', [ReviewController::class, 'storeFeedback'])->name('reviews.feedback.store');

// Rutas de flujo de reclamo de dispositivos
Route::get('/claim/{code}', [ClaimController::class, 'showClaimLanding'])->name('devices.claim.landing');
Route::post('/devices/claim-confirm/{code}', [ClaimController::class, 'confirmClaim'])->name('devices.claim.confirm');

// Rutas públicas de Spaces (tarjetas de presentación digital)
Route::get('/s/{slug}', [SpaceController::class, 'show'])->name('spaces.show');
Route::get('/s/{slug}/vcard', [SpaceController::class, 'downloadVCard'])->name('spaces.vcard');
Route::get('/s/{slug}/wallet/apple', [SpaceController::class, 'appleWallet'])->name('spaces.wallet.apple');
Route::get('/s/{slug}/wallet/google', [SpaceController::class, 'googleWallet'])->name('spaces.wallet.google');
Route::post('/s/{slug}/lead', [SpaceController::class, 'storeLead'])->name('spaces.lead.store');

// Rutas de administración de Avaspace
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::post('/admin/batches', [AdminController::class, 'storeBatch'])->name('admin.batches.store');
    Route::get('/admin/batches/{id}/export', [AdminController::class, 'exportBatch'])->name('admin.batches.export');
    Route::post('/admin/batches/{id}/printed', [AdminController::class, 'markBatchPrinted'])->name('admin.batches.printed');
    Route::post('/admin/batches/{id}/shipped', [AdminController::class, 'markBatchShipped'])->name('admin.batches.shipped');
    Route::post('/admin/devices/{id}/status', [AdminController::class, 'toggleDeviceStatus'])->name('admin.devices.status');
    Route::post('/admin/users/{id}/plan', [AdminController::class, 'updateUserPlan'])->name('admin.users.plan');
    Route::post('/admin/orders/{id}/generate', [AdminController::class, 'generateDevicesFromOrder'])->name('admin.orders.generate');

    // Solo el usuario maestro puede gestionar administradores.
    Route::middleware('master')->group(function () {
        Route::post('/admin/users/{id}/toggle-admin', [AdminController::class, 'toggleUserAdmin'])->name('admin.users.toggle-admin');
    });
});

// Rutas de compras públicas (ecommerce de hardware personalizado)
Route::get('/comprar', [ShopController::class, 'showForm'])->name('shop.comprar');
Route::post('/comprar/checkout', [ShopController::class, 'checkout'])->name('shop.checkout');
Route::get('/comprar/success/{id}', [ShopController::class, 'showSuccess'])->name('shop.success');

require __DIR__.'/auth.php';
