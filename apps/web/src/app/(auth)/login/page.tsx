'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ChevronRight, Loader2 } from 'lucide-react';
import { trpc } from '../../../utils/trpc';
import { ChunkyButton } from '../../../components/ui/ChunkyButton';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Efecto para verificar si volvemos desde Google OAuth en Nest
  useEffect(() => {
    const token = searchParams?.get('token');
    if (token) {
      // Guardar token de sesión en localStorage (o cookies)
      localStorage.setItem('auth_token', token);

      // TODO: Usarlo luego globalmente en tRPC links para cabecera Authorization
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  const handleGoogleLogin = () => {
    setIsLoadingGoogle(true);
    setAuthError(null);
    // Redirige al API Backend (Nest) que hace el Auth Guard
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoadingEmail(true);
      setAuthError(null);

      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      // TODO: Implementar Endpoint tRPC (e.g. login.mutateAsync({ email, password }))
      // Por ahora simularemos la falla para avisar al usuario.
      throw new Error(
        'El inicio de sesión por e-mail aún no está conectado con la BD de NestJS.'
      );
    } catch (err: any) {
      setAuthError(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsLoadingEmail(false);
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
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm text-center border-2 border-red-100">
            {authError}
          </div>
        )}

        <form
          onSubmit={handleEmailLogin}
          className="w-full flex flex-col gap-5 sm:gap-6 mb-8"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
              CORREO O USUARIO
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 sm:w-6 sm:h-6"
                strokeWidth={2.5}
              />
              <input
                name="email"
                type="text"
                placeholder="tu@correo.com"
                required
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all rounded-2xl h-14 sm:h-16 pl-11 sm:pl-14 text-sm sm:text-base"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-0">
                CONTRASEÑA
              </label>
              <button
                type="button"
                className="font-extrabold text-slate-400 hover:text-blue-500 transition-colors uppercase text-[10px] sm:text-[11px] tracking-wide"
              >
                ¿OLVIDASTE?
              </button>
            </div>
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
              disabled={isLoadingEmail || isLoadingGoogle}
              className="text-[16px] sm:text-[18px]"
            >
              {isLoadingEmail ? (
                <span className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ENTRANDO...
                </span>
              ) : (
                <>
                  <span>INICIAR SESIÓN</span>
                  <ChevronRight
                    className="ml-1 w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1.5"
                    strokeWidth={4}
                  />
                </>
              )}
            </ChunkyButton>
          </div>
        </form>

        <div className="w-full flex items-center justify-center gap-4 mb-6 sm:mb-8">
          <div className="h-[2px] bg-slate-200 flex-1"></div>
          <span className="text-slate-400 font-extrabold text-[10px] sm:text-[11px] tracking-widest whitespace-nowrap">
            O ENTRA CON
          </span>
          <div className="h-[2px] bg-slate-200 flex-1"></div>
        </div>

        <ChunkyButton
          type="button"
          onClick={handleGoogleLogin}
          variant="secondary"
          size="lg"
          fullWidth
          disabled={isLoadingEmail || isLoadingGoogle}
          className="text-[15px] sm:text-[16px]"
        >
          {isLoadingGoogle ? (
            <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
          ) : (
            <svg viewBox="0 0 48 48" className="w-[26px] h-[26px] mr-2">
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.499-3.238-11.161-7.859l-6.65,5.184C9.57,39.63,16.208,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
          )}
          CONTINUAR CON GOOGLE
        </ChunkyButton>
      </div>
    </div>
  );
}
