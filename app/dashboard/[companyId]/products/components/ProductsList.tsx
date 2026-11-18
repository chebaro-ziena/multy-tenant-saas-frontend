import type { Product } from '../types/product';
import ProductCard from './ProductCard';

type Props = {
  products: Product[];
  loading: boolean;
  updatingProductId: string | null;
  deletingProductId: string | null;
  onRefresh: () => void;
  onToggle: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export default function ProductsList({
  products,
  loading,
  updatingProductId,
  deletingProductId,
  onRefresh,
  onToggle,
  onDelete,
}: Props) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Your products</h2>
          <p className="mt-1 text-sm text-slate-400">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
          Loading products...
        </div>
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
            <ProductCard
              key={product.id}
              product={product}
              updating={updatingProductId === product.id}
              deleting={deletingProductId === product.id}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}