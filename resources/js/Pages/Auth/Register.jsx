import AuthLayout, { Field, Highlight, SubmitButton } from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout mode="register" kicker="Crea tu cuenta" title={<>Empieza <Highlight>ahora</Highlight></>} subtitle="Crea tu cuenta y arma tu perfil digital en minutos.">
            <Head title="Crear cuenta" />

            <form onSubmit={submit} className="flex flex-col gap-4">
                <Field
                    id="name"
                    label="Nombre"
                    icon="person"
                    placeholder="Tu nombre"
                    value={data.name}
                    autoComplete="name"
                    autoFocus
                    required
                    error={errors.name}
                    onChange={(e) => setData('name', e.target.value)}
                />

                <Field
                    id="email"
                    type="email"
                    label="Correo electrónico"
                    icon="mail"
                    placeholder="tu@correo.com"
                    value={data.email}
                    autoComplete="username"
                    required
                    error={errors.email}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <Field
                    id="password"
                    type="password"
                    label="Contraseña"
                    icon="lock"
                    placeholder="Mínimo 8 caracteres"
                    value={data.password}
                    autoComplete="new-password"
                    required
                    error={errors.password}
                    onChange={(e) => setData('password', e.target.value)}
                />

                <Field
                    id="password_confirmation"
                    type="password"
                    label="Confirmar contraseña"
                    icon="lock_reset"
                    placeholder="Repite tu contraseña"
                    value={data.password_confirmation}
                    autoComplete="new-password"
                    required
                    error={errors.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                />

                <div className="mt-2">
                    <SubmitButton processing={processing}>Crear cuenta</SubmitButton>
                </div>

                <p className="text-center text-sm text-neutral-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link href={route('login')} className="font-semibold text-[#D42410] transition hover:text-[#B81E0C]">
                        Entra aquí
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
