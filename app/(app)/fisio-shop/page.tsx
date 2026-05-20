import { ShoppingBag, ExternalLink, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  affiliate_url: string;
}

export const dynamic = 'force-dynamic';

export default async function FisioShopPage() {
  const supabase = createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 pb-12">
      {/* Mini Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden rounded-3xl bg-brand-900">
        <Image 
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2000" 
          alt="Equipamentos de Fisioterapia" 
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 bg-gradient-to-r from-brand-900/80 to-transparent">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Fisio Shop</h1>
          <p className="text-brand-100 max-w-md text-sm md:text-base leading-relaxed">
            Equipamentos e acessórios selecionados para o seu consultório e para a evolução dos seus pacientes.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-2">
        <ShoppingBag className="h-6 w-6 text-brand-600" />
        <h2 className="text-xl font-bold text-slate-900">Produtos Recomendados</h2>
      </div>

      {(!products || products.length === 0) ? (
        <div className="bg-white rounded-2xl py-16 text-center shadow-sm border border-slate-100">
          <ShoppingCart className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhum produto disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-2">
          {products.map((product: Product) => (
            <div 
              key={product.id} 
              className="group flex flex-col bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-brand-300 hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-slate-50 mb-4 border border-slate-50 relative">
                <Image 
                  src={product.image_url} 
                  alt={product.name} 
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">R$</span>
                  <span className="text-lg font-black text-brand-600">
                    {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50">
                <a 
                  href={product.affiliate_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors active:scale-[0.98]"
                >
                  Compre na Shopee
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
