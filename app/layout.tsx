import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { checkUserStatus } from "./actions/authActions";
import StoreProvider from "./StoreProvider";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

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
  const headersList = await headers();
  const currentPath = headersList.get("x-pathname") || "";
  const isAuthPage = currentPath === "/login" || currentPath.startsWith("/sign-up");

  const { authenticated, status, role } = await checkUserStatus();

  // 1. Basic Auth & Status Check
  if (authenticated && status !== "Active" && status !== "Approved" && !isAuthPage) {
    redirect("/login");
  }

  // 2. Role-Based Access Control for Admin Routes
  if (currentPath.startsWith("/admin") && role !== "admin") {
    redirect("/"); // Or to a "Not Authorized" page
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <StoreProvider>
            <Toaster richColors position="top-center" />
            {!isAuthPage && <Navbar />}
            <div className={isAuthPage ? "" : "container"} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
              <main style={{ flex: 1 }}>
                {children}
              </main>
              {!isAuthPage && <Footer />}
            </div>
          </StoreProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
