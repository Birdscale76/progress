// app/page.tsx
import React from 'react';
import Image from 'next/image';
import "./globals.css";
import Footer from '@/components/footer';

export default function HomePage() {
  return (
    <main className=" min-h-screen w-full flex flex-col">
      {/* Hero Section */}
      <section className=" w-full h-[calc(100vh)] 
          flex flex-col lg:flex-row items-center px-4 md:px-8 justify-center snap-start">
        <div className="  mx-auto px-6 py-8 flex flex-col lg:flex-row items-center">
          <div className="max-w-xl lg:w-1/2 pt-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-color-foreground font-bold leading-tight mb-4 mt-0 md:mt-8">
              Monitor Your Site Progress from the Sky
            </h1>
            <p className="text-base md:text-lg text-color-secondary-foreground mb-6">
              Harness the power of drone imagery and AI-driven analytics to track construction progress in real time.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center lg:justify-normal items-center">
              <a
                href="#features"
                className="min-w-36 flex items-center justify-center px-3 md:px-6 py-3 bg-blue-600 text-white text-sm md:text-lg font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Explore Features
              </a>
              <a
                href="/sign-in"
                className="min-w-36 flex items-center justify-center px-3 md:px-6 py-3 bg-gray-200 text-gray-800 text-sm md:text-lg font-semibold rounded-md hover:bg-gray-300 transition"
              >
                Get Started
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 mt-4 lg:mt-0 relative">
            <Image
              src="/images/drone-hero.png" 
              alt="Drone over construction site"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className= " h-[calc(100vh-4rem)] pt-20 md:pt-24 bg-muted-foreground/25 snap-start ">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 md:mb-8 gap-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-0 md:px-4">
            <div className="bg-card/90 p-6 rounded-lg shadow-md">
              <h3 className="text-base md:text-xl font-semibold mb-2">Automated Surveys</h3>
              <p className="text-color-foreground text-sm md:text-base">
                Schedule and automate drone flights, capturing high-resolution imagery without manual intervention.
              </p>
            </div>
            <div className="bg-card/90 p-6 rounded-lg shadow-md">
              <h3 className="text-base md:text-xl font-semibold mb-2">3D Progress Models</h3>
              <p className="text-color-foreground text-sm md:text-base">
                Generate 3D models from drone data and compare them against project timelines for accurate progress visualization.
              </p>
            </div>
            <div className="bg-card/90 p-6 rounded-lg shadow-md md-30">
              <h3 className="text-base md:text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-color-foreground text-sm md:text-base">
                Interactive dashboards with metrics, heatmaps, and trend analysis to keep stakeholders informed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id ="cta" className="h-[calc(100vh-4rem)] bg-muted-foreground/25
      flex flex-col snap-start">
        <div className="py-4 md:py-12 px-4 bg-destructive text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Project?</h2>
          <p className="mb-6">
            Sign up now and get a free demo flight analysis tailored to your next site.
          </p>
          <a href="mailto:support@birdscale.com" className="inline-block px-8 py-4 
          bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition">
            Request Demo
          </a>
        </div>

        <div className="max-w-7xl mx-auto p-4 items-center">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-4 gap-4">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-0 md:px-4">
            <div className="bg-card/90 p-3 md:p-6 rounded-lg shadow-md">
              <h3 className="text-center text-sm md:text-base lg:text-lg font-semibold ">Email</h3>
              <p className="text-color-foreground text-center text-xs md:text-sm lg:text-base">
                <a href="mailto:support@birdscale.com" className=" text-center font-medium underline">support@birdscale.com</a>
              </p>
            </div>
            <div className="bg-card/90 p-3 md:p-6 rounded-lg shadow-md">
              <h3 className="text-center text-sm md:text-base lg:text-lg font-semibold ">Phone</h3>
              <p className="text-color-foreground text-center text-xs md:text-sm lg:text-base">
                +91 99999 00000
              </p>
            </div>
            <div className="bg-card/90 p-3 md:p-6 rounded-lg shadow-md">
              <h3 className="text-center text-sm md:text-base lg:text-lg font-semibold ">Address</h3>
              <p className="text-color-foreground text-center text-xs md:text-sm lg:text-base">
                12, Montana Avenue, Trilok Villas, Civil Aerodrome Post, Coimbatore-641014
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
