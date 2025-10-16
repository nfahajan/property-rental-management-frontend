import { FeaturedProperties } from "./FeaturedProperties";
import { HeroSection } from "./HeroSection";
import { HowItWorks } from "./HowItWorks";
import { Testimonials } from "./Testimonials";


export default function Home() {
  return (
     <main className="min-h-screen">
   
      <HeroSection />
      <FeaturedProperties />
      <HowItWorks />
      <Testimonials />
     
    </main>
  );
}
