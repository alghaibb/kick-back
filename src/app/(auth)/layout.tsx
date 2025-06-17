export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-3xl p-6 space-y-8 md:p-8">{children}</div>
    </div>
  );
}
