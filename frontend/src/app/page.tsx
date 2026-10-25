import { BrandPillars } from "@/components/BrandPillars";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MatchBuilder } from "@/components/MatchBuilder";
import { OurStory } from "@/components/OurStory";
import { ProductMenu } from "@/components/ProductMenu";
import { Testimonials } from "@/components/Testimonials";
import { VisitCta } from "@/components/VisitCta";
import { ChocolateDivider } from "@/components/ui/ChocolateDivider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ChocolateDivider from="var(--chocolate)" to="var(--cream)" variant="drip" />
        <BrandPillars />
        <ChocolateDivider from="var(--cream)" to="var(--chocolate)" variant="wave" />
        <ProductMenu />
        <ChocolateDivider from="var(--chocolate)" to="var(--cream)" variant="drip" />
        <MatchBuilder />
        <ChocolateDivider from="var(--cream)" to="var(--rojo)" variant="wave" />
        <OurStory />
        <ChocolateDivider from="var(--rojo)" to="var(--cream-deep)" variant="drip" />
        <Testimonials />
        <ChocolateDivider
          from="var(--cream-deep)"
          to="var(--cream)"
          variant="wave"
          className="h-10 sm:h-14"
        />
        <VisitCta />
        <ChocolateDivider from="var(--cream)" to="var(--chocolate)" variant="drip" />
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
      <CustomCursor />
    </>
  );
}
