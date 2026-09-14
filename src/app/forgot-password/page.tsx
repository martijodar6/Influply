import { Logo } from '@/components/logo';
import { ForgotForm } from './forgot-form';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={26} />
          <h1 className="text-2xl font-bold text-ink-900">Recuperar contraseña</h1>
          <p className="text-sm text-ink-500">Te enviamos un enlace para crear una nueva.</p>
        </div>
        <ForgotForm />
      </div>
    </div>
  );
}
