import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lifting Diary",
  description: "Track your lifting progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-900/80 backdrop-blur-sm">
            <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
              <span className="text-lg font-semibold tracking-tight text-white">
                🏋️ Lifting Diary
              </span>
              <nav className="flex items-center gap-3">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
                      Get started
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-6 py-10">
            {children}
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
