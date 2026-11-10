@extends('layouts.public')
{{-- Se abre al escanear un dispositivo sin dueño y sin sesión: invita a crear cuenta o entrar para activarlo. --}}

@php($typeName = ['card' => 'SpaceCard', 'bracelet' => 'pulsera NFC', 'review_plate' => 'placa de reseñas'][$device->type] ?? 'dispositivo')

@section('title', 'Activa tu SpaceCard')
@section('icon', 'contactless')

@section('content')
    <p class="kicker">Activa tu dispositivo</p>
    <h1 class="title">¡Tu {{ $typeName }} está <span class="hl">lista!</span></h1>
    <p class="description">Vincúlala a tu cuenta para empezar a compartir tu perfil, tus redes o recibir reseñas con un solo toque.</p>

    <div class="code-chip"><span class="ms" aria-hidden="true">tag</span>{{ $device->code }}</div>

    <ol class="steps">
        <li><span class="n">1</span><span><strong>Crea tu cuenta o entra</strong>Es gratis y toma menos de un minuto.</span></li>
        <li><span class="n">2</span><span><strong>Se vincula sola</strong>Al entrar, este dispositivo queda a tu nombre.</span></li>
        <li><span class="n">3</span><span><strong>Configúralo</strong>Elige qué se abre cuando alguien lo escanee.</span></li>
    </ol>

    <div class="actions">
        <a href="{{ route('register') }}" class="btn"><span class="ms" aria-hidden="true">person_add</span>Crear mi cuenta</a>
        <a href="{{ route('login') }}" class="btn btn-secondary"><span class="ms" aria-hidden="true">login</span>Ya tengo cuenta</a>
    </div>
@endsection
