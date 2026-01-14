"use client";
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/ui/Header';
import { HeroSection } from '@/components/section/HeroSection';
import { FeaturesSection } from '@/components/section/FeaturedSection';
import { CTASection } from '@/components/section/CTASection';
import { Footer } from '@/components/ui/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white relative">
      <TooltipProvider>
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </TooltipProvider>
    </div>
  );
}
