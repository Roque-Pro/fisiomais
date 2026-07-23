'use client';

import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95"
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
            <svg className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-black text-slate-900">Cadastro necessário</h3>
            <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
              Para usar o <strong className="text-slate-700">Mapa de Demandas</strong>, você precisa estar cadastrado no <strong className="text-slate-700">Fisio+</strong>. É gratuito por 30 dias!
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/cadastro"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-slate-900 px-6 py-3.5 text-base font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Criar conta gratuita
            </Link>
            <Link
              href="/login?redirect=/"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-slate-200 px-6 py-3.5 text-sm font-bold text-slate-600 transition-all hover:border-slate-300 hover:text-slate-800 active:scale-[0.98]"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
