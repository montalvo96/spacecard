@extends('layouts.public')
{{-- Se abre al escanear un dispositivo sin dueño con la sesión iniciada: confirma que se vincule a la cuenta. --}}

@php($typeName = ['card' => 'SpaceCard', 'bracelet' => 'pulsera NFC', 'review_plate' => 'placa de reseñas'][$device->type] ?? 'dispositivo')

@section('title', 'Reclamar dispositivo - SpaceCard')
@section('icon', 'add_link')

@section('content')
    <p class="kicker">Dispositivo encontrado</p>
    <h1 class="title">¿Vinculamos esta {{ $typeName }} a <span class="hl">tu cuenta?</span></h1>
    <p class="description">Quedará a nombre de <strong>{{ auth()->user()->name }}</strong> y podrás configurarla desde tu panel.</p>

    <div class="code-chip"><span class="ms" aria-hidden="true">tag</span>{{ $device->code }}</div>

    <form action="{{ route('devices.claim.confirm', ['code' => $device->code]) }}" method="POST" class="actions">
        @csrf
        <button type="submit" class="btn"><span class="ms" aria-hidden="true">check_circle</span>Sí, vincular a mi cuenta</button>
        <a href="{{ route('dashboard') }}" class="btn btn-secondary">Ahora no, ir a mi panel</a>
    </form>

    <p class="note"><span class="ms" aria-hidden="true">info</span>Una vez vinculada, solo tú podrás cambiar a dónde lleva al escanearla.</p>
@endsection
