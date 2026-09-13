import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBadges />
      <CategoryGrid />
      <FeaturedProducts />
    </main>
  );
}
