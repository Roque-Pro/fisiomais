import { NextRequest, NextResponse } from 'next/server';

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId e email são obrigatórios' }, { status: 400 });
    }

    if (!MERCADO_PAGO_ACCESS_TOKEN) {
      return NextResponse.json({ url: `${APP_URL}/planos?simulated=1&userId=${userId}` });
    }

    const preferenceData = {
      items: [
        {
          id: 'fisio-plus-mensal',
          title: 'Fisio+ - Assinatura Profissional',
          description: 'Acesso completo ao sistema Fisio+ por 30 dias',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 19.90,
          category_id: 'services',
        },
      ],
      payer: {
        email,
        name: name || 'Profissional',
      },
      back_urls: {
        success: `${APP_URL}/api/mercado-pago/webhook?success=1&userId=${userId}`,
        failure: `${APP_URL}/planos?status=failure`,
        pending: `${APP_URL}/planos?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${APP_URL}/api/mercado-pago/webhook`,
      external_reference: userId,
      metadata: {
        user_id: userId,
        plan: 'professional',
        price: '19.90',
      },
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mercado Pago error:', errorText);
      return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ url: data.init_point });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
