import mongoose from 'mongoose';
import { IProduct, IOrder, IUser, OrderStatus } from './types';
import { INITIAL_PRODUCTS } from './initialData';
import { ProductModel } from '@/models/Product';
import { OrderModel } from '@/models/Order';
import { UserModel } from '@/models/User';
import bcrypt from 'bcryptjs';

// Global store for seamless turnkey execution when MongoDB is not connected
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<typeof mongoose> | undefined;
  // eslint-disable-next-line no-var
  var _memoryProducts: IProduct[] | undefined;
  // eslint-disable-next-line no-var
  var _memoryOrders: IOrder[] | undefined;
  // eslint-disable-next-line no-var
  var _memoryUsers: (IUser & { passwordHash: string })[] | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function isMongoConfigured(): Promise<boolean> {
  const uri = MONGODB_URI.trim();
  return Boolean(uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'));
}

export async function connectDB() {
  if (!isMongoConfigured()) {
    return null;
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  try {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      });
    }
    await global._mongoClientPromise;
    console.log('[DB] Connected to MongoDB successfully.');
    return mongoose;
  } catch (err) {
    console.warn('[DB] MongoDB connection failed, falling back to in-memory store:', (err as Error).message);
    return null;
  }
}

// In-memory initialization
function initMemoryStore() {
  if (!global._memoryProducts) {
    global._memoryProducts = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  } else {
    for (const item of INITIAL_PRODUCTS) {
      if (!global._memoryProducts.some((p) => p._id === item._id)) {
        global._memoryProducts.push(JSON.parse(JSON.stringify(item)));
      }
    }
  }
  if (!global._memoryOrders) {
    global._memoryOrders = [
      {
        _id: 'ord-101',
        orderNumber: 'ORD-2026-9481',
        userId: 'usr-customer-1',
        customerEmail: 'user@store.com',
        customerName: 'Alex Mercer',
        shippingAddress: {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'United States',
        },
        items: [
          {
            productId: 'prod-1',
            name: 'Aura Pro Wireless Noise-Cancelling Headphones',
            price: 349,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          },
          {
            productId: 'prod-4',
            name: 'Vortex Ultra Precision Gaming Mouse',
            price: 89,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
          },
        ],
        subtotal: 438,
        shippingFee: 0,
        discount: 20,
        total: 418,
        status: 'shipped',
        paymentMethod: 'stripe_test',
        paymentId: 'pi_test_sim_948123',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: 'ord-102',
        orderNumber: 'ORD-2026-8712',
        userId: 'usr-customer-2',
        customerEmail: 'sarah.connor@example.com',
        customerName: 'Sarah Connor',
        shippingAddress: {
          street: '100 Sunset Blvd',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'United States',
        },
        items: [
          {
            productId: 'prod-2',
            name: 'Titan Horizon Smartwatch Series 8',
            price: 499,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          },
        ],
        subtotal: 499,
        shippingFee: 15,
        discount: 0,
        total: 514,
        status: 'paid',
        paymentMethod: 'stripe_test',
        paymentId: 'pi_test_sim_871204',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ];
  }
  if (!global._memoryUsers) {
    const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
    const userPasswordHash = bcrypt.hashSync('user123', 10);
    global._memoryUsers = [
      {
        _id: 'usr-admin-1',
        name: 'Store Administrator',
        email: 'admin@store.com',
        role: 'admin',
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'usr-customer-1',
        name: 'Alex Mercer',
        email: 'user@store.com',
        role: 'customer',
        passwordHash: userPasswordHash,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}

// ---------------- Product Operations ----------------

export async function dbGetProducts(filters?: {
  category?: string;
  search?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}): Promise<IProduct[]> {
  const db = await connectDB();
  if (db) {
    try {
      const query: Record<string, unknown> = {};
      if (filters?.category && filters.category !== 'All') {
        query.category = filters.category;
      }
      if (filters?.inStock) {
        query.stock = { $gt: 0 };
      }
      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) (query.price as Record<string, number>).$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) (query.price as Record<string, number>).$lte = filters.maxPrice;
      }
      if (filters?.search) {
        const regex = new RegExp(filters.search, 'i');
        query.$or = [{ name: regex }, { description: regex }, { tags: regex }];
      }

      let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
      if (filters?.sort === 'price-asc') sortOption = { price: 1 };
      if (filters?.sort === 'price-desc') sortOption = { price: -1 };
      if (filters?.sort === 'rating') sortOption = { rating: -1 };
      if (filters?.sort === 'name') sortOption = { name: 1 };

      const products = await ProductModel.find(query).sort(sortOption).lean();
      if (products && products.length > 0) {
        return products.map((p) => ({
          ...p,
          _id: p._id.toString(),
        })) as unknown as IProduct[];
      }
    } catch (err) {
      console.warn('[DB] Fallback during dbGetProducts:', err);
    }
  }

  // Memory store fallback
  initMemoryStore();
  let list = [...(global._memoryProducts || [])];

  if (filters?.category && filters.category !== 'All') {
    list = list.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.inStock) {
    list = list.filter((p) => p.stock > 0);
  }
  if (filters?.minPrice !== undefined) {
    list = list.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters?.maxPrice !== undefined) {
    list = list.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.description.toLowerCase().includes(s) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(s)))
    );
  }

  if (filters?.sort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (filters?.sort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (filters?.sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (filters?.sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  return list;
}

export async function dbGetProductById(id: string): Promise<IProduct | null> {
  const db = await connectDB();
  if (db) {
    try {
      const prod = await ProductModel.findById(id).lean();
      if (prod) {
        return { ...prod, _id: prod._id.toString() } as unknown as IProduct;
      }
    } catch {
      // id might not be standard ObjectId if using memory id
    }
  }

  initMemoryStore();
  const found = global._memoryProducts?.find((p) => p._id === id);
  return found ? { ...found } : null;
}

export async function dbCreateProduct(data: Omit<IProduct, '_id'>): Promise<IProduct> {
  const db = await connectDB();
  if (db) {
    try {
      const created = await ProductModel.create(data);
      return { ...created.toObject(), _id: created._id.toString() } as unknown as IProduct;
    } catch (err) {
      console.warn('[DB] Fallback during dbCreateProduct:', err);
    }
  }

  initMemoryStore();
  const newProduct: IProduct = {
    ...data,
    _id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  global._memoryProducts?.unshift(newProduct);
  return newProduct;
}

export async function dbUpdateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
  const db = await connectDB();
  if (db) {
    try {
      const updated = await ProductModel.findByIdAndUpdate(id, data, { new: true }).lean();
      if (updated) {
        return { ...updated, _id: updated._id.toString() } as unknown as IProduct;
      }
    } catch {
      // continue to memory store
    }
  }

  initMemoryStore();
  const index = global._memoryProducts?.findIndex((p) => p._id === id);
  if (index !== undefined && index !== -1 && global._memoryProducts) {
    global._memoryProducts[index] = {
      ...global._memoryProducts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return { ...global._memoryProducts[index] };
  }
  return null;
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  const db = await connectDB();
  if (db) {
    try {
      const result = await ProductModel.findByIdAndDelete(id);
      if (result) return true;
    } catch {
      // continue to memory store
    }
  }

  initMemoryStore();
  const initialLen = global._memoryProducts?.length || 0;
  global._memoryProducts = global._memoryProducts?.filter((p) => p._id !== id);
  return (global._memoryProducts?.length || 0) < initialLen;
}

export async function dbDecrementProductStocks(items: { productId: string; quantity: number }[]): Promise<void> {
  const db = await connectDB();
  if (db) {
    try {
      for (const item of items) {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    } catch (err) {
      console.warn('[DB] Error decrementing stocks in MongoDB:', err);
    }
  }

  initMemoryStore();
  if (global._memoryProducts) {
    for (const item of items) {
      const prod = global._memoryProducts.find((p) => p._id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
  }
}

// ---------------- Order Operations ----------------

export async function dbGetOrders(userId?: string): Promise<IOrder[]> {
  const db = await connectDB();
  if (db) {
    try {
      const query = userId ? { userId } : {};
      const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
      if (orders && orders.length > 0) {
        return orders.map((o) => ({ ...o, _id: o._id.toString() })) as unknown as IOrder[];
      }
    } catch (err) {
      console.warn('[DB] Fallback during dbGetOrders:', err);
    }
  }

  initMemoryStore();
  let orders = [...(global._memoryOrders || [])];
  if (userId) {
    orders = orders.filter((o) => o.userId === userId || o.customerEmail === userId);
  }
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function dbGetOrderById(id: string): Promise<IOrder | null> {
  const db = await connectDB();
  if (db) {
    try {
      const ord = await OrderModel.findById(id).lean();
      if (ord) return { ...ord, _id: ord._id.toString() } as unknown as IOrder;
    } catch {
      // continue
    }
  }

  initMemoryStore();
  const found = global._memoryOrders?.find((o) => o._id === id || o.orderNumber === id);
  return found ? { ...found } : null;
}

export async function dbCreateOrder(orderData: Omit<IOrder, '_id'>): Promise<IOrder> {
  const db = await connectDB();
  if (db) {
    try {
      const created = await OrderModel.create(orderData);
      return { ...created.toObject(), _id: created._id.toString() } as unknown as IOrder;
    } catch (err) {
      console.warn('[DB] Fallback during dbCreateOrder:', err);
    }
  }

  initMemoryStore();
  const newOrder: IOrder = {
    ...orderData,
    _id: `ord-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  global._memoryOrders?.unshift(newOrder);
  return newOrder;
}

export async function dbUpdateOrderStatus(id: string, status: OrderStatus): Promise<IOrder | null> {
  const db = await connectDB();
  if (db) {
    try {
      const updated = await OrderModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
      if (updated) return { ...updated, _id: updated._id.toString() } as unknown as IOrder;
    } catch {
      // continue
    }
  }

  initMemoryStore();
  const order = global._memoryOrders?.find((o) => o._id === id || o.orderNumber === id);
  if (order) {
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return { ...order };
  }
  return null;
}

// ---------------- User & Auth Operations ----------------

export async function dbFindUserByEmail(email: string): Promise<(IUser & { passwordHash: string }) | null> {
  const cleanEmail = email.toLowerCase().trim();
  const db = await connectDB();
  if (db) {
    try {
      const user = await UserModel.findOne({ email: cleanEmail }).lean();
      if (user) {
        return {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as 'admin' | 'customer',
          passwordHash: user.passwordHash,
          createdAt: user.createdAt ? new Date(user.createdAt as unknown as string).toISOString() : new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('[DB] Fallback during dbFindUserByEmail:', err);
    }
  }

  initMemoryStore();
  const user = global._memoryUsers?.find((u) => u.email.toLowerCase() === cleanEmail);
  return user ? { ...user } : null;
}

export async function dbCreateUser(userData: {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'customer';
}): Promise<IUser> {
  const cleanEmail = userData.email.toLowerCase().trim();
  const db = await connectDB();
  if (db) {
    try {
      const created = await UserModel.create({
        ...userData,
        email: cleanEmail,
      });
      return {
        _id: created._id.toString(),
        name: created.name,
        email: created.email,
        role: created.role as 'admin' | 'customer',
        createdAt: created.createdAt ? new Date(created.createdAt as unknown as string).toISOString() : new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[DB] Fallback during dbCreateUser:', err);
    }
  }

  initMemoryStore();
  const newUser: IUser & { passwordHash: string } = {
    _id: `usr-${Date.now()}`,
    name: userData.name,
    email: cleanEmail,
    role: userData.role,
    passwordHash: userData.passwordHash,
    createdAt: new Date().toISOString(),
  };
  global._memoryUsers?.push(newUser);
  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt,
  };
}

// ---------------- Dashboard Stats ----------------

export async function dbGetStats() {
  const products = await dbGetProducts();
  const orders = await dbGetOrders();

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    recentOrders: orders.slice(0, 5),
  };
}
