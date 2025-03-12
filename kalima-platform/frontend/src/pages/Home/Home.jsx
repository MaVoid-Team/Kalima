import { HeroSection } from "./hero-section"
import { AboutSection } from "./about-section"
import { AppDownloadSection } from "./app-download-section"
import { ServicesSection } from "./services-section"
import { CoursesSection } from "./courses-section"
import { TeachersSection } from "./teachers-section"

function Home() {
  return (
    <div className="w-full overflow-x-hidden p-14">
      <HeroSection />
      <AboutSection />
      <AppDownloadSection />
      <ServicesSection />
      <CoursesSection />
      <TeachersSection />
    </div>
  )
}

export default Home

