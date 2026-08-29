import { Link } from "react-router-dom";
import { ArrowRight, ScanLine, Pill, ShieldAlert, MessagesSquare } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { getAllergies } from "../services/userService";
import { getAllMedicines } from "../services/medicineService";

const ACTIONS = [
  {
    title: "Upload a prescription",
    description: "Run real OCR and a safety check on a new prescription image.",
    icon: ScanLine,
    href: "/prescription/upload",
  },
  {
    title: "Browse medicines",
    description: "See the medicine catalogue with real ingredient data.",
    icon: Pill,
    href: "/medicines",
  },
  {
    title: "Allergy profile",
    description: "View and update the allergies Pillie checks against.",
    icon: ShieldAlert,
    href: "/allergies",
  },
  {
    title: "Ask Pillie",
    description: "Ask a question grounded in your extracted prescriptions.",
    icon: MessagesSquare,
    href: "/ask-pillie",
  },
];

export default function Dashboard() {
  const { user, authHeader } = useAuth();
  const allergies = useAsync(() => getAllergies(user.email, authHeader), [user.email, authHeader]);
  const medicines = useAsync(() => getAllMedicines(authHeader), [authHeader]);

  return (
    <AppLayout>
      <div>
        <span className="text-sm font-medium text-ink-soft">Welcome back</span>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {user?.name || user?.email}
        </h1>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-ink/10 bg-paper p-6">
          <p className="text-xs uppercase tracking-wide text-ink-soft/60">Your allergy profile</p>
          {allergies.loading ? (
            <Spinner className="mt-3 text-ink-soft" />
          ) : allergies.error ? (
            <p className="mt-2 text-sm text-alert">Couldn&rsquo;t load your allergies.</p>
          ) : allergies.data?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {allergies.data.map((allergy) => (
                <span key={allergy} className="rounded-full bg-alert-soft px-2.5 py-1 text-xs font-medium text-alert">
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">No allergies recorded yet.</p>
          )}
        </div>

        <div className="rounded-3xl border border-ink/10 bg-paper p-6">
          <p className="text-xs uppercase tracking-wide text-ink-soft/60">Medicine catalogue</p>
          {medicines.loading ? (
            <Spinner className="mt-3 text-ink-soft" />
          ) : medicines.error ? (
            <p className="mt-2 text-sm text-alert">Couldn&rsquo;t load the catalogue.</p>
          ) : (
            <p className="mt-2 font-display text-2xl text-ink">
              {medicines.data?.length ?? 0}
              <span className="ml-1.5 text-sm font-sans text-ink-soft">medicines on record</span>
            </p>
          )}
        </div>
      </div>

      <h2 className="mt-12 font-display text-xl text-ink">Quick actions</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group flex items-start gap-4 rounded-3xl border border-ink/10 bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_24px_48px_-28px_rgba(16,21,26,0.35)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark transition-colors duration-300 group-hover:bg-brand group-hover:text-paper">
              <action.icon size={20} strokeWidth={1.8} />
            </span>
            <div className="flex-1">
              <p className="font-display text-lg text-ink">{action.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{action.description}</p>
            </div>
            <ArrowRight size={18} className="mt-1 shrink-0 text-ink-soft/40 transition-transform group-hover:translate-x-1 group-hover:text-ink" />
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
