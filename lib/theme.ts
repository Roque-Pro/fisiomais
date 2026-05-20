export type Theme = {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  font: 'Inter' | 'Poppins' | 'DM Sans' | 'Playfair Display';
  radius: 'sm' | 'md' | 'lg' | 'xl';
  buttonStyle: 'solid' | 'outline' | 'pill';
};

export const defaultTheme: Theme = {
  primary: '#0ea5e9',
  accent: '#22d3ee',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  font: 'Inter',
  radius: 'lg',
  buttonStyle: 'solid'
};

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const f = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(f, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(c: [number, number, number], target: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(c[0] + (target[0] - c[0]) * t),
    Math.round(c[1] + (target[1] - c[1]) * t),
    Math.round(c[2] + (target[2] - c[2]) * t)
  ];
}

/** Generates 50→900 scale from a base hex color. */
export function buildBrandScale(hex: string) {
  const base = hexToRgb(hex);
  return {
    50:  mix(base, [255, 255, 255], 0.92),
    100: mix(base, [255, 255, 255], 0.84),
    200: mix(base, [255, 255, 255], 0.68),
    300: mix(base, [255, 255, 255], 0.5),
    400: mix(base, [255, 255, 255], 0.25),
    500: base,
    600: mix(base, [0, 0, 0], 0.12),
    700: mix(base, [0, 0, 0], 0.25),
    800: mix(base, [0, 0, 0], 0.4),
    900: mix(base, [0, 0, 0], 0.55)
  };
}

export function applyThemeToDom(theme: Theme) {
  if (typeof document === 'undefined') return;
  
  // Usamos um seletor específico ou o body para garantir que o tema
  // só seja aplicado dentro do contexto da aplicação.
  // Como as variáveis CSS herdam, aplicá-las ao root é global.
  // Vamos aplicar ao body para isolar melhor.
  const root = document.body;
  
  const scale = buildBrandScale(theme.primary);
  Object.entries(scale).forEach(([k, v]) =>
    root.style.setProperty(`--brand-${k}`, `${v[0]} ${v[1]} ${v[2]}`)
  );
  
  const surf = hexToRgb(theme.surface);
  const ink = hexToRgb(theme.text);
  
  root.style.setProperty('--brand-50', `${hexToRgb(theme.background).join(' ')}`);
  root.style.setProperty('--surface', `${surf.join(' ')}`);
  root.style.setProperty('--ink', `${ink.join(' ')}`);
  root.style.setProperty('--font-sans', `'${theme.font}', system-ui, sans-serif`);
  root.style.setProperty('--font-display', `'${theme.font}', system-ui, sans-serif`);
  
  root.style.background = theme.background;
  root.style.color = theme.text;
}
