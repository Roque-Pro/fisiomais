'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { applyThemeToDom, defaultTheme, type Theme } from '@/lib/theme';

export function ThemeApplier() {
  useEffect(() => {
    const cached = typeof window !== 'undefined' && localStorage.getItem('fisioplus-theme');
    if (cached) {
      try { applyThemeToDom(JSON.parse(cached) as Theme); } catch { applyThemeToDom(defaultTheme); }
    } else {
      applyThemeToDom(defaultTheme);
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('theme').eq('id', user.id).single().then(({ data }) => {
        if (data?.theme) {
          applyThemeToDom(data.theme as Theme);
          localStorage.setItem('fisioplus-theme', JSON.stringify(data.theme));
        }
      });
    });
  }, []);
  return null;
}
