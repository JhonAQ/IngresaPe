'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ChunkyButton } from '../../../components/ui/ChunkyButton';
import { trpc } from '../../../utils/trpc';
import { useAuth } from '../../../hooks/useAuth';

function RegisterContent() {
  const router = useRouter();
  const { login } = useAuth();
  const registerMutation = trpc.auth.register.useMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setAuthError(null);

      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden.');
      }

      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
      });
      login(result.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al crear la cuenta.';
      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center p-4 sm:p-8 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-[24px] sm:rounded-[32px] shadow-sm overflow-hidden flex flex-col p-6 sm:px-10 sm:py-12 border-2 border-slate-200">
        <div className="text-center mb-8 sm:mb-10 mt-2 flex flex-col items-center">
          <h1 className="text-[36px] sm:text-[44px] font-extrabold text-error-500 tracking-tighter leading-none mb-1">
            Ingresa.pe
          </h1>
          <p className="text-slate-500 font-extrabold mt-1 text-[10px] sm:text-[11px] uppercase tracking-wide">
            EL DUOLINGO PARA PREUNIVERSITARIOS
          </p>
          <p className="text-slate-400 font-bold text-sm mt-4">
            Crea tu cuenta gratis
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm text-center border-2 border-red-100">
            {authError}
          </div>
        )}

        <form
          onSubmit={handleRegister}
          className="w-full flex flex-col gap-5 sm:gap-6 mb-8"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
              NOMBRE
            </label>
            <div className="relative">
              <User
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 sm:w-6 sm:h-6"
                strokeWidth={2.5}
              />
              <input
                name="name"
                type="text"
                placeholder="Tu nombre"
                required
                minLength={2}
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all rounded-2xl h-14 sm:h-16 pl-11 sm:pl-14 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
              CORREO
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 sm:w-6 sm:h-6"
                strokeWidth={2.5}
              />
              <input
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all rounded-2xl h-14 sm:h-16 pl-11 sm:pl-14 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
              CONTRASEÑA
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 sm:w-6 sm:h-6"
                strokeWidth={2.5}
              />
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all rounded-2xl h-14 sm:h-16 pl-11 sm:pl-14 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
              REPETIR CONTRASEÑA
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 sm:w-6 sm:h-6"
                strokeWidth={2.5}
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all rounded-2xl h-14 sm:h-16 pl-11 sm:pl-14 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="pt-2">
            <ChunkyButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              className="text-[16px] sm:text-[18px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  CREANDO CUENTA...
                </span>
              ) : (
                <>
                  <span>CREAR CUENTA</span>
                  <ChevronRight
                    className="ml-1 w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1.5"
                    strokeWidth={4}
                  />
                </>
              )}
            </ChunkyButton>
          </div>
        </form>

        <div className="text-center">
          <p className="text-slate-500 font-bold text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/login"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex justify-center items-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
