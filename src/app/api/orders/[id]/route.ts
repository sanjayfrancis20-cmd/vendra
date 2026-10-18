import { NextRequest, NextResponse } from 'next/server';
import { dbGetOrderById, dbUpdateOrderStatus } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { OrderStatus } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await dbGetOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('API /orders/[id] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses: OrderStatus[] = [
      'pending',
      'paid',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order status' },
        { status: 400 }
      );
    }

    const updated = await dbUpdateOrderStatus(id, status as OrderStatus);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Order not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('API /orders/[id] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
