import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navbar";
import { ReactNode } from "react";

const WebsiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
