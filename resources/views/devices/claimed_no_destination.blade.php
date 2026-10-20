@extends('layouts.public')
/**
 * Vista para mostrar cuando un dispositivo ha sido reclamado pero no tiene ningún enlace o Space configurado como destino.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

@section('title', 'Dispositivo no configurado - SpaceCard')

@section('content')
    <span class="badge badge-info">Reclamado</span>
    <h1 class="title">Dispositivo sin destino</h1>
    
    @if(auth()->check() && auth()->id() === $device->owner_id)
        <p class="description">
            ¡Hola! Este dispositivo (código: <strong>{{ $device->code }}</strong>) es tuyo, pero todavía no le has asignado una acción o Space de destino.
        </p>
        <a href="/dashboard" class="btn">Configurar ahora</a>
    @else
        <p class="description">
            Este dispositivo (código: <strong>{{ $device->code }}</strong>) ya ha sido activado por su dueño, pero actualmente no tiene configurada ninguna redirección o Space activo.
        </p>
        <a href="/" class="btn btn-secondary">Ir a SpaceCard</a>
    @endif
@endsection
