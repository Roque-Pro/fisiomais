import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeApplier } from '@/components/theme-applier';
import { ClientLayout } from '@/components/client-layout';

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
  title: 'Fisio+ — Software para Fisioterapia | Sistema para Clínica de Fisioterapia',
  description:
    'Software para fisioterapia completo: prontuário digital, ficha de avaliação, evolução por sessão e relatórios em PDF. Sistema para clínica de fisioterapia com 30 dias grátis. Organize sua clínica, atenda mais pacientes.',
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
        <ClientLayout>{children}</ClientLayout>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW: Registrado com sucesso:', registration.scope);
                      
                      // Forçar verificação de atualização a cada carregamento
                      registration.update();

                      registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                          installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed') {
                              if (navigator.serviceWorker.controller) {
                                console.log('SW: Nova versão disponível! Por favor, recarregue.');
                                // Opcional: mostrar um aviso para o usuário recarregar
                              }
                            }
                          };
                        }
                      };
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
