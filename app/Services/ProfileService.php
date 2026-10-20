<?php
/**
 * Módulo A · Cuentas — Lógica de perfil.
 *
 * Reimplementa limpio lo relevante de la clase `Usuarios` de avaspace:
 * saneado de nombre/teléfono, nickname con cooldown, y vínculo de referido.
 * (El hashing de contraseña lo maneja el cast 'hashed' de Laravel, no MD5).
 *
 * Autor: SpaceCard 2.0
 */

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProfileService
{
    /**
     * Cambia el nickname respetando unicidad y el cooldown de 30 días.
     *
     * @throws ValidationException  si aún está en cooldown o el nickname está tomado.
     */
    public function changeNickname(User $user, string $nickname): User
    {
        $nickname = $this->normalizeNickname($nickname);

        // Si no cambia, no hacemos nada (no gasta el cooldown).
        if ($user->nickname === $nickname) {
            return $user;
        }

        if (! $user->canChangeNickname()) {
            throw ValidationException::withMessages([
                'nickname' => 'Podrás cambiar tu nickname de nuevo el '
                    . $user->nicknameAvailableAt()->format('d/m/Y') . '.',
            ]);
        }

        $taken = User::where('nickname', $nickname)
            ->whereKeyNot($user->id)
            ->exists();

        if ($taken) {
            throw ValidationException::withMessages([
                'nickname' => 'Ese nickname ya está en uso.',
            ]);
        }

        $user->forceFill([
            'nickname'            => $nickname,
            'nickname_changed_at' => now(),
        ])->save();

        return $user;
    }

    /**
     * Actualiza los campos de perfil, saneando nombre y teléfono.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateProfile(User $user, array $data): User
    {
        if (isset($data['name'])) {
            $data['name'] = $this->cleanName($data['name']);
        }
        if (isset($data['phone'])) {
            $data['phone'] = $this->cleanPhone($data['phone']);
        }

        $user->fill(array_intersect_key($data, array_flip(
            ['name', 'phone', 'bio', 'avatar_url']
        )))->save();

        return $user;
    }

    /**
     * Vincula al usuario con quien lo refirió (por nickname o id), sin ciclos.
     */
    public function attachReferrer(User $user, User $referrer): User
    {
        if ($referrer->id === $user->id) {
            return $user; // nadie se refiere a sí mismo
        }

        if ($user->invited_by === null) {
            $user->forceFill(['invited_by' => $referrer->id])->save();
        }

        return $user;
    }

    /**
     * Normaliza un nickname: minúsculas, sin espacios, solo [a-z0-9_.-].
     */
    public function normalizeNickname(string $nickname): string
    {
        $nickname = Str::of($nickname)->lower()->ascii()->trim();
        $nickname = preg_replace('/[^a-z0-9_.-]/', '', (string) $nickname);

        return trim($nickname, '.-_');
    }

    /**
     * Limpia el nombre: colapsa espacios y capitaliza (limpiarNombre de avaspace).
     */
    public function cleanName(string $name): string
    {
        return Str::of($name)->squish()->title()->value();
    }

    /**
     * Deja solo dígitos y el '+' inicial (limpiarTelefono de avaspace).
     */
    public function cleanPhone(string $phone): string
    {
        $plus = str_starts_with(trim($phone), '+') ? '+' : '';

        return $plus . preg_replace('/\D+/', '', $phone);
    }
}
