import type { Metadata } from 'next';
import OpportunityMap from '@/components/opportunity-map';

export const metadata: Metadata = {
  title: 'Mapa de Demandas para Fisioterapeuta | Fisio+',
  description:
    'Descubra as melhores cidades para atuar como fisioterapeuta com dados oficiais IBGE, DATASUS e CNES.',
};

export default function MapaDemandasPage() {
  return <OpportunityMap />;
}