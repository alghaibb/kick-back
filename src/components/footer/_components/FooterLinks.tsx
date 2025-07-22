import Link from "next/link";

const links = [
  { title: "Features", href: "#" },
  { title: "Solution", href: "#" },
  { title: "Customers", href: "#" },
  { title: "Pricing", href: "#" },
  { title: "Help", href: "#" },
  { title: "About", href: "#" },
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
