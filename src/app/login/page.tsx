import { Logo } from '@/components/logo';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9ff] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo size={26} />
          <h1 className="text-2xl font-bold text-ink-900">Inicia sesión</h1>
          <p className="text-sm text-ink-500">Bienvenido/a de nuevo.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
