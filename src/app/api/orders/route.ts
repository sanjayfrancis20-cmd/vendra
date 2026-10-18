import { NextRequest, NextResponse } from 'next/server';
import { dbGetOrders, dbCreateOrder, dbDecrementProductStocks, dbGetProductById } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { IOrderItem } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email');

    // Admin sees all, logged-in customer sees theirs, or filter by email
    let filterUserId: string | undefined = undefined;
    if (user && user.role !== 'admin') {
      filterUserId = user._id;
    } else if (!user && queryEmail) {
      filterUserId = queryEmail;
    }

    const orders = await dbGetOrders(filterUserId);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('API /orders GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

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
    } = body;

    if (!items || !items.length || !customerEmail || !customerName || !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields' },
        { status: 400 }
      );
    }

    // Verify stock availability
    for (const item of items as IOrderItem[]) {
      const prod = await dbGetProductById(item.productId);
      if (!prod) {
        return NextResponse.json(
          { success: false, error: `Product ${item.name} is no longer available` },
          { status: 400 }
        );
      }
      if (prod.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${prod.name}". Only ${prod.stock} unit(s) left.`,
          },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce((sum: number, it: IOrderItem) => sum + it.price * it.quantity, 0);
    const shippingFee = subtotal > 150 ? 0 : 15;
    const total = Math.max(0, subtotal + shippingFee - discount);

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await dbCreateOrder({
      orderNumber,
      userId: user?._id,
      customerEmail,
      customerName,
      customerPhone: customerPhone || shippingAddress.phone,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      discount,
      total,
      status: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentMethod,
      paymentDetails,
      paymentId: paymentMethod === 'cod' ? `cod_${Date.now()}` : `pi_test_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Decrement inventory stock
    await dbDecrementProductStocks(
      items.map((it: IOrderItem) => ({ productId: it.productId, quantity: it.quantity }))
    );

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('API /orders POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
