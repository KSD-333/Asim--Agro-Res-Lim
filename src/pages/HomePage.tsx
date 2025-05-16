import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import FeatureSection from '../components/home/FeatureSection';
import TestimonialSection from '../components/home/TestimonialSection';
import CallToAction from '../components/home/CallToAction';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <FeatureSection />
      <TestimonialSection />
      <CallToAction />
    </>
  );
};

export default HomePage;