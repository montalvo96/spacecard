@extends('layouts.public')
/**
 * Vista para mostrar cuando un dispositivo físico está desactivado.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

@section('title', 'Dispositivo Desactivado - SpaceCard')

@section('content')
    <span class="badge">Inactivo</span>
    <h1 class="title">Dispositivo Desactivado</h1>
    <p class="description">
        Este dispositivo físico (código: <strong>{{ $device->code }}</strong>) ha sido desactivado temporal o permanentemente por su dueño o por el administrador de la plataforma.
    </p>
    
    <a href="/" class="btn">Volver a inicio</a>
@endsection
