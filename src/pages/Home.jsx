import HeroSection from "../components/home/HeroSection";
import OnDemandSection from "../components/home/OnDemandSection";
import ServicesSection from "../components/home/ServicesSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
// import InstagramSection from "../components/home/InstagramSection"; // Hobit1: hidden
// import YouTubeSection from "../components/home/YouTubeSection"; // Hobit1: hidden
import TestimonialsSection from "../components/home/TestimonialsSection";
import FaqSection from "../components/home/FaqSection";
import ContactSection from "../components/home/ContactSection";
import WhyChooseUs from "../components/home/WhyChooseUs";

function Home() {
  return (
    <main className="flex w-full flex-col gap-10 pb-16 lg:gap-12 lg:pb-24 lg:pt-5">
      <HeroSection />
      <ServicesSection />
      <WhyChooseUs />
      <HowItWorksSection />
      <OnDemandSection />
      <TestimonialsSection />
      {/* Hobit1: Instagram section hidden */}
      {/* <InstagramSection /> */}
      {/* Hobit1: YouTube section hidden */}
      {/* <YouTubeSection /> */}
      <FaqSection />
      <ContactSection />
    </main>
  );
}

export default Home;
