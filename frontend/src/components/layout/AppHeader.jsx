import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import clsx from "clsx";
import Button from "../ui/Button";
import MobileDrawer from "./MobileDrawer";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Upload prescription", href: "/prescription/upload" },
  { label: "Medicines", href: "/medicines" },
  { label: "Allergy profile", href: "/allergies" },
  { label: "Ask Pillie", href: "/ask-pillie" },
];

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <NavLink to="/dashboard" className="font-display text-xl tracking-tight text-ink">
          Pillie
        </NavLink>

        <div className="hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                clsx(
                  "text-sm font-medium transition-colors",
                  isActive ? "text-ink" : "text-ink-soft hover:text-ink"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <NavLink to="/profile" className="text-sm font-medium text-ink-soft hover:text-ink">
            {user?.name || user?.email}
          </NavLink>
          <Button variant="ghost" onClick={logout} className="gap-2 px-4 py-2">
            <LogOut size={15} />
            Log out
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 lg:hidden"
        >
          <Menu size={22} />
        </button>
      </nav>

      <MobileDrawer
        open={open}
        onClose={() => setOpen(false)}
        links={[...LINKS, { label: "Profile", href: "/profile" }]}
        footer={
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full justify-center gap-2 border border-ink/10"
          >
            <LogOut size={15} />
            Log out
          </Button>
        }
      />
    </header>
  );
}
