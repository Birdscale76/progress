import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Progress Pro",
  description: "Aerial Intelligence for seamless progress monitoring",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
    <main className="min-h-screen flex flex-col w-full bg-background text-foreground ">
            <nav className="fixed top-0 w-full flex justify-center bg-background border-b border-b-foreground/10 h-16 z-50">
              <div className="w-full flex justify-between items-center px-6 md:px-12 lg:px-16">
                <div className="flex items-center text-base md:text-lg font-semibold">
                  <Link href="/">Progress Pro</Link>
                </div>
                <HeaderAuth />
              </div>
            </nav>

            <div className="pt-16 h-screen overflow-y-auto snap-y snap-mandatory">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
