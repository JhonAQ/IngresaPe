import './global.css';
import Providers from './providers';

import type { Viewport } from 'next';

export const metadata = {
  title: 'Ingresa.pe — El Duolingo de los preuniversitarios',
  description: 'Prepárate para tu examen de admisión universitaria con lecciones gamificadas, simulacros y seguimiento inteligente.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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