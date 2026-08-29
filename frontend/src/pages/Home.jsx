import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanLine, ShieldCheck, MessagesSquare, Sparkles, ArrowRight } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import HeroScanCard from "../components/HeroScanCard";
import StepCard from "../components/StepCard";
import { useReducedMotion } from "../hooks/useReducedMotion";

const STEPS = [
  {
    icon: ScanLine,
    title: "Upload the prescription",
    description:
      "Snap a photo or upload a scan. Pillie reads it with real OCR — no manual typing required.",
  },
  {
    icon: Sparkles,
    title: "Medicines get extracted",
    description:
      "Names, dosages, and timing are pulled from the text and matched against known ingredients.",
  },
  {
    icon: ShieldCheck,
    title: "Checked against your allergies",
    description:
      "Every ingredient is cross-referenced with your allergy profile before you ever take the medicine.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

export default function Home() {
  const reduced = useReducedMotion();
  const variant = reduced ? {} : fadeUp;

  return (
    <div id="top" className="min-h-screen bg-paper text-ink">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div>
            <motion.span
              initial="hidden"
              animate="show"
              variants={variant}
              className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper-dim px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft"
            >
              Smart medicine safety
            </motion.span>

            <motion.h1
              initial="hidden"
              animate="show"
              variants={variant}
              custom={0.1}
              className="mt-6 font-display text-[2.6rem] leading-[1.08] tracking-tight text-ink sm:text-6xl"
            >
              Know what&rsquo;s in your medicine
              <span className="text-brand"> before you take it.</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="show"
              variants={variant}
              custom={0.2}
              className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg"
            >
              Pillie reads your prescription with real OCR, extracts every medicine and
              ingredient, and checks it against your allergy profile — so risks get flagged
              before you act, not after.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="show"
              variants={variant}
              custom={0.3}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Button as={Link} to="/register" variant="primary" className="w-full sm:w-auto">
                Get started free
                <ArrowRight size={16} />
              </Button>
              <Button
                as="a"
                href="#how-it-works"
                variant="ghost"
                className="w-full border border-ink/10 sm:w-auto"
              >
                See how it works
              </Button>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="show"
              variants={variant}
              custom={0.4}
              className="mt-8 text-xs text-ink-soft/70"
            >
              Backed by real Tesseract OCR, a normalized allergy database, and grounded AI
              answers — not guesses.
            </motion.p>
          </div>

          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            <HeroScanCard />
          </motion.div>
        </div>
      </section>

      {/* PRODUCT / VALUE PROPS */}
      <section id="product" className="border-t border-ink/10 bg-paper-dim/60">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
              Built on real data, not assumptions.
            </h2>
            <p className="mt-4 text-ink-soft">
              Every result you see traces back to something concrete: an OCR read, a database
              record, or a retrieved passage — never an invented answer.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Genuine OCR",
                body: "Tesseract reads the actual prescription image — no typing, no shortcuts.",
              },
              {
                title: "Normalized safety data",
                body: "Ingredients and allergens are linked in a real relational schema, not string guesses.",
              },
              {
                title: "Grounded answers",
                body: "Ask Pillie retrieves your own prescription data before it ever answers a question.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-ink/10 bg-paper p-6 transition-colors duration-300 hover:border-brand/30"
              >
                <h3 className="font-display text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
            From photo to peace of mind, in three steps.
          </h2>
          <p className="mt-4 text-ink-soft">
            The same pipeline runs every time — nothing about your safety check is left to
            chance.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <StepCard
              key={step.title}
              index={String(index + 1).padStart(2, "0")}
              icon={step.icon}
              title={step.title}
              description={step.description}
              delay={index * 0.12}
            />
          ))}
        </div>
      </section>

      {/* ASK PILLIE TEASER */}
      <section id="ask-pillie" className="border-t border-ink/10 bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-paper/70">
              Ask Pillie
            </span>
            <h2 className="mt-6 font-display text-3xl tracking-tight sm:text-4xl">
              Questions about your prescription, answered from your data.
            </h2>
            <p className="mt-4 max-w-md text-paper/70">
              Ask Pillie retrieves your extracted prescriptions before answering — grounded in
              what was actually found, not a generic model reply.
            </p>
            <Button as={Link} to="/register" variant="outline" className="mt-8">
              Try Ask Pillie
              <ArrowRight size={16} />
            </Button>
          </div>

          <div className="rounded-3xl border border-paper/10 bg-paper/[0.04] p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-wide text-paper/40">Example</p>
            <div className="mt-4 space-y-3">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-paper/10 px-4 py-3 text-sm">
                Can I take this with my penicillin allergy?
              </div>
              <div className="mr-auto flex items-start gap-2 max-w-[85%] rounded-2xl rounded-tl-sm bg-brand/20 px-4 py-3 text-sm text-paper">
                <MessagesSquare size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  Based on your last extracted prescription, this medicine does not contain
                  penicillin-related ingredients.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center sm:px-8 sm:py-28">
        <h2 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Your medicine cabinet deserves a second opinion.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          Create an account and run your first prescription check in under a minute.
        </p>
        <Button as={Link} to="/register" variant="primary" className="mt-8">
          Get started free
          <ArrowRight size={16} />
        </Button>
      </section>

      <Footer />
    </div>
  );
}
