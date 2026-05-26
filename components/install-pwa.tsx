'use client';

import { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detect if is iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Detect if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    setIsStandalone(standalone);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt fired');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      alert('Para instalar no Android: Clique nos 3 pontinhos do Chrome e selecione "Instalar aplicativo". Se a opção não aparecer, o navegador ainda está carregando as configurações do sistema.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-sky-600 text-white px-5 py-3 rounded-full shadow-2xl hover:bg-sky-700 transition-all border-2 border-white animate-bounce"
      >
        <Download className="w-5 h-5" />
        <span className="font-bold">Baixar App Fisio+</span>
      </button>

      {showIOSInstructions && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-slate-900">
            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              Instalar no iPhone
            </h3>
            
            <div className="space-y-4 text-sm leading-relaxed">
              <p className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold">1</span>
                <span>Toque no botão de <strong>Compartilhar</strong> na barra inferior do Safari.</span>
                <Share className="w-5 h-5 text-blue-500" />
              </p>
              
              <p className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold">2</span>
                <span>Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</span>
                <PlusSquare className="w-5 h-5 text-slate-700" />
              </p>
              
              <p className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold">3</span>
                <span>Confirme clicando em <strong>Adicionar</strong> no canto superior.</span>
              </p>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-6 w-full bg-sky-600 text-white py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
