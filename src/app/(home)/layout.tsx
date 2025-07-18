import Header from "@/components/header/Header";
import { SessionProvider } from "@/providers/SessionProvider";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Header />
      {children}
    </SessionProvider>
  );
}
