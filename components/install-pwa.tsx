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

  // Forçando visibilidade para teste real
  const isVisible = true; 

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-[9999] flex items-center gap-2 bg-red-600 text-white px-6 py-4 rounded-full shadow-2xl hover:bg-red-700 transition-all border-2 border-white"
      aria-label="Instalar Aplicativo"
    >
      <Download className="w-5 h-5" />
      <span className="font-bold text-lg">TESTE: INSTALAR APP v2</span>
    </button>
  );
}
