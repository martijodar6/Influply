import { Logo } from '@/components/logo';
import { ResetForm } from './reset-form';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={26} />
          <h1 className="text-2xl font-bold text-ink-900">Elige una nueva contraseña</h1>
        </div>
        <ResetForm token={params.token} />
      </div>
    </div>
  );
}
