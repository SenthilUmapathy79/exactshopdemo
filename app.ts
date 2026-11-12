import type { Answer, Result, Sources } from './app.contract.d.ts';

const API = 'https://fakestoreapi.com';
export const grants = `net.fetch ${API}`;

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: { rate: number; count: number };
}

function isProduct(value: unknown): value is Product {
  if (value === null || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  if (typeof p.id !== 'number' || !Number.isSafeInteger(p.id) || p.id <= 0 ||
      typeof p.price !== 'number' || !Number.isFinite(p.price) || p.price < 0 ||
      !['title', 'description', 'category', 'image'].every(k => typeof p[k] === 'string')) return false;
  if (p.rating === undefined) return true;
  if (p.rating === null || typeof p.rating !== 'object') return false;
  const rating = p.rating as Record<string, unknown>;
  return typeof rating.rate === 'number' && Number.isFinite(rating.rate) && rating.rate >= 0 && rating.rate <= 5 &&
    typeof rating.count === 'number' && Number.isSafeInteger(rating.count) && rating.count >= 0;
}

async function request(path: string): Promise<unknown> {
  // Visible in Exact agent logs: navigation/filtering should add no catalog requests.
  console.log(`catalog GET ${path}`);
  const response = await fetch(`${API}${path}`, { exactTimeout: 15000 });
  if (!response.ok) throw new Error(`Catalog request failed (${response.status}).`);
  return response.json();
}

const sources: Sources = {
  loadCategories: async (): Promise<Result<'loadCategories'>> => {
    const body = await request('/products/categories');
    if (!Array.isArray(body) || !body.every(c => typeof c === 'string' && c.length > 0)) {
      throw new Error('Invalid category response.');
    }
    return [...new Set(body as string[])];
  },
  loadProducts: async (): Promise<Result<'loadProducts'>> => {
    const body = await request('/products');
    if (!Array.isArray(body) || !body.every(isProduct) || new Set(body.map(p => p.id)).size !== body.length) {
      throw new Error('Invalid product response.');
    }
    // Project to the exact Contract shape; missing optional ratings render no label.
    return body.map(p => ({ id: p.id, title: p.title, price: p.price, description: p.description,
      category: p.category, image: p.image,
      ratingText: p.rating ? `${p.rating.rate} / 5 · ${p.rating.count} ratings` : '' }));
  },
};
export const answer: Answer = (source, args, store, storage, native) =>
  sources[source](args, store, storage, native);
