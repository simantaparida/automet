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
import Trust from '@/components/landing/Trust';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';
import PreorderModal from '@/components/landing/PreorderModal';
import ContactSupportModal from '@/components/landing/ContactSupportModal';

export default function LandingPage() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://automet.app';
  const [preorderModalOpen, setPreorderModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('starter');

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Automet',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    description: 'Field service management software for AMC vendors in India. Manage technicians, track jobs, inventory management, and automate billing.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: '499',
      highPrice: '2499',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      ratingCount: '1',
    },
  };

  return (
    <>
      <Head>
        <title>
          Automet - Best Field Service Management Software for AMC Vendors in India
        </title>
        <meta
          name="description"
          content="Automet is the leading field service management software for Indian AMC vendors. Track technicians in real-time, manage jobs & inventory, automate billing. Start free trial today!"
        />
        <meta
          name="keywords"
          content="field service management software India, AMC management software, technician tracking app, job scheduling software, inventory management for service business, billing automation India, FSM software"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Automet" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        {/* Open Graph */}
        <link rel="canonical" href={siteUrl} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Automet" />
        <meta property="og:title" content="Automet - Best Field Service Management Software for AMC Vendors in India" />
        <meta property="og:description" content="Track technicians in real-time, manage jobs & inventory, automate billing. Built for Indian AMC vendors. Start your free trial today!" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Automet - Field Service Management Software" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Automet - Best Field Service Management Software for AMC Vendors" />
        <meta name="twitter:description" content="Track technicians, manage jobs & inventory, automate billing. Built for Indian AMC vendors. Start free trial!" />
        <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
        <meta name="twitter:site" content="@automet_app" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Navigation onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Hero Section */}
        <Hero onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Problem-Solution Section */}
        <ProblemSolution onPreorderClick={() => setPreorderModalOpen(true)} />

        {/* Features Section */}
        <Features />

        {/* Pricing Section */}
        <Pricing
          onPreorderClick={(planName) => {
            if (planName) setSelectedPlan(planName);
            setPreorderModalOpen(true);
          }}
        />

        {/* ROI Calculator Section - Moved after Pricing */}
        <ROICalculator />

        {/* Trust Section */}
        <Trust />

        {/* FAQ Section */}
        <FAQ onContactClick={() => setContactModalOpen(true)} />

        {/* Footer */}
        <Footer />

        {/* Pre-order Modal */}
        <PreorderModal
          isOpen={preorderModalOpen}
          onClose={() => setPreorderModalOpen(false)}
          defaultPlan={selectedPlan}
        />

        {/* Contact Support Modal */}
        <ContactSupportModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
        />
      </div>
    </>
  );
}
