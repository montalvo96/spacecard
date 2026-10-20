<?php
/**
 * Configuración de servicios de terceros.
 *
 * Última modificación: 2026-08-06
 * Autor: Antigravity
 */

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'places_key' => env('GOOGLE_PLACES_API_KEY'),
    ],

    'anthropic' => [
        'key'     => env('ANTHROPIC_API_KEY'),
        'model'   => env('ANTHROPIC_MODEL', 'claude-opus-5'),
        'version' => env('ANTHROPIC_VERSION', '2023-06-01'),
    ],

    // Apple Wallet (.pkpass) — requiere un Pass Type ID + certificado de Apple Developer.
    'apple_wallet' => [
        'pass_type_id'  => env('APPLE_WALLET_PASS_TYPE_ID'),   // pass.com.tuempresa.spacecard
        'team_id'       => env('APPLE_WALLET_TEAM_ID'),        // Team ID de Apple Developer
        'org_name'      => env('APPLE_WALLET_ORG_NAME', 'SpaceCard'),
        'cert_path'     => env('APPLE_WALLET_CERT_PATH'),      // ruta al .p12 del Pass Type ID
        'cert_password' => env('APPLE_WALLET_CERT_PASSWORD'),  // contraseña del .p12
        'wwdr_path'     => env('APPLE_WALLET_WWDR_PATH'),      // ruta al Apple WWDR .pem
    ],

    // Google Wallet — requiere Issuer ID + service account con acceso a Wallet API.
    'google_wallet' => [
        'issuer_id'            => env('GOOGLE_WALLET_ISSUER_ID'),
        'class_suffix'         => env('GOOGLE_WALLET_CLASS_SUFFIX', 'spacecard_generic'),
        'service_account_path' => env('GOOGLE_WALLET_SERVICE_ACCOUNT_PATH'), // ruta al JSON del service account
    ],

];
