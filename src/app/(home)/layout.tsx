import Navbar from "@/components/navbar/Navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background dark:bg-background">
      <div className="relative z-10">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
