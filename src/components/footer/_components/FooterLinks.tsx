import Link from "next/link";

const links = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms of Service", href: "/terms" },
  { title: "Help", href: "/dashboard" },
  { title: "Contact", href: "/dashboard" },
];

export function FooterLinks() {
  return (
    <nav className="flex flex-wrap justify-center gap-6 text-sm">
      {links.map(({ title, href }, index) => (
        <Link
          key={index}
          href={href}
          className="text-muted-foreground hover:text-primary inline-block cursor-pointer duration-150"
          style={{ willChange: "transform" }}
        >
          {title}
        </Link>
      ))}
    </nav>
  );
}
