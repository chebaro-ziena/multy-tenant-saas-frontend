
'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  currency: string;
  imageUrl?: string | null;
  isPublished: boolean;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data.message === 'string'
        ? data.message
        : `Request failed (${response.status})`,
    );
  }

  return data as T;
}

export default function ProductsPage() {
  const { companyId } = useParams<{ companyId: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const productsUrl = `/companies/${companyId}/products`;

  const loadProducts = useCallback(async () => {
    setError('');

    try {
      const result = await request<Product[] | { products: Product[] }>(
        productsUrl,
      );

      setProducts(
        Array.isArray(result) ? result : result.products ?? [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load products.',
      );
    } finally {
      setLoading(false);
    }
  }, [productsUrl]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) < 0) {
      setError('Enter a valid price with up to two decimal places.');
      return;
    }

    setSaving(true);

    try {
      await request(productsUrl, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          price,
          currency,
          isPublished,
        }),
      });

      setName('');
      setDescription('');
      setPrice('');
      setCurrency('USD');
      setIsPublished(false);
      setNotice('Product created successfully.');

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create the product.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(product: Product) {
    setError('');
    setNotice('');

    try {
      await request(`${productsUrl}/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          isPublished: !product.isPublished,
        }),
      });

      setNotice(
        !product.isPublished
          ? 'Product published.'
          : 'Product unpublished.',
      );

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update the product.',
      );
    }
  }

  async function deleteProduct(product: Product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setError('');
    setNotice('');

    try {
      await request(`${productsUrl}/${product.id}`, {
        method: 'DELETE',
      });

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );

      setNotice('Product deleted.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete the product.',
      );
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold text-indigo-400">
        CATALOG MANAGEMENT
      </p>

      <h1 className="mt-2 text-3xl font-bold">Products</h1>

      <p className="mt-2 text-slate-400">
        Add products and control which products customers can see.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="mt-6 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {notice}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Add a product</h2>

        <form onSubmit={handleCreateProduct} className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="productName" className="mb-2 block text-sm text-slate-300">
              Product name
            </label>
            <input
              id="productName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              maxLength={150}
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Wireless headphones"
            />
          </div>

          <div>
            <label htmlFor="productPrice" className="mb-2 block text-sm text-slate-300">
              Price
            </label>
            <input
              id="productPrice"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="29.99"
            />
          </div>

          <div>
            <label htmlFor="currency" className="mb-2 block text-sm text-slate-300">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="LBP">LBP</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-2 block text-sm text-slate-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={5000}
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="Describe your product..."
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="size-4 accent-indigo-500"
            />
            Publish immediately
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-50 sm:col-span-2"
          >
            {saving ? 'Saving...' : 'Create product'}
          </button>
        </form>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Your products</h2>

          <button
            type="button"
            onClick={() => void loadProducts()}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-400">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="font-medium">No products yet</p>
            <p className="mt-2 text-sm text-slate-400">
              Add your first product using the form above.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-2xl border border-white/10 bg-slate-900 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="break-words text-lg font-semibold">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-lg font-bold text-indigo-300">
                      {product.currency} {Number(product.price).toFixed(2)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      product.isPublished
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {product.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {product.description && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {product.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void togglePublished(product)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                  >
                    {product.isPublished ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteProduct(product)}
                    className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
