import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function MobileDrawer({ open, onClose, links = [], footer }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-ink/40 md:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            onClick={(event) => event.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-paper px-6 py-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl tracking-tight text-ink">Pillie</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-10 flex flex-col gap-1">
              {links.map((link) => {
                const className =
                  "rounded-xl px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink";
                return link.href.startsWith("#") ? (
                  <a key={link.href} href={link.href} onClick={onClose} className={className}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} to={link.href} onClick={onClose} className={className}>
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto flex flex-col gap-3 pb-6">{footer}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
