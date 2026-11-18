"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: string | number;
  currency?: string;
  imageUrl?: string | null;
  companyId?: string;
  company?: {
    id: string;
    name: string;
  };
}
export default function ProductsContent() {
 

  const router = useRouter();
    const searchParams = useSearchParams();
  
    const companyId = searchParams.get("companyId");
  
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
  
    useEffect(() => {
      const controller = new AbortController();
  
      async function loadProducts() {
        try {
          const response = await fetch(`${API_URL}/products`, {
            credentials: "include",
            signal: controller.signal,
          });
  
          if (!response.ok) {
            throw new Error("Could not load products.");
          }
  
          const data = await response.json();
  
          const items: Product[] = Array.isArray(data)
            ? data
            : data.products ?? [];
  
          const filtered = companyId
            ? items.filter(
                (product) =>
                  (product.companyId ?? product.company?.id) === companyId
              )
            : items;
  
          setProducts(filtered);
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") return;
          setError("Unable to load products.");
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        }
      }
  
      void loadProducts();
  
      return () => controller.abort();
    }, [companyId]);
  
    return (
      <main className="min-h-screen bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => router.back()}
            className="mb-8 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back
          </button>
  
          <div className="mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              CompanyHub Marketplace
            </p>
  
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {products[0]?.company?.name
                ? `${products[0].company.name} Products`
                : "Explore Products"}
            </h1>
  
            <p className="mt-2 text-gray-600">
              Explore all available products and contact companies directly.
            </p>
          </div>
  
          {loading && (
            <p className="text-gray-500">Loading products...</p>
          )}
  
          {error && (
            <p role="alert" className="text-red-600">
              {error}
            </p>
          )}
  
          {!loading && !error && products.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h2 className="font-semibold text-gray-800">
                No products found
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                This company has no published products yet.
              </p>
            </div>
          )}
  
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const imageUrl = product.imageUrl
                ? product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : `${API_URL}${product.imageUrl.startsWith("/") ? "" : "/"}${product.imageUrl}`
                : null;
  
              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-gray-100 text-gray-400">
                      No image
                    </div>
                  )}
  
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h2>
  
                    <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                      {product.description || "No description available."}
                    </p>
  
                    <p className="mt-4 text-xl font-bold text-gray-900">
                      {product.currency ?? "USD"}{" "}
                      {Number(product.price).toFixed(2)}
                    </p>
  
                    <button
                      onClick={() => {
                        router.push(
                          `/products?companyId=${companyId ?? product.companyId ?? product.company?.id}`
                        );
                      }}
                      className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      View company products
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    );

 
}