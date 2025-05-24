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
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
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
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
              <div className="w-full flex justify-between items-center px-8 sm:px-8 md:px-12 lg:px-16">
                <div className="flex gap-5 items-center text-sm md:text-lg font-semibold">
                  <Link href="/">Progress Pro</Link>
                </div>
                <HeaderAuth />
              </div>
            </nav>

            <div className="flex-1 w-full flex flex-col items-center  bg-muted-foreground/10">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
