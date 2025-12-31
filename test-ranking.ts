import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouterType } from './apps/api/src/app/app.router';
// 🗑️ BORRADO: import fetch from 'node-fetch';
// 🗑️ BORRADO: Polyfill de global.fetch

const client = createTRPCProxyClient<AppRouterType>({
  links: [
    httpLink({
      url: 'http://localhost:3000/trpc',
      transformer: superjson,
      // tRPC usará automáticamente el fetch nativo de Node 24
      headers: async () => {
        return {}; 
      },
    }),
  ],
});

async function main() {
    console.log('🌱 Autenticando bot...');
    
    // 1. Login
    const auth = await client.auth.login.mutate({
        email: 'competidor1@test.com', 
        password: 'password123'
    });
    
    // 2. Cliente autenticado
    const authedClient = createTRPCProxyClient<AppRouterType>({
        links: [
            httpLink({
                url: 'http://localhost:3000/trpc',
                transformer: superjson,
                headers: () => ({ Authorization: `Bearer ${auth.token}` }),
            }),
        ],
    });

    console.log('\n🏆 CONSULTANDO TOP 10 GLOBAL 🏆\n');
    const ranking = await authedClient.ranking.getTopStudents.query();

    // console.table es nativo y hermoso en Node
    console.table(ranking); 

    console.log('\n📍 POSICIÓN DEL BOT:');
    const myPos = await authedClient.ranking.getMyPosition.query();
    console.log(`   Soy ${myPos.name}, tengo ${myPos.xp} XP y estoy en el puesto #${myPos.rank}`);
}

main();