import WelcomeSection from "../../components/LandingPage/WelcomeSection";
import AboutSection from "../../components/LandingPage/AboutSection";
import AppDownloadSection from "../../components/LandingPage/AppDownloadSection";
import SubjectsSection from "../../components/LandingPage/SubjectsSection";
import FeaturedBooklets from "../../components/LandingPage/FeaturedBooklets";

export default function LandingPage() {
  return (
    <>
      <WelcomeSection />
      <AboutSection />
      <AppDownloadSection />
      <SubjectsSection />
      <FeaturedBooklets />
    </>
  );
}
