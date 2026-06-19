import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/anim/Reveal";
import ProductCard from "@/components/shop/ProductCard";
import { getFeaturedProducts } from "@/lib/services/product.service";

export default async function HotProducts() {
  let products: Awaited<ReturnType<typeof getFeaturedProducts>> = [];
  try {
    products = await getFeaturedProducts(4);
  } catch {
    /* DB transiently unavailable — section just hides */
  }

  if (products.length === 0) return null;

  return (
    <section id="hot" className="bg-paper relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          kicker="Hot from the harvest"
          title="This season's favourites"
          intro="The varieties Sri Lankan kitchens reach for again and again — milled in small batches and switched to the weight that suits you."
          link={{ label: "Shop all rice", href: "/shop" }}
        />

        <Reveal
          stagger={0.12}
          y={40}
          className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
