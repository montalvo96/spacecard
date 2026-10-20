@extends('layouts.public')
/**
 * Vista para confirmar el reclamo de un dispositivo en stock cuando el usuario ya tiene sesión activa.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

@section('title', 'Reclamar Dispositivo - SpaceCard')

@section('content')
    <span class="badge badge-info">Disponible</span>
    <h1 class="title">¡Dispositivo Encontrado!</h1>
    <p class="description">
        Has escaneado un dispositivo físico en stock con el código <strong>{{ $device->code }}</strong>.<br><br>
        ¿Deseas vincular este dispositivo (tipo: <strong>{{ __(strtoupper($device->type)) }}</strong>) a tu cuenta de SpaceCard?
    </p>
    
    <form action="{{ route('devices.claim.confirm', ['code' => $device->code]) }}" method="POST">
        @csrf
        <button type="submit" class="btn">Sí, reclamar dispositivo</button>
    </form>
    
    <a href="/dashboard" class="btn btn-secondary">Cancelar e ir al panel</a>
@endsection
