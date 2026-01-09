// test-manual-fetch.ts
// 🛠️ PRUEBA DE BAJO NIVEL SIN LIBRERÍA tRPC CLIENT

async function main() {
  console.log('🚀 Iniciando prueba manual de SuperJSON...');

  const loginUrl = 'http://localhost:3000/trpc/auth.login';
  
  // 1. CONSTRUIMOS EL PAQUETE MANUALMENTE (Simulando SuperJSON)
  // El servidor espera: { "json": { ...datos... } }
  const payload = {
    json: {
      email: 'competidor27@test.com',
      password: 'password123'
    }
  };

  console.log('📦 Enviando paquete:', JSON.stringify(payload));

  // 2. HACEMOS EL FETCH PURO
  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  // 3. ANALIZAMOS LA RESPUESTA
  console.log(`\n📡 Estado HTTP: ${response.status} ${response.statusText}`);
  
  const responseText = await response.text();
  console.log('📄 Respuesta Cruda:', responseText);

  if (response.ok) {
    const data = JSON.parse(responseText);
    // La respuesta también vendrá en formato SuperJSON: { result: { data: { json: { token: ... } } } }
    const token = data.result.data.json.token;
    console.log('\n✅ ¡ÉXITO! El servidor aceptó SuperJSON.');
    console.log('🔑 Token recibido:', token.substring(0, 20) + '...');
  } else {
    console.log('\n❌ FALLÓ. El servidor rechazó el paquete.');
  }
}

main().catch(console.error);
