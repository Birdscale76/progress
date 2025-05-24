import React from 'react';
import { ThemeSwitcher } from "@/components/theme-switcher";

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="fixed bottom-0 flex-none w-full border-t border-foreground/10 bg-background h-16" >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-12 lg:px-16 py-4 h-16">
        <p className="text-primary text-xs md:text-base text-center">
          © {new Date().getFullYear()} Drone Progress Pro. All rights reserved.
        </p>
        <div className="flex items-center gap-0 md:gap-2 ">
          <p className="text-primary text-xs md:text-base text-center">
            Powered by{' '}
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
  );
};

export default Footer;
