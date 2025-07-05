import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-indigo-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      {/* Main Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        {/* Branding */}
        <div className="absolute top-10 left-8 hidden md:block">
          <div className="flex items-center gap-2">
            <Link href="/">
              {" "}
              <Image src="/logo.png" alt="Kick Back" width={130} height={130} />
            </Link>
          </div>
        </div>

        <div className="w-full max-w-3xl space-y-8">{children}</div>
      </div>
    </div>
  );
}
