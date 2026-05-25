import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeApplier } from '@/components/theme-applier';

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
    'Portal interno da Fisio Saúde para gestão clínica e atendimento de excelência aos nossos pacientes.'
};

export const viewport: Viewport = {
  themeColor: '#0ea5e9'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
