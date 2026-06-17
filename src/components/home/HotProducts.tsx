import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/anim/Reveal";
import ProductShowcaseCard from "@/components/home/ProductShowcaseCard";
import { HOT_PRODUCTS } from "@/lib/data";

export default function HotProducts() {
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
          {HOT_PRODUCTS.map((p) => (
            <ProductShowcaseCard key={p.slug} product={p} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
