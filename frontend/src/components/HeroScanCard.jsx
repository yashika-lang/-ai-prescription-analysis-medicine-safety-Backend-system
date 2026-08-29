import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useReducedMotion } from "../hooks/useReducedMotion";

const LINES = [
  { width: "72%", chip: "Combiflam · 2 tab" },
  { width: "58%", chip: "Ibuprofen + Paracetamol" },
  { width: "64%", chip: "After breakfast · 5 days" },
];

export default function HeroScanCard() {
  const reduced = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-sm select-none">
      {/* ambient drift wrapper */}
      <div className={reduced ? "" : "animate-drift"}>
        <div className="relative overflow-hidden rounded-[28px] border border-ink/10 bg-paper shadow-[0_30px_60px_-25px_rgba(16,21,26,0.45)]">
          {/* card header strip */}
          <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
            <span className="font-display text-lg tracking-tight text-ink">Pillie</span>
            <span className="flex h-2 w-2 rounded-full bg-brand" />
          </div>

          {/* "prescription" body */}
          <div className="relative space-y-4 px-6 py-8">
            {LINES.map((line, index) => (
              <div key={line.chip} className="relative">
                <div
                  className="h-3 rounded-full bg-ink/10"
                  style={{ width: line.width }}
                />
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduced ? 0 : 0.6 + index * 0.35,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className="mt-2 inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-dark"
                >
                  {line.chip}
                </motion.span>
              </div>
            ))}

            {/* scan line sweep */}
            {!reduced && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-[28px]">
                <div className="animate-scan absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-brand/25 to-transparent" />
              </div>
            )}
          </div>

          {/* safety verdict */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 1.7, duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-3 border-t border-ink/10 bg-brand-soft px-6 py-4"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-paper">
              <Check size={15} strokeWidth={3} />
            </span>
            <p className="text-sm font-medium text-brand-dark">
              No conflicts with your allergy profile
            </p>
          </motion.div>
        </div>
      </div>

      {/* floating alert chip, offset from the card — the honest counter-example */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: reduced ? 0 : 2.1, duration: 0.45, ease: "easeOut" }}
        className="absolute -left-6 top-10 hidden items-center gap-2 rounded-2xl border border-alert/20 bg-paper px-4 py-3 shadow-[0_20px_40px_-20px_rgba(178,58,46,0.4)] sm:flex"
      >
        <span className="h-2 w-2 rounded-full bg-alert" />
        <span className="text-xs font-medium text-alert">Penicillin allergy match</span>
      </motion.div>
    </div>
  );
}
