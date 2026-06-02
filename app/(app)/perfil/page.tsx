'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, FileDown, Save, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { downloadDigitalCardPdf } from '@/lib/pdf';
import { specialties } from '@/lib/specialties';

export default function ProfilePage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sharePhone, setSharePhone] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (mounted) {
          setLoading(false);
          setError('Nenhum usuário logado.');
        }
        return;
      }

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (mounted) {
        if (profileError) {
          console.error('Erro Supabase:', profileError);
          setError(`Erro ao carregar perfil: ${profileError.message}`);
        }
        setProfile(data);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [supabase]);

  async function createProfileManual() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: user.user_metadata?.full_name || 'Profissional',
      crefito: user.user_metadata?.crefito || '',
      whatsapp: user.user_metadata?.whatsapp || '',
      email: user.email,
    });

    if (error) {
      if (error.message.includes('duplicate key')) {
        setError('Seu perfil já existe, mas o banco de dados está impedindo a leitura. Por favor, execute o comando SQL de correção no painel do Supabase.');
      } else {
        setError('Erro ao criar perfil manualmente: ' + error.message);
      }
      setLoading(false);
    } else {
      window.location.reload();
    }
  }

  if (loading && !profile) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      <p className="mt-4 text-sm text-slate-500">Carregando perfil...</p>
    </div>
  );

  if (!profile && !loading) return (
    <div className="card text-center py-10 space-y-4">
      <p className="text-slate-600">Seu perfil ainda não foi criado no banco de dados.</p>
      {error && <p className="text-xs text-rose-500 font-mono">{error}</p>}
      <button onClick={createProfileManual} className="btn-primary mx-auto">
        Criar meu perfil agora
      </button>
      <p className="text-xs text-slate-400">
        Isso pode acontecer se o serviço do Supabase falhou ao criar seu perfil automaticamente durante o cadastro.
      </p>
    </div>
  );

  const set = (k: string, v: any) => setProfile({ ...profile, [k]: v });

  async function save() {
    setLoading(true); setError(null); setSavedMsg(null);
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      crefito: profile.crefito,
      whatsapp: profile.whatsapp,
      email: profile.email,
      city: profile.city,
      workplace: profile.workplace,
      bio: profile.bio,
      specialties: profile.specialties ?? [],
      updated_at: new Date().toISOString()
    }).eq('id', profile.id);
    setLoading(false);
    if (error) setError(error.message);
    else setSavedMsg('Perfil atualizado com sucesso!');
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${profile.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (upErr) { setError(upErr.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
    const photo_url = pub.publicUrl;
    await supabase.from('profiles').update({ photo_url }).eq('id', profile.id);
    setProfile({ ...profile, photo_url });
    setUploading(false);
  }

  function toggleSpecialty(id: string) {
    const list: string[] = profile.specialties ?? [];
    set('specialties', list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function shareCard() {
    if (!sharePhone) {
      alert('Digite o WhatsApp para quem deseja enviar o cartão.');
      return;
    }
    const cleanPhone = sharePhone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá! Aqui está meu cartão digital profissional da Fisio+.`);
    window.open(`https://wa.me/55${cleanPhone}?text=${msg}`, '_blank');
    downloadDigitalCardPdf(profile);
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-2xl font-black text-brand-900 md:text-3xl tracking-tight">
            <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
            Meu Perfil
          </h1>
          <p className="text-sm text-slate-500 font-medium">Gerencie sua identidade e cartão digital.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Enviar para:</span>
            <input 
              className="w-32 bg-transparent text-sm outline-none" 
              placeholder="DDD+Número" 
              value={sharePhone}
              onChange={(e) => setSharePhone(e.target.value)}
            />
            <button onClick={shareCard} className="btn-primary py-1.5 px-3 text-xs">
              Enviar WhatsApp
            </button>
          </div>
          <button onClick={() => downloadDigitalCardPdf(profile)} className="btn-secondary">
            <FileDown className="h-4 w-4" /> Cartão digital (PDF)
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
          <div className="relative">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-brand-100">
              {profile.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.photo_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-brand-400" />
              )}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white shadow-soft hover:bg-brand-700">
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-brand-900">{profile.full_name}</h2>
            <p className="text-sm text-slate-600">{profile.email}</p>
            {uploading && <p className="mt-1 text-xs text-brand-700">Enviando foto…</p>}
            <p className="mt-2 text-xs text-slate-500">
              Sua foto e dados são usados no cartão digital em PDF.
            </p>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="text-base font-semibold text-brand-900">Dados profissionais</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div><label className="label">Nome completo</label>
            <input className="input" value={profile.full_name ?? ''} onChange={(e) => set('full_name', e.target.value)} /></div>
          <div><label className="label">CREFITO</label>
            <input className="input" value={profile.crefito ?? ''} onChange={(e) => set('crefito', e.target.value)} /></div>
          <div><label className="label">WhatsApp</label>
            <input className="input" value={profile.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} /></div>
          <div><label className="label">E-mail</label>
            <input className="input" type="email" value={profile.email ?? ''} onChange={(e) => set('email', e.target.value)} /></div>
          <div><label className="label">Cidade</label>
            <input className="input" value={profile.city ?? ''} onChange={(e) => set('city', e.target.value)} /></div>
          <div><label className="label">Local de atendimento</label>
            <input className="input" value={profile.workplace ?? ''} onChange={(e) => set('workplace', e.target.value)} /></div>
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-[100px]" value={profile.bio ?? ''} onChange={(e) => set('bio', e.target.value)}
            placeholder="Apresente-se em poucas palavras: formação, abordagem, diferenciais." />
        </div>
      </div>

      <div className="card">
        <h3 className="mb-2 text-base font-semibold text-brand-900">Especialidades</h3>
        <p className="mb-3 text-xs text-slate-500">Marque as áreas em que atende.</p>
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => {
            const active = (profile.specialties ?? []).includes(s.name);
            return (
              <button key={s.id} onClick={() => toggleSpecialty(s.name)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition
                  ${active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'}`}>
                {s.emoji} {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {savedMsg && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{savedMsg}</p>}

      <div className="flex justify-end">
        <button onClick={save} disabled={loading} className="btn-primary">
          <Save className="h-4 w-4" /> {loading ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </>
  );
}
