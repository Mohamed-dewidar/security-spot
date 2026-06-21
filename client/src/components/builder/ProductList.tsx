import { ProductCard } from "@/components/builder/ProductCard";
import type { Product } from "@/types/catalog";

type ProductListProps = {
  products: Product[];
  currency: string;
  getActiveVariantId: (product: Product) => string;
  getQuantity: (product: Product) => number;
  getMinQuantity: (product: Product) => number;
  onVariantChange: (productId: string, variantId: string) => void;
  onQuantityChange: (
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ) => void;
};

export function ProductList({
  products,
  currency,
  getActiveVariantId,
  getQuantity,
  getMinQuantity,
  onVariantChange,
  onQuantityChange,
}: ProductListProps) {
  return (
    <ul className="flex flex-col gap-24 lg:gap-x-15 lg:flex-row lg:overflow-x-auto p-1">
      {products.map((product) => {
        const activeVariantId = getActiveVariantId(product);
        const quantity = getQuantity(product);
        const minQuantity = getMinQuantity(product);

        return (
          <li key={product.id}>
            <ProductCard
              product={product}
              currency={currency}
              activeVariantId={activeVariantId}
              quantity={quantity}
              minQuantity={minQuantity}
              onVariantChange={(variantId) =>
                onVariantChange(product.id, variantId)
              }
              onQuantityChange={(nextQuantity) =>
                onQuantityChange(
                  product.id,
                  product.variants?.length ? activeVariantId : undefined,
                  nextQuantity,
                )
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
