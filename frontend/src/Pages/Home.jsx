import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import WhyGoldSection from "../components/WhyGold";
import FeaturesSection from "../components/Features";
import BgVideo from "../assets/Bg-vid.mp4";
import InvestmentPlansSection from "../components/InvestmentPlansSection";
import ReferralSection from "../components/ReferralSection";
import HowItWorksSection from "../components/HowItWork";
import OnlineStatsSection from "../components/OnlineStatsSection";
import UKRegisteredCompanySection from "../components/UkRegisteredCompany";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
      >
        <source src={BgVideo} type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-10"></div>

      {/* Foreground Content */}
      <div className="relative z-50 pointer-events-auto">
        <Navbar />
        <Hero />
        <WhyGoldSection />
        <FeaturesSection />
        <InvestmentPlansSection />
        <ReferralSection />
        <HowItWorksSection />
        <OnlineStatsSection />
        <UKRegisteredCompanySection />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
