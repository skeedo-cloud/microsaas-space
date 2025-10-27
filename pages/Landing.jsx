import React from 'react';
import Header from '../components/landing/Header';
import AnimatedHero from '../componentsv2/AnimatedHero';
import ValueProposition from '../components/landing/ValueProposition';
import NewsletterSignup from '../components/landing/NewsletterSignup';
import FeaturedIdea from '../components/landing/FeaturedIdea';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/landing/Footer';
import LiveSocialProof from '../componentsv2/LiveSocialProof';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Header />
      <main>
        <AnimatedHero />
        <ValueProposition />
        <NewsletterSignup />
        <FeaturedIdea />
        <Testimonials />
      </main>
      <Footer />
      <LiveSocialProof/>
    </div>
  );
}