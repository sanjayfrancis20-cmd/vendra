import { NextRequest, NextResponse } from 'next/server';
import { dbGetProductById, dbUpdateProduct, dbDeleteProduct } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await dbGetProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('API /products/[id] GET error:', error);
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

    const updated = await dbUpdateProduct(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Product not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('API /products/[id] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const deleted = await dbDeleteProduct(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('API /products/[id] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
