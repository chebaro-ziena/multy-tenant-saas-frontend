
"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  currency?: string;
  imageUrl?: string | null;
  company?: {
    name: string;
  };
}

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        const data = await response.json();

        const items = Array.isArray(data)
          ? data
          : data.products ?? [];

        setProducts(items);
      } catch {
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <section id="products" className="scroll-mt-24 py-12">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Discover
        </p>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">
          Explore Products
        </h2>
        <p className="mt-2 text-gray-600">
          Discover products offered by companies on CompanyHub.
        </p>
      </div>

      {loading && <p className="text-gray-500">Loading products...</p>}

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <h3 className="font-semibold text-gray-800">
            No products available yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Products will appear here when companies publish them.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                No image
              </div>
            )}

            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h3>

              {product.company?.name && (
                <p className="mt-1 text-sm text-indigo-600">
                  {product.company.name}
                </p>
              )}

              <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                {product.description || "No description available."}
              </p>

              <p className="mt-4 text-xl font-bold text-gray-900">
                {product.currency ?? "USD"}{" "}
                {Number(product.price).toFixed(2)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
