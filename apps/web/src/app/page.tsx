'use client';
import { trpc } from '../utils/trpc';

export default function Index() {
  const hello = trpc.hello.useQuery({ name: 'Ingresa.pe Team' });

  return (
    <div className="wrapper p-10">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4">Prueba de Stack Unificado</h1>
        
        <div className="p-6 bg-gray-100 rounded-lg shadow-md">
            {/* ESTADO DE CARGA */}
            {hello.isLoading && <p>Cargando datos del servidor...</p>}

            {/* ESTADO DE ERROR (Nuevo) */}
            {hello.isError && (
              <p className="text-red-600 font-bold">
                Error de conexión: {hello.error.message}
              </p>
            )}

            {/* ESTADO DE ÉXITO */}
            {hello.data && (
                <div className="space-y-2">
                    <p className="text-lg text-green-700 font-semibold">{hello.data.message}</p>
                    <p className="text-sm text-gray-500">Timestamp: {hello.data.timestamp}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}