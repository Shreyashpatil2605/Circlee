import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import { AppShowcaseSection } from "@/components/home/AppShowcaseSection";
import { DownloadCTASection } from "@/components/home/DownloadCTASection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-black">
      <HeroSection />
      <FeaturesSection />
      <PhilosophySection />
      <AppShowcaseSection />
      <DownloadCTASection />
    </div>
  );
}
