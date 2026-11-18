
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

function getImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;

  return `${API_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export default function ProductsSection() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [askingProduct, setAskingProduct] = useState<string | null>(null);

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

        setProducts(items);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Unable to load products. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => controller.abort();
  }, []);

  // Group products by company
  const companyGroups = products.reduce<
    { companyId: string; companyName: string; products: Product[] }[]
  >((groups, product) => {
    const companyId = product.companyId ?? product.company?.id;

    if (!companyId) return groups;

    let group = groups.find((item) => item.companyId === companyId);

    if (!group) {
      group = {
        companyId,
        companyName: product.company?.name ?? "Company",
        products: [],
      };
      groups.push(group);
    }

    group.products.push(product);
    return groups;
  }, []);

  async function handleAsk(product: Product) {
    const companyId = product.companyId ?? product.company?.id;

    if (!companyId) {
      setError("Company information is missing for this product.");
      return;
    }

    try {
      setAskingProduct(product.id);
      setError("");

      const response = await fetch(`${API_URL}/chat/conversations`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          productId: product.id,
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not start a conversation.");
      }

      const conversation = await response.json();

      // Change this URL if your customer-facing chat uses another route.
      router.push(`/chat?conversationId=${conversation.id}`);
    } catch {
      setError("Unable to start a conversation. Please try again.");
    } finally {
      setAskingProduct(null);
    }
  }

  return (
    <section id="products" className="scroll-mt-24 py-12">
      <div className="mb-10">
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

      {loading && (
        <p className="text-gray-500">Loading products...</p>
      )}

      {error && (
        <p role="alert" className="mb-5 text-sm text-red-600">
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

      <div className="space-y-14">
        {companyGroups.map((group) => (
          <div key={group.companyId}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {group.companyName}
                </h3>
                <p className="text-sm text-gray-500">
                  {group.products.length} products
                </p>
              </div>

              <button
                onClick={() =>
                  router.push(`/products?companyId=${group.companyId}`)
                }
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Show more products →
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.products.slice(0, 3).map((product) => {
                const imageUrl = getImageUrl(product.imageUrl);

                return (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-48 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                        No image
                      </div>
                    )}

                    <div className="p-5">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h4>

                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {product.description || "No description available."}
                      </p>

                      <p className="mt-4 text-xl font-bold text-gray-900">
                        {product.currency ?? "USD"}{" "}
                        {Number(product.price).toFixed(2)}
                      </p>

                      <button
                        onClick={() => handleAsk(product)}
                        disabled={askingProduct === product.id}
                        className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {askingProduct === product.id
                          ? "Starting chat..."
                          : "Ask about this product"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
