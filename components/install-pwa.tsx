'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setSupportsPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setSupportsPWA(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (e: any) => {
    e.preventDefault();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
        setSupportsPWA(false);
      }
    });
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 bg-sky-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-sky-700 transition-all md:hidden"
      aria-label="Instalar Aplicativo"
    >
      <Download className="w-5 h-5" />
      <span className="font-medium text-sm">Instalar App</span>
    </button>
  );
}
