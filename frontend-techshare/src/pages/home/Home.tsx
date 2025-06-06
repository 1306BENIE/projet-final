import HeroSection from "@/components/home/HeroSection";
import WhySection from "@/components/home/WhySection";
import AvailableToolsSection from "@/components/home/AvailableToolsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <WhySection />
      <AvailableToolsSection />
    </div>
  );
}
