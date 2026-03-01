import WelcomeSection from "@/components/LandingPage/WelcomeSection";
import AboutSection from "@/components/LandingPage/AboutSection";
import LearningJourneySection from "@/components/LandingPage/LearningJourneySection";
import MarketplaceSection from "@/components/LandingPage/MarketplaceSection";
import SuccessStoriesSection from "@/components/LandingPage/SuccessStoriesSection";
import AppDownloadSection from "@/components/LandingPage/AppDownloadSection";

export default function LandingPage() {
  return (
    <>
      <WelcomeSection />
      <LearningJourneySection />
      <AboutSection />
      <MarketplaceSection />
      <SuccessStoriesSection />
      <AppDownloadSection />
    </>
  );
}
