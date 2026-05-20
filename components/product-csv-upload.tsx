'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function ProductCsvUpload() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        
        // nome,valor,link_imagem,link_afiliado
        const products = lines
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => {
            const [name, price, image_url, affiliate_url] = line.split(',');
            return {
              name: name?.trim(),
              price: parseFloat(price?.trim() || '0'),
              image_url: image_url?.trim(),
              affiliate_url: affiliate_url?.trim()
            };
          })
          .filter(p => p.name && p.price && p.image_url && p.affiliate_url);

        if (products.length === 0) {
          throw new Error('Nenhum produto válido encontrado no CSV.');
        }

        const supabase = createClient();
        const { error } = await supabase.from('products').upsert(products, { onConflict: 'name' });

        if (error) throw error;

        setMessage({ type: 'success', text: `${products.length} produtos importados com sucesso!` });
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao processar CSV' });
      } finally {
        setLoading(false);
        // Reset input
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2 text-brand-900 font-bold">
        <FileText className="h-5 w-5" />
        <h2>Importar Produtos (CSV)</h2>
      </div>
      
      <p className="text-sm text-slate-500">
        Suba um arquivo CSV com o formato: <code className="bg-slate-100 px-1 rounded text-brand-600">nome,valor,link_imagem,link_afiliado</code>
      </p>

      <div className="relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className={`flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 transition-colors ${loading ? 'bg-slate-50' : 'hover:border-brand-300 hover:bg-brand-50/30'}`}>
          <Upload className={`h-8 w-8 mb-2 ${loading ? 'text-slate-400 animate-bounce' : 'text-brand-600'}`} />
          <span className="text-sm font-medium text-slate-600">
            {loading ? 'Processando arquivo...' : 'Clique para selecionar ou arraste o arquivo CSV'}
          </span>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}
    </div>
  );
}
