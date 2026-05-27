'use client';

import { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detect if already installed
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check localStorage for dismissal
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed === 'true') setIsDismissed(true);

    // Detect if is iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      console.log('✅ PWA: beforeinstallprompt disparado');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed via event
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      console.log('✅ PWA: Instalado com sucesso');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      // Se ainda não temos o prompt, pode ser que o navegador ainda não validou o PWA
      // ou o usuário já recusou recentemente.
      alert('O instalador está sendo preparado. Se este botão não funcionar em instantes, você pode instalar manualmente clicando nos 3 pontos do navegador e selecionando "Instalar Aplicativo".');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`💻 PWA: Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || isDismissed) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] flex items-center md:hidden">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 bg-sky-600 text-white px-5 py-3 rounded-full shadow-2xl hover:bg-sky-700 transition-all border-2 border-white"
        >
          <Download className="w-5 h-5" />
          <span className="font-bold text-sm">Baixar App Fisio+</span>
        </button>
        <button
          onClick={() => {
            setIsDismissed(true);
            localStorage.setItem('pwa-prompt-dismissed', 'true');
          }}
          className="ml-[-12px] bg-rose-500 text-white p-1 rounded-full border-2 border-white shadow-lg hover:bg-rose-600 transition-colors"
          title="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

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
