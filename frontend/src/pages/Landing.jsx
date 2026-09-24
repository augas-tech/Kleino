import Navbar from "../components/shared/Navbar.jsx";
import Footer from "../components/shared/Footer.jsx";
import Hero from "../components/landing/Hero.jsx";
import SpacesPreview from "../components/landing/SpacesPreview.jsx";
import HowItWorks from "../components/landing/HowItWorks.jsx";
import Features from "../components/landing/Features.jsx";
import FinalCta from "../components/landing/FinalCta.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <SpacesPreview />
        <HowItWorks />
        <Features />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
