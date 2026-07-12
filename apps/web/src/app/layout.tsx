import './global.css';
import Providers from './providers';

import type { Viewport } from 'next';

export const metadata = {
  title: 'Ingresa.pe — El Duolingo de los preuniversitarios',
  description:
    'Prepárate para tu examen de admisión universitaria con lecciones gamificadas, simulacros y seguimiento inteligente.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ingresa.pe',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Ingresa.pe — El Duolingo de los preuniversitarios',
    description:
      'Prepárate para tu examen de admisión universitaria con lecciones gamificadas, simulacros y seguimiento inteligente.',
    images: ['/logo-sky.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ingresa.pe — El Duolingo de los preuniversitarios',
    description:
      'Prepárate para tu examen de admisión universitaria con lecciones gamificadas, simulacros y seguimiento inteligente.',
    images: ['/logo-sky.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#b91c1c',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
