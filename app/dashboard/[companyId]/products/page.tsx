import { Suspense } from 'react';
import ProductsClient from './components/ProductsClient';

export const instant = false;

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading products...</p>}>
      <ProductsClient />
    </Suspense>
  );
}