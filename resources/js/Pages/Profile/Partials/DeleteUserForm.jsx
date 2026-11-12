import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion}>
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <form onSubmit={deleteUser} className="relative p-6 sm:p-7">
                    <span className="absolute inset-x-0 top-0 h-1 bg-[#D42410]" />
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF4F2] text-[#D42410]">
                            <span aria-hidden="true" className="ms text-2xl">delete</span>
                        </span>
                        <div className="min-w-0 pt-1">
                            <h2 className="font-display text-lg font-bold leading-tight text-neutral-900">
                                ¿Eliminar tu cuenta?
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                                Se borrarán para siempre tu cuenta, tus Spaces y la
                                configuración de tus tarjetas. Escribe tu contraseña
                                para confirmar.
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <InputLabel
                            htmlFor="password"
                            value="Contraseña"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="block w-full rounded-xl border-black/15 focus:border-[#D42410] focus:ring-[#D42410]/20"
                            isFocused
                            placeholder="Contraseña"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#D42410] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(212,36,16,0.3)] transition hover:-translate-y-0.5 hover:bg-[#B81E0C] disabled:opacity-60"
                        >
                            <span aria-hidden="true" className="ms text-lg">delete</span>
                            Eliminar cuenta
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
