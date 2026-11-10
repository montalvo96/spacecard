@extends('layouts.public')
{{-- Se abre al escanear un dispositivo desactivado por su dueño o por un administrador. --}}

@section('title', 'Dispositivo desactivado - SpaceCard')
@section('icon', 'block')
@section('icon_tone', 'muted')

@section('content')
    <p class="kicker muted">Inactivo</p>
    <h1 class="title">Este dispositivo está <span class="hl">desactivado</span></h1>
    <p class="description">Su dueño o el equipo de SpaceCard lo desactivó, así que por ahora no lleva a ningún lado.</p>

    <div class="code-chip"><span class="ms" aria-hidden="true">tag</span>{{ $device->code }}</div>

    <div class="actions">
        <a href="/" class="btn"><span class="ms" aria-hidden="true">home</span>Ir a SpaceCard</a>
    </div>

    <p class="note"><span class="ms" aria-hidden="true">info</span>¿Es tuyo? Entra a tu panel para volver a activarlo o escríbenos.</p>
@endsection
