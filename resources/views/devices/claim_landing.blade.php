@extends('layouts.public')
/**
 * Vista landing para registrar/loguearse y auto-reclamar un dispositivo en stock.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

@section('title', 'Activa tu SpaceCard')

@section('content')
    <span class="badge badge-info">Disponible para activación</span>
    <h1 class="title">¡Activa tu Dispositivo!</h1>
    <p class="description">
        Has escaneado un dispositivo SpaceCard (tipo: <strong>{{ __(strtoupper($device->type)) }}</strong>) con el código de activación <strong>{{ $device->code }}</strong>.<br><br>
        Para vincular este dispositivo y comenzar a compartir tus redes o recibir reseñas, crea una cuenta o inicia sesión a continuación.
    </p>
    
    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
        <a href="{{ route('register') }}" class="btn">Crear una cuenta nueva</a>
        <a href="{{ route('login') }}" class="btn btn-secondary">Ya tengo una cuenta / Iniciar sesión</a>
    </div>
@endsection
