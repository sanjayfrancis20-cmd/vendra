import { NextRequest, NextResponse } from 'next/server';
import { dbGetProductById, dbCreateOrder, dbDecrementProductStocks } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { IOrderItem } from '@/lib/types';
import { stripe, hasLiveStripeConfig } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();

    const {
      items,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      discount = 0,
      paymentMethod = 'stripe_test',
      paymentDetails,
      testCardNumber,
    } = body;

    if (!items || !items.length) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }

    if (!customerEmail || !customerName || !shippingAddress?.street || !shippingAddress?.city) {
      return NextResponse.json(
        { success: false, error: 'Please provide full contact and shipping details' },
        { status: 400 }
      );
    }

    // 1. Stock check
    for (const item of items as IOrderItem[]) {
      const prod = await dbGetProductById(item.productId);
      if (!prod) {
        return NextResponse.json(
          { success: false, error: `Product "${item.name}" was not found.` },
          { status: 400 }
        );
      }
      if (prod.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${prod.name}". Only ${prod.stock} unit(s) left in inventory.`,
          },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce((sum: number, it: IOrderItem) => sum + it.price * it.quantity, 0);
    let shippingFee = subtotal >= 150 ? 0 : 15;
    if (shippingAddress?.shippingMethod === 'express') {
      shippingFee += 10;
    } else if (shippingAddress?.shippingMethod === 'overnight') {
      shippingFee += 25;
    }
    const total = Math.max(0, subtotal + shippingFee - discount);

    let paymentId = `pi_test_${Date.now()}`;
    let stripeSessionUrl: string | null = null;

    // If Stripe live/test secret key is provided and requested
    if (hasLiveStripeConfig && stripe && body.useStripeHosted) {
      try {
        const origin = req.headers.get('origin') || 'http://localhost:3000';
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          customer_email: customerEmail,
          line_items: items.map((it: IOrderItem) => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: it.name,
                images: [it.image],
              },
              unit_amount: Math.round(it.price * 100),
            },
            quantity: it.quantity,
          })),
          success_url: `${origin}/orders?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/?cancelled=true`,
        });

        stripeSessionUrl = session.url;
        paymentId = session.id;
      } catch (stripeErr) {
        console.warn('Stripe checkout session error, falling back to instant test mode simulation:', stripeErr);
      }
    }

    // Process Test Mode Card verification
    if (testCardNumber) {
      const cleanCard = testCardNumber.replace(/\s+/g, '');
      // Common Stripe test decline card check
      if (cleanCard === '4000000000000002') {
        return NextResponse.json(
          { success: false, error: 'Stripe Test Mode: Card declined (Test error card 4000...0002)' },
          { status: 402 }
        );
      }
    }

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const createdOrder = await dbCreateOrder({
      orderNumber,
      userId: user?._id,
      customerEmail,
      customerName,
      customerPhone: customerPhone || shippingAddress?.phone,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      status: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod,
      paymentDetails,
      paymentId: paymentMethod === 'cod' ? `cod_${Date.now()}` : paymentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Deduct inventory
    await dbDecrementProductStocks(
      items.map((it: IOrderItem) => ({ productId: it.productId, quantity: it.quantity }))
    );

    return NextResponse.json({
      success: true,
      order: createdOrder,
      stripeSessionUrl,
      message: 'Payment processed successfully in Stripe Test Mode.',
    });
  } catch (error) {
    console.error('API /checkout error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
