export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
  currency: string;
  imageUrl: string | null;
  isPublished: boolean;
};

export type ProductResponse =
  | Product[]
  | {
      products: Product[];
    };

export type ProductFormData = {
  name: string;
  description: string;
  price: string;
  currency: string;
  isPublished: boolean;
};