import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeApplier } from '@/components/theme-applier';
import { InstallPWA } from '@/components/install-pwa';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fisio Saúde — Sistema Fisio+',
  description:
    'Portal interno da Fisio Saúde para gestão clínica e atendimento de excelência aos nossos pacientes.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fisio+',
  },
  icons: {
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Adicionais que o Metadata do Next pode não cobrir perfeitamente ou que queremos reforçar */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <InstallPWA />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW: Registrado com sucesso:', registration.scope);
                    },
                    function(err) {
                      console.log('SW: Erro no registro:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
