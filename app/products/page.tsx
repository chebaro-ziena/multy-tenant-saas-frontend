import { Suspense } from "react";
import ProductsContent from "./components/ProductsContent";



export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading products...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
