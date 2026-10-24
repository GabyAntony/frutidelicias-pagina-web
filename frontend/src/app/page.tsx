import { CartDrawer } from "@/components/cart/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { OurStory } from "@/components/OurStory";
import { SignatureCollection } from "@/components/SignatureCollection";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <SignatureCollection />
        <OurStory />
        <Testimonials />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
