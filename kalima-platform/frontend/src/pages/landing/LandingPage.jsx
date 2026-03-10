import WelcomeSection from "@/components/LandingPage/WelcomeSection";
import AboutSection from "@/components/LandingPage/AboutSection";
import LearningJourneySection from "@/components/LandingPage/LearningJourneySection";
import MarketplaceSection from "@/components/LandingPage/MarketplaceSection";
import SuccessStoriesSection from "@/components/LandingPage/SuccessStoriesSection";
import AppDownloadSection from "@/components/LandingPage/AppDownloadSection";
import BackgroundAnimation from "@/components/LandingPage/BackgroundAnimation";

export default function LandingPage() {
  const sections = [
    { key: "welcome", component: <WelcomeSection /> },
    { key: "journey", component: <LearningJourneySection /> },
    { key: "about", component: <AboutSection /> },
    { key: "marketplace", component: <MarketplaceSection /> },
    { key: "stories", component: <SuccessStoriesSection /> },
    { key: "download", component: <AppDownloadSection /> },
  ];

  return (
    <>
      <BackgroundAnimation />
      <main className="relative z-10 w-full">
        {sections.map((section, index) => (
          <section key={section.key} className={`min-h-screen ${index === 0 ? 'pb-6 md:pb-10' : 'py-6 md:py-10'}`}>
            {section.component}
          </section>
        ))}
      </main>
    </>
  );
}
