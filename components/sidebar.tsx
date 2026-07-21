'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Activity, LayoutDashboard, LogOut, Palette, User, Users, BookText, ChevronLeft, Newspaper, Menu, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const items = [
  { href: '/dashboard', label: 'Início', Icon: LayoutDashboard },
  { href: '/pacientes', label: 'Pacientes', Icon: Users },
  { href: '/planos', label: 'Planos', Icon: Sparkles },
  { href: '/fisio-news', label: 'Fisio News', Icon: Newspaper },
  { href: '/perfil', label: 'Meu perfil', Icon: User },
  { href: '/personalizar', label: 'Personalizar', Icon: Palette },
  { href: '/documentacao', label: 'Documentação', Icon: BookText }
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setLoading(false);
        return;
      }
      supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.full_name) setName(data.full_name);
          if (data?.role === 'admin') setIsAdmin(true);
          setLoading(false);
        });
    });
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('fisioplus-theme');
    router.push('/login');
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-brand-100 bg-white transition-all duration-300 md:sticky md:h-screen
      ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
      ${collapsed ? 'md:w-20' : 'md:w-64'}`}>
      
      {/* Header com Logo e Botão de Colapsar */}
      <div className="flex items-center justify-between px-4 py-6">
        {(!collapsed || isOpen) && (
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Logo" className="h-9 w-9 rounded-xl object-cover shadow-soft" />
            <span className="font-bold text-brand-900">Fisio+</span>
          </div>
        )}
        {(collapsed && !isOpen) && (
          <div className="mx-auto">
            <img src="/logo.jpg" alt="Logo" className="h-9 w-9 rounded-xl object-cover shadow-soft" />
          </div>
        )}
        
        {/* Botão para fechar no Mobile */}
        <button onClick={onClose} className="md:hidden text-slate-400 p-1">
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Botão de Colapsar no Desktop */}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden md:grid absolute -right-3 top-7 h-6 w-6 place-items-center rounded-full border border-brand-100 bg-white text-slate-400 hover:text-brand-600 shadow-sm transition-transform ${collapsed ? 'rotate-180' : ''}`}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Saudação (Movida para cima) */}
      {(!collapsed || isOpen) && (
        <div className="px-6 mb-6">
          <div className="truncate text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Bem-vindo</div>
          <div className="truncate font-bold text-brand-900 text-sm">
            {loading ? (
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            ) : name ? (
              `Olá, ${name.split(' ')[0]}`
            ) : (
              <Link href="/perfil" className="text-brand-600 hover:underline">
                Cadastrar nome
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Navegação */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                ${active ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-600'}`}>
              <Icon className="h-5 w-5 shrink-0" />
              {(!collapsed || isOpen) && <span>{label}</span>}
            </Link>
          );
        })}
        {isAdmin && (
          <Link href="/admin"
            onClick={onClose}
            title={collapsed ? 'Painel Admin' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
              ${pathname?.startsWith('/admin') ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-600'}`}>
            <Activity className="h-5 w-5 shrink-0" />
            {(!collapsed || isOpen) && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {/* Rodapé (Sair) */}
      <div className="p-3 mt-auto border-t border-slate-50">
        <button 
          onClick={logout} 
          title={collapsed ? 'Sair' : undefined}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!collapsed || isOpen) && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}

export function MobileTopbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('full_name').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.full_name) setName(data.full_name);
        });
    });
  }, [supabase]);

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('fisioplus-theme');
    router.push('/login');
  }
  return (
    <header className="flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3 md:hidden sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={onOpenMenu} className="text-brand-600 p-1 bg-brand-50 rounded-lg active:scale-95 transition-transform">
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-none text-brand-900">Fisio+</span>
            <span className="mt-0.5 text-[10px] font-medium text-slate-500">
              {name ? `Olá, ${name.split(' ')[0]}` : (
                <Link href="/perfil" className="text-brand-600">Cadastrar nome</Link>
              )}
            </span>
          </div>
        </div>
      </div>
      <button onClick={logout} className="text-rose-600 p-2">
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  );
}

export function MobileTabbar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-brand-100 bg-white md:hidden overflow-x-auto no-scrollbar">
      <div className="flex min-w-full">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/');
          const isFisioNews = label === 'Fisio News';
          return (
            <Link key={href} href={href}
              className={`flex flex-1 min-w-[60px] flex-col items-center justify-center gap-1 py-2 px-1 text-[10px] whitespace-nowrap
                ${active ? 'text-brand-700 font-bold' : 'text-slate-500'}`}>
              <div className={`p-1 rounded-lg ${active ? 'bg-brand-50' : ''}`}>
                <Icon className={`h-5 w-5 ${isFisioNews && !active ? 'text-amber-500' : ''}`} />
              </div>
              <span className="scale-90 origin-top">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
