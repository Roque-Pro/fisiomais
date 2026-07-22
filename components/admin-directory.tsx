'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ShieldCheck, ShieldAlert, Clock, Trash2, Loader2, AlertTriangle, X,
  Ban, CheckCircle, DollarSign
} from 'lucide-react';

type Profile = {
  id: string;
  full_name: string;
  crefito: string;
  email: string;
  whatsapp?: string;
  city?: string;
  trial_started_at: string;
  plan_status: string;
  payment_date?: string;
  blocked?: boolean;
  created_at: string;
  patients_count: number;
  assessments_count: number;
  evolutions_count: number;
};

function getDaysLeft(trialStartedAt: string): number {
  const start = new Date(trialStartedAt);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  const now = new Date();
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getDaysSince(date: string): number {
  return Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysOverdue(paymentDate: string): number {
  const paid = new Date(paymentDate);
  const nextDue = new Date(paid);
  nextDue.setDate(nextDue.getDate() + 30);
  const now = new Date();
  return Math.ceil((now.getTime() - nextDue.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysUntilDue(paymentDate: string): number {
  const paid = new Date(paymentDate);
  const nextDue = new Date(paid);
  nextDue.setDate(nextDue.getDate() + 30);
  const now = new Date();
  return Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

type StatusFilter = 'all' | 'active' | 'trial' | 'expired';

export function AdminDirectory({ statsList, total }: { statsList: Profile[]; total: number }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const PER_PAGE = 10;
  const router = useRouter();
  const supabase = createClient();

  const filtered = statsList.filter((p) => {
    const q = search.toLowerCase();
    if (q && !p.full_name.toLowerCase().includes(q) && !p.email?.toLowerCase().includes(q) && !p.crefito?.toLowerCase().includes(q)) return false;
    if (statusFilter === 'active') return p.plan_status === 'active';
    if (statusFilter === 'trial') return p.plan_status === 'trial';
    if (statusFilter === 'expired') return p.plan_status === 'expired' || p.plan_status === 'canceled';
    return true;
  });

  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  async function handleChangeStatus(profileId: string, newStatus: string) {
    setChangingStatus(profileId);
    await supabase.from('profiles').update({ plan_status: newStatus }).eq('id', profileId);
    router.refresh();
    setChangingStatus(null);
  }

  async function handleDelete(profileId: string) {
    setDeletingId(profileId);
    await supabase.from('profiles').delete().eq('id', profileId);
    router.refresh();
    setConfirmDelete(null);
    setDeletingId(null);
  }

  async function handleToggleBlock(profileId: string, currentBlocked: boolean) {
    setBlockingId(profileId);
    await supabase.from('profiles').update({ blocked: !currentBlocked }).eq('id', profileId);
    router.refresh();
    setBlockingId(null);
  }

  async function handleMarkPaid(profileId: string) {
    setPayingId(profileId);
    const now = new Date().toISOString();
    await supabase.from('profiles').update({
      payment_date: now,
      plan_status: 'active',
    }).eq('id', profileId);
    router.refresh();
    setPayingId(null);
  }

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'bg-emerald-500';
    if (status === 'trial') return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getPaymentBadge = (p: Profile) => {
    if (p.plan_status === 'trial') return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
        Trial grátis
      </span>
    );
    if (p.plan_status !== 'active') return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-600 uppercase">
        Sem cobrança
      </span>
    );
    if (!p.payment_date) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase">
        Pendente
      </span>
    );
    const overdue = getDaysOverdue(p.payment_date);
    if (overdue > 0) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-200">
        <AlertTriangle className="h-2.5 w-2.5" /> Venceu há {overdue}d
      </span>
    );
    const daysLeft = getDaysUntilDue(p.payment_date);
    if (daysLeft <= 5) return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-200">
        <Clock className="h-2.5 w-2.5" /> Vence em {daysLeft}d
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
        <CheckCircle className="h-2.5 w-2.5" /> Em dia ({daysLeft}d)
      </span>
    );
  };

  const getBlockedBadge = (blocked?: boolean) => {
    if (!blocked) return null;
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-white uppercase ml-2">
        <Ban className="h-2.5 w-2.5" /> Bloqueado
      </span>
    );
  };

  const getStatusBadge = (p: Profile) => {
    if (p.plan_status === 'active') return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
        <ShieldCheck className="h-3 w-3" /> Ativo
      </span>
    );
    if (p.plan_status === 'trial') {
      const daysLeft = getDaysLeft(p.trial_started_at);
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${daysLeft <= 5 ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
          <Clock className="h-3 w-3" /> Trial · {daysLeft}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200 uppercase">
        <ShieldAlert className="h-3 w-3" /> Expirado
      </span>
    );
  };

  return (
    <div className="card p-0 overflow-hidden border-slate-100">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-brand-900 shrink-0">Diretório de Profissionais</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-sm outline-none focus:border-brand-400 transition-colors"
              placeholder="Buscar por nome, email ou CREFITO..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'active', 'trial', 'expired'] as StatusFilter[]).map((f) => (
              <button key={f} onClick={() => { setStatusFilter(f); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-colors ${statusFilter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-300'}`}>
                {f === 'all' ? `${total}` : f === 'active' ? 'Ativo' : f === 'trial' ? 'Trial' : 'Expirado'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 w-8"></th>
              <th className="px-6 py-3">Profissional</th>
              <th className="px-6 py-3 text-center">Dias</th>
              <th className="px-6 py-3">Métricas</th>
              <th className="px-6 py-3">Autorização</th>
              <th className="px-6 py-3">Pagamento</th>
              <th className="px-6 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400 font-medium">
                  Nenhum profissional encontrado.
                </td>
              </tr>
            )}
            {paged.map((p) => {
              const daysSince = getDaysSince(p.created_at);
              const expanded = expandedId === p.id;
              const isDeleting = deletingId === p.id;
              return (
                <>
                  <tr key={p.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => setExpandedId(expanded ? null : p.id)}
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 transition-colors">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(p.plan_status)} animate-pulse`} />
                        <div>
                          <div className="font-bold text-brand-950">{p.full_name}</div>
                          <div className="text-xs text-slate-500">{p.email}</div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter font-bold">CREFITO {p.crefito || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center justify-center h-10 w-10 rounded-full bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-brand-700">{daysSince}</span>
                        <span className="text-[8px] text-slate-400 uppercase font-black">dias</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-xs font-bold text-brand-700">{p.patients_count}</div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Pacientes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-brand-700">{p.assessments_count}</div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Avaliações</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-brand-700">{p.evolutions_count}</div>
                          <div className="text-[9px] text-slate-400 uppercase font-bold">Evoluções</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {getStatusBadge(p)}
                        {getBlockedBadge(p.blocked)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        {getPaymentBadge(p)}
                        {p.payment_date && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Pago {new Date(p.payment_date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleMarkPaid(p.id)}
                          disabled={payingId === p.id}
                          className={`p-1.5 rounded-lg transition-all ${
                            p.payment_date
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-300 hover:text-brand-600 hover:bg-brand-50'
                          }`}
                          title="Marcar como pago">
                          {payingId === p.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <DollarSign className="h-3.5 w-3.5" />
                          }
                        </button>
                        <button onClick={() => handleToggleBlock(p.id, !!p.blocked)}
                          disabled={blockingId === p.id}
                          className={`p-1.5 rounded-lg transition-all ${
                            p.blocked
                              ? 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                              : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={p.blocked ? 'Desbloquear' : 'Bloquear'}>
                          {blockingId === p.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : p.blocked
                              ? <CheckCircle className="h-3.5 w-3.5" />
                              : <Ban className="h-3.5 w-3.5" />
                          }
                        </button>

                        <div className="relative group">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:border-brand-300 transition-colors">
                            {changingStatus === p.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <><ShieldCheck className="h-3.5 w-3.5" /> Alterar</>
                            )}
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                            {['active', 'trial', 'expired', 'canceled'].filter((s) => s !== p.plan_status).map((s) => (
                              <button key={s} onClick={() => handleChangeStatus(p.id, s)}
                                className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-brand-50 transition-colors capitalize">
                                {s === 'active' ? 'Ativar' : s === 'trial' ? 'Colocar em Trial' : s === 'expired' ? 'Expirado' : 'Cancelado'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {confirmDelete === p.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(p.id)} disabled={isDeleting}
                              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(p.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Excluir conta">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${p.id}-detail`}>
                      <td colSpan={7} className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">WhatsApp</span>
                            <p className="font-medium text-brand-900 mt-0.5">{p.whatsapp || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Cidade</span>
                            <p className="font-medium text-brand-900 mt-0.5">{p.city || '—'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Cadastrado em</span>
                            <p className="font-medium text-brand-900 mt-0.5">{new Date(p.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Trial expira em</span>
                            <p className="font-medium text-brand-900 mt-0.5">
                              {p.trial_started_at ? new Date(new Date(p.trial_started_at).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : '—'}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Último pagamento</span>
                            <p className="font-medium text-brand-900 mt-0.5">
                              {p.payment_date ? `${new Date(p.payment_date).toLocaleDateString('pt-BR')} · vence ${new Date(new Date(p.payment_date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}` : '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Mostrando {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, filtered.length)} de {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-brand-300 disabled:opacity-30 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-brand-300 disabled:opacity-30 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
