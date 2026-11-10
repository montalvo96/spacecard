@extends('layouts.public')
{{-- Se abre al escanear un dispositivo ya reclamado que todavía no tiene destino configurado. --}}

@php($isOwner = auth()->check() && auth()->id() === $device->owner_id)

@section('title', 'Dispositivo sin configurar - SpaceCard')
@section('icon', $isOwner ? 'tune' : 'hourglass_top')
@section('icon_tone', $isOwner ? '' : 'muted')

@section('content')
    @if ($isOwner)
        <p class="kicker"><span class="ms ms-fill" aria-hidden="true" style="font-size:14px">verified</span>Es tuyo</p>
        <h1 class="title">Falta elegir <span class="hl">a dónde lleva</span></h1>
        <p class="description">Tu dispositivo ya está vinculado, pero todavía no le asignas qué se abre al escanearlo: tu Space, un enlace o tus reseñas.</p>

        <div class="code-chip"><span class="ms" aria-hidden="true">tag</span>{{ $device->code }}</div>

        <div class="actions">
            <a href="{{ route('dashboard') }}" class="btn"><span class="ms" aria-hidden="true">tune</span>Configurar ahora</a>
        </div>
    @else
        <p class="kicker muted">Próximamente</p>
        <h1 class="title">Este dispositivo aún <span class="hl">no está listo</span></h1>
        <p class="description">Su dueño ya lo activó, pero todavía no configura qué mostrar. Vuelve a escanearlo más tarde.</p>

        <div class="actions">
            <a href="/" class="btn btn-secondary"><span class="ms" aria-hidden="true">arrow_back</span>Conocer SpaceCard</a>
        </div>
    @endif
@endsection
