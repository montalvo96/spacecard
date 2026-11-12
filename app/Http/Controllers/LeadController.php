<?php
/**
 * Bandeja de mensajes del panel (pestaña Analíticas): marcar como leído /
 * no leído, marcar todos y eliminar. Solo sobre mensajes del propio usuario.
 */

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function markRead(Request $request, int $id): RedirectResponse
    {
        $request->validate(['read' => 'required|boolean']);

        $lead = Lead::ownedBy($request->user())->findOrFail($id);
        $lead->forceFill(['read_at' => $request->boolean('read') ? ($lead->read_at ?? now()) : null])->save();

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $count = Lead::ownedBy($request->user())->unread()->update(['read_at' => now()]);

        return back()->with('success', $count === 1 ? 'Marcaste 1 mensaje como leído.' : "Marcaste {$count} mensajes como leídos.");
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        Lead::ownedBy($request->user())->findOrFail($id)->delete();

        return back()->with('success', 'El mensaje se eliminó.');
    }
}
