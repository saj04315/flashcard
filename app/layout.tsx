import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { checkUserStatus } from "./actions/authActions";
import StoreProvider from "./StoreProvider";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Flashcard App",
  description: "A beautiful flashcard application",
};

import { Toaster } from "sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // headers() throws during static pre-rendering (e.g. /_not-found at build time).
  // Wrap in try/catch so the build doesn't fail — fall back to safe defaults.
  let currentPath = "";
  let authenticated = false;
  let status: string | undefined;
  let role: string | undefined;
  let teacher: string | undefined;

  try {
    const headersList = await headers();
    currentPath = headersList.get("x-pathname") || "";

    const userStatus = await checkUserStatus();
    authenticated = userStatus.authenticated ?? false;
    status = (userStatus as any).status;
    role = (userStatus as any).role;
    teacher = (userStatus as any).user?.teacher || (userStatus as any).teacher;
  } catch {
    // Static pre-render context — skip auth checks
  }

  const isAuthPage = currentPath === "/login" || currentPath.startsWith("/sign-up");
  const isOnboardingPage = currentPath === "/onboarding";

  // 1. Basic Auth & Status Check
  if (authenticated) {
    if (status !== "Active" && status !== "Approved") {
      const needsOnboarding = !teacher || teacher === "unknown";
      if (needsOnboarding && !isOnboardingPage && !isAuthPage) {
         redirect("/onboarding");
      } else if (!needsOnboarding && !isAuthPage) {
         redirect("/login");
      } else if (needsOnboarding && isAuthPage && currentPath !== "/sign-up") {
         // If they need onboarding but are on login, redirect to onboarding. 
         // Allow them to be on sign-up if they are still completing it.
         if (currentPath === "/login") {
            redirect("/onboarding");
         }
      }
    } else if (isAuthPage || isOnboardingPage) {
      redirect("/");
    }
  }

  // 2. Role-Based Access Control for Admin Routes
  if (currentPath.startsWith("/admin") && role !== "admin" && role !== "teacher") {
    redirect("/"); // Or to a "Not Authorized" page
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <StoreProvider>
            <Toaster richColors position="top-center" />
            {!isAuthPage && !isOnboardingPage && <Suspense fallback={null}><Navbar /></Suspense>}
            <div className={isAuthPage || isOnboardingPage ? "" : "container"} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
              <main style={{ flex: 1 }}>
                {children}
              </main>
              {!isAuthPage && !isOnboardingPage && <Footer />}
            </div>
            {authenticated  && !isAuthPage && !isOnboardingPage && (
              <Link href="/farm" className="FarmFloatButton">
                <Image src="/farm/btn.png" alt="Farm button" width={72} height={72} />
              </Link>
            )}
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
