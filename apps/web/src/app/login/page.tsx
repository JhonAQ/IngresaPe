'use client';
import { Suspense, useState, useEffect } from 'react';
import { trpc } from '../../utils/trpc';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Mutaciones de tRPC
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  // Capturar token de la URL si venimos de Google OAuth
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Guardar el token en el local storage
      localStorage.setItem('auth_token', token);
      setMessage('¡Login con Google exitoso! Token guardado en LocalStorage.');
      // router.push('/dashboard'); // Descomentar para redirigir luego
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Iniciando sesión...');
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      localStorage.setItem('auth_token', result.token);
      setMessage(
        `¡Login exitoso! Bienvenido ${result.user.name || result.user.email}`
      );
    } catch (error: any) {
      setMessage(`Error en Login: ${error.message}`);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Registrando...');
    try {
      const result = await registerMutation.mutateAsync({
        email,
        password,
        name: email.split('@')[0], // Nombre temporal
      });
      localStorage.setItem('auth_token', result.token);
      setMessage(`¡Registro exitoso! Bienvenido ${result.user.name}`);
    } catch (error: any) {
      setMessage(`Error en Registro: ${error.message}`);
    }
  };

  const handleGoogleLogin = () => {
    // Redirigir al endpoint del backend que inicia el flujo de Passport Google
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Accede a Ingresa.pe
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-md text-sm font-medium text-center">
            {message}
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleLogin}
              type="button"
              disabled={loginMutation.isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {loginMutation.isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
            <button
              onClick={handleRegister}
              type="button"
              disabled={registerMutation.isLoading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              {registerMutation.isLoading ? 'Cargando...' : 'Registrarse'}
            </button>
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-full h-px bg-gray-300"></div>
          <span className="text-gray-500 text-sm">O</span>
          <div className="w-full h-px bg-gray-300"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="mt-6 w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuar con Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
