import './global.css';
import Providers from './providers';

export const metadata = {
  title: 'Ingresa.pe — El Duolingo de los preuniversitarios',
  description: 'Prepárate para tu examen de admisión universitaria con lecciones gamificadas, simulacros y seguimiento inteligente.',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
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