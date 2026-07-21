import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const success = searchParams.get('success');
  const userId = searchParams.get('userId');

  if (success === '1' && userId) {
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({
        plan_status: 'active',
        payment_date: new Date().toISOString(),
      })
      .eq('id', userId);

    return NextResponse.redirect(new URL('/dashboard?subscribed=1', request.url));
  }

  return NextResponse.redirect(new URL('/planos', request.url));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const externalRef = body.external_reference as string | undefined;
    const topic = body.topic || body.type;

    if (topic === 'payment' || topic === 'merchant_order') {
      const paymentId = body.data?.id || body.resource?.id || body.id;

      if (paymentId) {
        const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        const paymentResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (paymentResponse.ok) {
          const payment = await paymentResponse.json();
          const userId = payment.external_reference || externalRef;

          if (userId && payment.status === 'approved') {
            const supabase = createClient();
            await supabase
              .from('profiles')
              .update({
                plan_status: 'active',
                mp_subscription_id: paymentId.toString(),
                mp_email: payment.payer?.email || '',
                payment_date: new Date().toISOString(),
              })
              .eq('id', userId);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
