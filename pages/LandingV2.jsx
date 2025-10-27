import React from 'react';
import Header from '../components/landing/Header';
import PersonalizedHero from '../componentsv2/PersonalizedHero';
import EnhancedValueProposition from '../componentsv2/EnhancedValueProposition';
import MultiStepSignup from '../componentsv2/MultiStepSignup';
import IdeaCarousel from '../componentsv2/IdeaCarousel';
import ROICalculator from '../componentsv2/ROICalculator';
import EnhancedTestimonials from '../componentsv2/EnhancedTestimonials';
import LiveSocialProof from '../componentsv2/LiveSocialProof';
import ScrollProgress from '../componentsv2/ScrollProgress';
import AnalyticsTracker, { trackEvent } from '../componentsv2/AnalyticsTracker';
import LazyLoadWrapper from '../componentsv2/LazyLoadWrapper';
import Footer from '../components/landing/Footer';

export default function LandingV2() {
  // Track CTA clicks
  const handleCTAClick = (location) => {
    trackEvent('cta_click', { location });
  };

  return (
    <AnalyticsTracker>
      <div className="min-h-screen bg-[#FAFAF9]">
        <ScrollProgress />
        <Header />
        <main>
          {/* Above fold - load immediately */}
          <PersonalizedHero />
          
          {/* Below fold - lazy load */}
          <LazyLoadWrapper>
            <EnhancedValueProposition />
          </LazyLoadWrapper>

          <LazyLoadWrapper>
            <IdeaCarousel />
          </LazyLoadWrapper>

          <LazyLoadWrapper>
            <ROICalculator />
          </LazyLoadWrapper>

          <LazyLoadWrapper>
            <MultiStepSignup />
          </LazyLoadWrapper>

          <LazyLoadWrapper>
            <EnhancedTestimonials />
          </LazyLoadWrapper>
        </main>
        <Footer />
        <LiveSocialProof />
      </div>
    </AnalyticsTracker>
  );
}