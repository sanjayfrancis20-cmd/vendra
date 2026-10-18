import { NextRequest, NextResponse } from 'next/server';
import { dbGetProducts, dbCreateProduct } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const inStock = searchParams.get('inStock') === 'true';
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const sort = searchParams.get('sort') || undefined;

    const products = await dbGetProducts({
      category,
      search,
      inStock,
      minPrice,
      maxPrice,
      sort,
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('API /products GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const newProduct = await dbCreateProduct({
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      category: body.category,
      image: body.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      stock: Number(body.stock ?? 0),
      rating: Number(body.rating ?? 5.0),
      reviewsCount: Number(body.reviewsCount ?? 0),
      featured: Boolean(body.featured),
      tags: Array.isArray(body.tags) ? body.tags : [],
      specs: body.specs || {},
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('API /products POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
