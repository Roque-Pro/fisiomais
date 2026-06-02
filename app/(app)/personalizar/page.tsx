'use client';

import { useEffect, useState } from 'react';
import { Palette, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { applyThemeToDom, defaultTheme, type Theme } from '@/lib/theme';

const presets: { name: string; theme: Theme }[] = [
  { name: 'Oceano (padrão)', theme: defaultTheme },
  { name: 'Rosé', theme: { ...defaultTheme, primary: '#e11d48', accent: '#fb7185', background: '#fff1f2', text: '#4c0519' } },
  { name: 'Floresta', theme: { ...defaultTheme, primary: '#16a34a', accent: '#4ade80', background: '#f0fdf4', text: '#052e16' } },
  { name: 'Lavanda', theme: { ...defaultTheme, primary: '#7c3aed', accent: '#a78bfa', background: '#f5f3ff', text: '#2e1065' } },
  { name: 'Carvão', theme: { ...defaultTheme, primary: '#111827', accent: '#374151', background: '#f3f4f6', text: '#0b1220' } },
  { name: 'Coral', theme: { ...defaultTheme, primary: '#f97316', accent: '#fdba74', background: '#fff7ed', text: '#431407' } }
];

const fonts: Theme['font'][] = ['Inter', 'Poppins', 'DM Sans', 'Playfair Display'];

export default function PersonalizarPage() {
  const supabase = createClient();
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setProfileId(user.id);
      supabase.from('profiles').select('theme').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.theme) {
            setTheme({ ...defaultTheme, ...data.theme });
            applyThemeToDom({ ...defaultTheme, ...data.theme });
          }
        });
    });
  }, [supabase]);

  function update(patch: Partial<Theme>) {
    const next = { ...theme, ...patch };
    setTheme(next);
    applyThemeToDom(next);
    if (typeof window !== 'undefined') localStorage.setItem('fisioplus-theme', JSON.stringify(next));
  }

  async function save() {
    if (!profileId) return;
    setLoading(true);
    await supabase.from('profiles').update({ theme }).eq('id', profileId);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-900">
          <Palette className="h-6 w-6" /> Personalizar
        </h1>
        <button onClick={save} disabled={loading} className="btn-primary">
          <Save className="h-4 w-4" /> {loading ? 'Salvando…' : 'Salvar tema'}
        </button>
      </div>

      {saved && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Tema salvo!</p>}

      <div className="card">
        <h3 className="mb-3 text-base font-semibold text-brand-900">Paletas prontas</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {presets.map((p) => (
            <button key={p.name} onClick={() => update(p.theme)}
              className="rounded-2xl border border-slate-200 p-3 text-left hover:border-brand-400">
              <div className="flex gap-1.5">
                {[p.theme.primary, p.theme.accent, p.theme.background, p.theme.text].map((c, i) => (
                  <span key={i} className="h-6 w-6 rounded-md" style={{ background: c }} />
                ))}
              </div>
              <div className="mt-2 text-sm font-medium">{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card grid gap-4 md:grid-cols-2">
        <ColorInput label="Cor primária" value={theme.primary} onChange={(v) => update({ primary: v })} />
        <ColorInput label="Acento" value={theme.accent} onChange={(v) => update({ accent: v })} />
        <ColorInput label="Fundo" value={theme.background} onChange={(v) => update({ background: v })} />
        <ColorInput label="Superfície" value={theme.surface} onChange={(v) => update({ surface: v })} />
        <ColorInput label="Texto" value={theme.text} onChange={(v) => update({ text: v })} />

        <div>
          <label className="label">Fonte</label>
          <select className="input" value={theme.font} onChange={(e) => update({ font: e.target.value as Theme['font'] })}>
            {fonts.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Cantos arredondados</label>
          <select className="input" value={theme.radius} onChange={(e) => update({ radius: e.target.value as Theme['radius'] })}>
            <option value="sm">Sutil</option>
            <option value="md">Médio</option>
            <option value="lg">Grande</option>
            <option value="xl">Extra grande</option>
          </select>
        </div>

        <div>
          <label className="label">Estilo dos botões</label>
          <select className="input" value={theme.buttonStyle} onChange={(e) => update({ buttonStyle: e.target.value as Theme['buttonStyle'] })}>
            <option value="solid">Sólido</option>
            <option value="outline">Contorno</option>
            <option value="pill">Pílula</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-3 text-base font-semibold text-brand-900">Pré-visualização</h3>
        <div className="rounded-2xl border border-slate-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">Olá</div>
              <div className="text-xl font-bold text-brand-900">Esta é a sua identidade</div>
            </div>
            <button className="btn-primary">Botão primário</button>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Os componentes se adaptam à sua paleta em todo o sistema, incluindo o cartão digital em PDF.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip">Pilates</span>
            <span className="chip">Hidroterapia</span>
            <span className="chip">RPG</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white" />
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white" />
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
