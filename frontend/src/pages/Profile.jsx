import { Link } from "react-router-dom";
import { ArrowRight, ShieldAlert, User } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { getAllergies } from "../services/userService";

export default function Profile() {
  const { user, authHeader, logout } = useAuth();
  const { data: allergies, loading } = useAsync(() => getAllergies(user.email, authHeader), [user.email, authHeader]);

  return (
    <AppLayout>
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Your profile</h1>

      <div className="mt-8 flex max-w-lg items-center gap-4 rounded-3xl border border-ink/10 bg-paper p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark">
          <User size={24} />
        </span>
        <div>
          <p className="font-display text-xl text-ink">{user?.name || "Pillie user"}</p>
          <p className="text-sm text-ink-soft">{user?.email}</p>
        </div>
      </div>

      <div className="mt-6 max-w-lg rounded-3xl border border-ink/10 bg-paper p-6">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 font-display text-lg text-ink">
            <ShieldAlert size={18} className="text-alert" /> Allergy profile
          </p>
          <Link to="/allergies" className="flex items-center gap-1 text-sm font-medium text-brand-dark hover:underline">
            Manage <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Spinner className="mt-4 text-ink-soft" />
        ) : allergies?.length ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {allergies.map((allergy) => (
              <span key={allergy} className="rounded-full bg-alert-soft px-2.5 py-1 text-xs font-medium text-alert">
                {allergy}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">No allergies recorded yet.</p>
        )}
      </div>

      <Button variant="ghost" onClick={logout} className="mt-8 border border-ink/10">
        Log out
      </Button>
    </AppLayout>
  );
}
