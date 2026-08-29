import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import Button from "../ui/Button";
import MobileDrawer from "./MobileDrawer";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Ask Pillie", href: "#ask-pillie" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-ink/10 bg-paper/85 backdrop-blur-md" : "border-b border-transparent bg-paper/0"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <a href="#top" className="font-display text-xl tracking-tight text-ink">
          Pillie
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Button as={Link} to="/dashboard" variant="primary" className="px-5 py-2.5">
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" className="px-4 py-2">
                Log in
              </Button>
              <Button as={Link} to="/register" variant="primary" className="px-5 py-2.5">
                Get started
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 md:hidden"
        >
          <Menu size={22} />
        </button>
      </nav>

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        links={LINKS}
        footer={
          isAuthenticated ? (
            <Button as={Link} to="/dashboard" variant="primary" className="w-full justify-center">
              Go to dashboard
            </Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" className="w-full justify-center border border-ink/10">
                Log in
              </Button>
              <Button as={Link} to="/register" variant="primary" className="w-full justify-center">
                Get started
              </Button>
            </>
          )
        }
      />
    </header>
  );
}
