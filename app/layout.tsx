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

  const { authenticated, status, role } = await checkUserStatus();

  // 1. Basic Auth & Status Check
  if (authenticated && status !== "Active" && status !== "Approved" && currentPath !== "/login") {
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
