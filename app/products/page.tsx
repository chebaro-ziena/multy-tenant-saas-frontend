
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type CatalogProduct = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  currency: string;
  imageUrl: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error('Could not load products.');
        }

        const data = await response.json();
        setProducts(data.products ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong.',
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            CompanyHub
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            <Link href="/products" className="font-semibold">
              Products
            </Link>
            <Link href="/">Account</Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Discover businesses
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Explore products
        </h1>

        <p className="mt-3 max-w-2xl text-gray-600">
          Discover products from companies on our platform.
          Find something you like and contact the company.
        </p>

        {loading && (
          <p className="mt-10 text-gray-600">
            Loading products...
          </p>
        )}

        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="mt-10 rounded-xl border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">
              No products available yet
            </h2>
            <p className="mt-2 text-gray-600">
              Published products will appear here when companies
              join the marketplace.
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-52 items-center justify-center bg-gray-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">
                      No product image
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-sm text-indigo-600">
                    {product.company.name}
                  </p>

                  <h2 className="mt-2 text-lg font-semibold">
                    {product.name}
                  </h2>

                  <p className="mt-2 line-clamp-3 min-h-14 text-sm text-gray-600">
                    {product.description || 'No description available.'}
                  </p>

                  <p className="mt-4 text-xl font-bold">
                    {product.currency}{' '}
                    {Number(product.price).toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Sold by {product.company.name}
                  </p>

                  <Link
                    href={`/products/${product.id}`}
                    className="mt-5 block rounded-lg bg-indigo-600 px-4 py-3 text-center font-medium text-white hover:bg-indigo-700"
                  >
                    View product
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
