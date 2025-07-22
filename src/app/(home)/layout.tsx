import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";
import { GradientBackground } from "./_components/GradientBackground";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <GradientBackground />

      <div className="relative z-10">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
