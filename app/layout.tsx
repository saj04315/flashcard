import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { checkUserStatus } from "./actions/authActions";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Flashcard App",
  description: "A beautiful flashcard application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const currentPath = headersList.get("x-pathname") || "";

  const { authenticated, status } = await checkUserStatus();

  // If user is authenticated but not active/approved, redirect to login unless already there
  if (authenticated && status !== "Active" && status !== "Approved" && currentPath !== "/login") {
    // We only redirect if we are NOT on the login page
    // Using a meta refresh or client redirect if headers doesn't work perfectly in all dev environments
    // But direct redirect is usually fine in App Router layouts.
    redirect("/login");
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <Navbar />
          <div className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
