// app/page.tsx
import React from 'react';
import Image from 'next/image';
import "./globals.css";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function HomePage() {
  return (
    <main className=" min-h-screen w-full flex flex-col ">
      {/* Hero Section */}
      <section className=" w-full h-[calc(100vh-4rem)] 
          flex flex-col lg:flex-row items-center justify-center">
        <div className="  mx-auto px-6 py-16 flex flex-col lg:flex-row items-center">
          <div className="max-w-xl lg:w-1/2 pt-8">
            <h1 className="text-4xl sm:text-5xl text-color-foreground font-bold leading-tight mb-4">
              Monitor Your Site Progress from the Sky
            </h1>
            <p className="text-base md:text-lg text-color-secondary-foreground mb-6">
              Harness the power of drone imagery and AI-driven analytics to track construction progress in real time.
            </p>
            <div className="flex flex-row gap-4 justify-center lg:justify-normal">
              <a
                href="#features"
                className="px-3 md:px-6 py-3 bg-blue-600 text-white text-sm md:text-lg font-semibold rounded-md hover:bg-blue-700 transition"
              >
                Explore Features
              </a>
              <a
                href="/sign-in"
                className="px-3 md:px-6 py-3 bg-gray-200 text-gray-800 text-sm md:text-lg font-semibold rounded-md hover:bg-gray-300 transition"
              >
                Get Started
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0 relative">
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
      <section id="features" className= " h-[calc(100vh+1rem)] pt-16 bg-muted-foreground/25 ">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 gap-4">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card/90 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Automated Surveys</h3>
              <p className="text-color-foreground text-sm md:text-base">
                Schedule and automate drone flights, capturing high-resolution imagery without manual intervention.
              </p>
            </div>
            <div className="bg-card/90 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">3D Progress Models</h3>
              <p className="text-color-foreground text-sm md:text-base">
                Generate 3D models from drone data and compare them against project timelines for accurate progress visualization.
              </p>
            </div>
            <div className="bg-card/90 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-color-foreground text-sm md:text-base">
                Interactive dashboards with metrics, heatmaps, and trend analysis to keep stakeholders informed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id ="cta" className="h-[calc(100vh-4rem)] 
      flex flex-col">
        <div className="py-8 md:py-16 bg-destructive text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Project?</h2>
          <p className="mb-6">
            Sign up now and get a free demo flight analysis tailored to your next site.
          </p>
          <a href="mailto:support@birdscale.com" className="inline-block px-8 py-4 
          bg-white text-blue-600 font-semibold rounded-md hover:bg-gray-100 transition">
            Request Demo
          </a>
        </div>

        <div className="max-w-7xl mx-auto gap-8 p-8 items-center">
          <h2 className="text-3xl font-bold text-center gap-4">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-card/50 p-3 md:p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <p className="text-color-foreground text-sm md:text-base">
                <a href="mailto:support@birdscale.com" className=" font-medium underline">support@birdscale.com</a>
              </p>
            </div>
            <div className="bg-card/50 p-3 md:p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <p className="text-color-foreground text-sm md:text-base">
                +1 (123) 456-7890
              </p>
            </div>
            <div className="bg-card/50 p-3 md:p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Address</h3>
              <p className="text-color-foreground text-sm md:text-base">
                123 Main Street, City, Country
              </p>
            </div>
          </div>
        </div>
      </section>
      <footer id="foot note" className="flex-none w-full border-t border-foreground/10 bg-background h-16">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between px-5 py-2 h-16">
                <p className="text-primary text-xs md:text-base text-center">
                  © {new Date().getFullYear()} Drone Progress Pro. All rights reserved.
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-primary text-xs md:text-base text-center">
                    Powered by{" "}
                    <a
                      href="https://birdscale.com"
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold hover:underline"
                    >
                      Birdscale
                    </a>
                  </p>
                  <ThemeSwitcher />
                </div>
              </div>
            </footer> 
    </main>
  );
}
