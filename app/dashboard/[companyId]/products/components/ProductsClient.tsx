'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import AddProductForm from './AddProductForm';
import ProductsList from './ProductsList';

import type {
  Product,
  ProductResponse,
} from '../types/product';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('API Error:', result);

    throw new Error(
      Array.isArray(result?.message)
        ? result.message.join(', ')
        : result?.message || `Request failed (${response.status})`,
    );
  }

  return result as T;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ProductsClient() {
  const params = useParams<{ companyId: string }>();
  const companyId = params.companyId;

  const productsUrl = `/companies/${companyId}/products`;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [updatingProductId, setUpdatingProductId] =
    useState<string | null>(null);

  const [deletingProductId, setDeletingProductId] =
    useState<string | null>(null);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

const loadProducts = useCallback(async () => {
  setError('');

  try {
    const result = await apiRequest<ProductResponse>(productsUrl);

    setProducts(
      Array.isArray(result) ? result : result.products ?? [],
    );
  } catch (err) {
    setError(getErrorMessage(err, 'Could not load products.'));
  } finally {
    setLoading(false);
  }
}, [productsUrl]);

useEffect(() => {
  let cancelled = false;

  async function fetchProducts() {
    try {
      const result = await apiRequest<ProductResponse>(productsUrl);

      if (!cancelled) {
        setProducts(
          Array.isArray(result) ? result : result.products ?? [],
        );
        setError('');
      }
    } catch (err) {
      if (!cancelled) {
        setError(getErrorMessage(err, 'Could not load products.'));
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchProducts();

  return () => {
    cancelled = true;
  };
}, [productsUrl, refreshKey]);

const handleCreateProduct = async (formData: FormData) => {
  try {
    setError('');
    setNotice('');

    await apiRequest(productsUrl, {
      method: 'POST',
      body: formData,
    });

    setNotice('Product created successfully.');
    setLoading(true);
    setRefreshKey((current) => current + 1);
  } catch (err) {
    setError(getErrorMessage(err, 'Could not create product.'));
    throw err;
  }
};

  async function togglePublished(product: Product) {
    if (updatingProductId || deletingProductId) return;

    setError('');
    setNotice('');
    setUpdatingProductId(product.id);

    const previousStatus = product.isPublished;
    const nextStatus = !previousStatus;

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, isPublished: nextStatus }
          : item,
      ),
    );

    try {
      await apiRequest(
        `${productsUrl}/${product.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isPublished: nextStatus }),
        },
      );

      setNotice(
        nextStatus ? 'Product published.' : 'Product unpublished.',
      );
    } catch (err) {
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, isPublished: previousStatus }
            : item,
        ),
      );

      setError(getErrorMessage(err, 'Could not update the product.'));
    } finally {
      setUpdatingProductId(null);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`,
    );

    if (!confirmed || deletingProductId || updatingProductId) return;

    setError('');
    setNotice('');
    setDeletingProductId(product.id);

    try {
      await apiRequest(
        `${productsUrl}/${product.id}`,
        { method: 'DELETE' },
      );

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );

      setNotice('Product deleted successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete the product.'));
    } finally {
      setDeletingProductId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="text-sm font-semibold tracking-wider text-indigo-400">
          CATALOG MANAGEMENT
        </p>

        <h1 className="mt-2 text-3xl font-bold">Products</h1>

        <p className="mt-2 text-slate-400">
          Manage your company products and control what customers can see.
        </p>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {notice}
        </div>
      )}

      <div className="mt-8">
        <AddProductForm
          saving={saving}
          onSubmit={handleCreateProduct}
        />
      </div>

      <ProductsList
        products={products}
        loading={loading}
        updatingProductId={updatingProductId}
        deletingProductId={deletingProductId}
        onRefresh={() => {
            setLoading(true);
            setRefreshKey((current) => current + 1);
        }}
        onToggle={(product) => void togglePublished(product)}
        onDelete={(product) => void deleteProduct(product)}
      />
    </div>
  );
}