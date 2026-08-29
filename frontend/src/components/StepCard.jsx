import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";

export default function StepCard({ index, icon: Icon, title, description, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: reduced ? 0 : delay, ease: "easeOut" }}
      className="group relative rounded-3xl border border-ink/10 bg-paper p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_24px_48px_-28px_rgba(16,21,26,0.35)]"
    >
      <span className="font-display text-sm text-ink-soft/60">{index}</span>
      <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark transition-colors duration-300 group-hover:bg-brand group-hover:text-paper">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>
    </motion.div>
  );
}
