import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouterType } from './apps/api/src/app/app.router';

async function main() {
  console.log('🦖 Probando Backend Ingresa.pe...');

  // 1. Crear Cliente tRPC
  const client = createTRPCProxyClient<AppRouterType>({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/trpc',
        transformer: superjson,
        headers: () => ({
          // Aquí pegas el token manualmente cuando quieras probar rutas protegidas
          // Authorization: 'Bearer ...' 
        })
      }),
    ],
  });

  try {
    // 2. Intentar Registrarse
    console.log('\n📝 Intentando Registro...');
    const registro = await client.auth.register.mutate({
      name: 'Tester Script',
      email: `test${Date.now()}@script.com`, // Email único cada vez
      password: '123456password',
    });
    console.log('✅ Registro Exitoso:', registro);
    
    const miToken = registro.token;

    // 3. Intentar Login
    console.log('\n🔐 Intentando Login...');
    const login = await client.auth.login.mutate({
      email: registro.user.email,
      password: '123456password',
    });
    console.log('✅ Login Exitoso. Token recibido:', login.token.substring(0, 15) + '...');

    // 4. Validar Sesión con el Token
    console.log('\n👤 Validando sesión con token...');
    console.log('📝 Token a enviar:', miToken.substring(0, 20) + '...');
    
    const clientAutenticado = createTRPCProxyClient<AppRouterType>({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
          transformer: superjson,
          headers: () => {
            const headers = {
              Authorization: `Bearer ${miToken}`,
            };
            console.log('📤 Headers enviados:', headers);
            return headers;
          }
        }),
      ],
    });

    const yo = await clientAutenticado.auth.me.query();
    console.log('✅ Usuario autenticado:', yo);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();