import type { Product } from '../types/product';
import Image from 'next/image';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type Props = {
  product: Product;
  updating: boolean;
  deleting: boolean;
  onToggle: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export default function ProductCard({
  product,
  updating,
  deleting,
  onToggle,
  onDelete,
}: Props) {
  const imageSrc = product.imageUrl
    ? product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `${API_URL}${product.imageUrl}`
    : null;

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={product.name}
          width={400}
          height={300}
          className="mb-4 h-48 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-4 flex h-48 items-center justify-center rounded-xl bg-slate-800 text-sm text-slate-500">
          No product image
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-semibold">{product.name}</h3>
          <p className="mt-2 text-lg font-bold text-indigo-300">
            {product.currency} {Number(product.price).toFixed(2)}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            product.isPublished
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-amber-500/10 text-amber-300"
          }`}
        >
          {product.isPublished ? "Published" : "Draft"}
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
          disabled={updating || deleting}
          onClick={() => onToggle(product)}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          {updating
            ? "Updating..."
            : product.isPublished
              ? "Unpublish"
              : "Publish"}
        </button>

        <button
          type="button"
          disabled={deleting || updating}
          onClick={() => onDelete(product)}
          className="rounded-lg border border-red-500/20 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}