'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { ProductFormData } from '../types/product';

type Props = {
  saving: boolean;
  onSubmit: (data: FormData) => Promise<void>;
};

const INITIAL_FORM: ProductFormData = {
  name: '',
  description: '',
  price: '',
  currency: 'USD',
  isPublished: false,
};

export default function AddProductForm({ saving, onSubmit }: Props) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState('');

const handleImageChange = (file: File | null) => {
  // Release the previous preview URL
  if (preview) {
    URL.revokeObjectURL(preview);
  }

  setImage(file);
  setPreview(file ? URL.createObjectURL(file) : '');
};

useEffect(() => {
  return () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };
}, [preview]);

  function update<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData();
    data.append('name', form.name.trim());
    data.append('description', form.description.trim());
    data.append('price', form.price);
    data.append('currency', form.currency);
    data.append('isPublished',String(form.isPublished));

    if (image) {
      data.append('image', image);
    }

    await onSubmit(data);
    setForm(INITIAL_FORM);
    setImage(null);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold">Add a product</h2>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="productName" className="mb-2 block text-sm text-slate-300">
            Product name
          </label>
          <input
            type="text"
              id="productName"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              placeholder="Enter product name"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
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
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            required
            placeholder="29.99"
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="currency" className="mb-2 block text-sm text-slate-300">
            Currency
          </label>
          <select
            id="currency"
            value={form.currency}
            onChange={(e) => update('currency', e.target.value)}
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
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            maxLength={5000}
            placeholder="Describe your product..."
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="productImage" className="mb-2 block text-sm text-slate-300">
            Product image
          </label>

          <input
            id="productImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-indigo-400"
          />

          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Product preview"
                className="h-40 w-40 rounded-xl border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="mt-2 text-sm text-red-300 hover:text-red-200"
              >
                Remove image
              </button>
            </div>
          )}

          <p className="mt-2 text-xs text-slate-500">
            JPEG, PNG, or WebP. Maximum size: 5 MB.
          </p>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-300 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => update('isPublished', e.target.checked)}
            className="size-4 accent-indigo-500"
          />
          Publish immediately
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-500 px-5 py-3 font-semibold transition hover:bg-indigo-400 disabled:opacity-50 sm:col-span-2"
        >
          {saving ? 'Saving...' : 'Create product'}
        </button>
      </form>
    </section>
  );
}