import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="px-6 py-6 sm:px-8">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          Pillie
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper-dim px-3 py-1 text-xs font-medium uppercase tracking-wide text-ink-soft">
              {eyebrow}
            </span>
          )}
          <h1 className="mt-5 font-display text-3xl tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>}

          <div className="mt-8 rounded-3xl border border-ink/10 bg-paper p-6 shadow-[0_30px_60px_-40px_rgba(16,21,26,0.35)] sm:p-8">
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
        </motion.div>
      </main>
    </div>
  );
}
