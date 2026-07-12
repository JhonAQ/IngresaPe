import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ingresa.pe',
    short_name: 'Ingresa',
    description: 'El Duolingo de los preuniversitarios',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#b91c1c',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
