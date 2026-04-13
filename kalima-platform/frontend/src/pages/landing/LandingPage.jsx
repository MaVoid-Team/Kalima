import { Suspense, lazy } from "react";
import WelcomeSection from "@/components/LandingPage/WelcomeSection";
import BackgroundAnimation from "@/components/LandingPage/BackgroundAnimation";

const AboutSection = lazy(() => import("@/components/LandingPage/AboutSection"));
const LearningJourneySection = lazy(() => import("@/components/LandingPage/LearningJourneySection"));
const MarketplaceSection = lazy(() => import("@/components/LandingPage/MarketplaceSection"));
const SuccessStoriesSection = lazy(() => import("@/components/LandingPage/SuccessStoriesSection"));
const AppDownloadSection = lazy(() => import("@/components/LandingPage/AppDownloadSection"));

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
          <section
            key={section.key}
            className={`min-h-screen will-change-transform ${index === 0 ? 'pb-6 md:pb-10' : 'py-6 md:py-10'}`}
          >
            <Suspense fallback={<div className="min-h-screen animate-pulse bg-muted/5 rounded-3xl m-10" />}>
              {section.component}
            </Suspense>
          </section>
        ))}
      </main>
    </>
  );
}
