/**
 * Landing Page
 * Public-facing pre-order landing page for Automet
 */

import { useState } from 'react';
import Head from 'next/head';
import Navigation from '@/components/landing/Navigation';
import Hero from '@/components/landing/Hero';
import ProblemSolution from '@/components/landing/ProblemSolution';
import Features from '@/components/landing/Features';
import ROICalculator from '@/components/landing/roi/ROICalculator';
import Pricing from '@/components/landing/Pricing';
import BlogPreview from '@/components/landing/BlogPreview';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';

export default function LandingPage() {
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Automet - Field Job Management Made Simple for Indian AMC Vendors</title>
        <meta
          name="description"
          content="Complete field service management platform built for Indian AMC vendors. Manage technicians, track jobs, handle inventory, and get paid faster - all in one place."
        />
        <meta name="keywords" content="AMC management, field service management, technician tracking, job management, inventory tracking, Indian field service software" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Open Graph */}
        <meta property="og:title" content="Automet - Field Job Management Made Simple" />
        <meta property="og:description" content="Built for Indian AMC vendors. Manage technicians, track jobs, and get paid faster." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://automet.in" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Automet - Field Job Management Made Simple" />
        <meta name="twitter:description" content="Built for Indian AMC vendors. Manage technicians, track jobs, and get paid faster." />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Hero Section */}
        <Hero onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Problem-Solution Section */}
        <ProblemSolution />

        {/* Features Section */}
        <Features />

        {/* ROI Calculator Section */}
        <ROICalculator />

        {/* Pricing Section */}
        <Pricing onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Blog Preview Section */}
        <BlogPreview />

        {/* FAQ Section */}
        <FAQ />

        {/* Footer */}
        <Footer />

        {/* Pre-order Modal */}
        <PreorderModal
          isOpen={preorderModalOpen}
          onClose={() => setPreorderModalOpen(false)}
        />
      </div>
    </>
  );
}
