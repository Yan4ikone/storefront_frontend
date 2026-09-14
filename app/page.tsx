import Hero from "@/components/Hero";
import TrustBadges from "@/components/TrustBadges";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import { getCategories, getProducts } from "@/lib/api";

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const featuredProducts = products.slice(0, 8);

  return (
    <main>
      <Hero />
      <TrustBadges />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featuredProducts} />
    </main>
  );
}
