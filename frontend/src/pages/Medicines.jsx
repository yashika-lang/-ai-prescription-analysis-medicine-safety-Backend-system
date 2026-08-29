import { useMemo, useState } from "react";
import { Search, Pill } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { getAllMedicines } from "../services/medicineService";

export default function Medicines() {
  const { authHeader } = useAuth();
  const { data: medicines, loading, error } = useAsync(() => getAllMedicines(authHeader), [authHeader]);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!medicines) return [];
    const q = query.trim().toLowerCase();
    if (!q) return medicines;
    return medicines.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.ingredients?.toLowerCase().includes(q) ||
        m.manufacturer?.toLowerCase().includes(q)
    );
  }, [medicines, query]);

  return (
    <AppLayout>
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Medicine catalogue</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Every medicine Pillie has seen, with the ingredients used for allergy cross-checks.
      </p>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
        <Input
          placeholder="Search by name, ingredient, or manufacturer"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-10"
        />
      </div>

      <div className="mt-8">
        {loading && (
          <div className="flex items-center gap-2 text-ink-soft">
            <Spinner /> Loading medicines…
          </div>
        )}

        {error && <Alert variant="error">Couldn&rsquo;t load the medicine catalogue. Please try again.</Alert>}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            icon={Pill}
            title={query ? "No matches found" : "No medicines yet"}
            description={
              query
                ? "Try a different search term."
                : "Medicines appear here once they're uploaded or extracted from a prescription."
            }
          />
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((medicine) => {
              const allergens = new Set();
              medicine.ingredientSet?.forEach((ingredient) =>
                ingredient.allergens?.forEach((allergen) => allergens.add(allergen.name))
              );

              return (
                <div
                  key={medicine.id}
                  className="rounded-3xl border border-ink/10 bg-paper p-6 transition-colors duration-300 hover:border-brand/30"
                >
                  <h3 className="font-display text-lg text-ink">{medicine.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft/60">
                    {medicine.manufacturer || "Manufacturer unknown"}
                  </p>
                  <p className="mt-3 text-sm text-ink-soft">
                    <span className="font-medium text-ink">Ingredients: </span>
                    {medicine.ingredients || "Not recorded"}
                  </p>
                  {medicine.usage && (
                    <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{medicine.usage}</p>
                  )}
                  {allergens.size > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {[...allergens].map((allergen) => (
                        <span
                          key={allergen}
                          className="rounded-full bg-alert-soft px-2.5 py-1 text-xs font-medium text-alert"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
