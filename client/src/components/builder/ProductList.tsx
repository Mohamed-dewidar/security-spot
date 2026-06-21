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
    <ul className="flex flex-col gap-24 p-1 lg:grid lg:grid-cols-2 lg:gap-15 xl:flex xl:flex-row xl:items-stretch xl:gap-15">
      {products.map((product) => {
        const activeVariantId = getActiveVariantId(product);
        const quantity = getQuantity(product);
        const minQuantity = getMinQuantity(product);

        return (
          <li
            key={product.id}
            className="min-w-0 last:odd:lg:col-span-2 last:odd:lg:max-w-[360px] last:odd:lg:justify-self-center xl:col-span-auto xl:max-w-none xl:flex-1 xl:justify-self-auto"
          >
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
