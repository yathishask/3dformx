import React from 'react';
import { Hero } from '../components/home/Hero';
import { HomeProductSections } from '../components/home/HomeProductSections';

export const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <HomeProductSections />
    </div>
  );
};

