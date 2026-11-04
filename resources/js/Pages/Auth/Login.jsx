import AuthLayout, { Field, Icon, SubmitButton } from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout mode="login" title="Bienvenido de nuevo" subtitle="Entra para editar tu perfil y ver tus contactos.">
            <Head title="Entrar" />

            {status && (
                <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.07] px-4 py-3 text-sm text-emerald-200">
                    <Icon name="check_circle" className="text-lg text-emerald-300" />
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <Field
                    id="email"
                    type="email"
                    label="Correo electrónico"
                    icon="mail"
                    placeholder="tu@correo.com"
                    value={data.email}
                    autoComplete="username"
                    autoFocus
                    error={errors.email}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <Field
                    id="password"
                    type="password"
                    label="Contraseña"
                    icon="lock"
                    placeholder="Tu contraseña"
                    value={data.password}
                    autoComplete="current-password"
                    error={errors.password}
                    onChange={(e) => setData('password', e.target.value)}
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-neutral-400">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-[18px] w-[18px] rounded-md border-white/20 bg-white/5 text-[#D42410] focus:ring-[#FF5A3C] focus:ring-offset-0"
                        />
                        Recordarme
                    </label>
                    {canResetPassword && (
                        <Link href={route('password.request')} className="py-1 text-sm font-medium text-[#FF5A3C] transition hover:text-white">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}
                </div>

                <div className="mt-2">
                    <SubmitButton processing={processing}>Entrar</SubmitButton>
                </div>

                <p className="text-center text-sm text-neutral-400">
                    ¿No tienes cuenta?{' '}
                    <Link href={route('register')} className="font-medium text-[#FF5A3C] transition hover:text-white">
                        Crea una gratis
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
