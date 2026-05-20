'use client';

import { useState } from 'react';
import { RefreshCw, Newspaper } from 'lucide-react';

export function UpdateNewsButton() {
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    if (!confirm('Deseja acionar a IA para buscar novas notícias de Fisioterapia? Isso pode levar alguns segundos.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/news/update', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        alert('Notícias atualizadas com sucesso!');
      } else {
        alert('Erro ao atualizar: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err) {
      alert('Erro na requisição: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpdate}
      disabled={loading}
      className="btn-secondary flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Buscando notícias...' : 'Atualizar Notícias (IA)'}
    </button>
  );
}
