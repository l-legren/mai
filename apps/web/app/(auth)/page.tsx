import SiteHeader from '../components/marketing/SiteHeader';
import Hero from '../components/marketing/Hero';

const LandingPage = () => {
  return (
    <div className="flex min-h-svh flex-col bg-[#171316]">
      <SiteHeader />
      <Hero />
    </div>
  );
};

export default LandingPage;
