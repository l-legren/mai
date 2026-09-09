import { Hero, SiteHeader } from '@/app/components/marketing';

const LandingPage = () => {
  return (
    <div className="flex min-h-svh flex-col bg-bg">
      <SiteHeader />
      <Hero />
    </div>
  );
};

export default LandingPage;
