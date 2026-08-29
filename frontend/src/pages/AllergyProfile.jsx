import { useState } from "react";
import { Plus, ShieldAlert } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { addAllergy, getAllergies } from "../services/userService";

export default function AllergyProfile() {
  const { user, authHeader } = useAuth();
  const { data: allergies, loading, error, refetch } = useAsync(
    () => getAllergies(user.email, authHeader),
    [user.email, authHeader]
  );

  const [newAllergy, setNewAllergy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const onAdd = async (event) => {
    event.preventDefault();
    const allergy = newAllergy.trim();
    if (!allergy) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const message = await addAllergy(user.email, allergy, authHeader);
      setFeedback({ variant: message.startsWith("⚠️") ? "info" : "success", text: message.replace(/^[^\w]+/, "").trim() });
      setNewAllergy("");
      refetch();
    } catch (err) {
      setFeedback({ variant: "error", text: err.message || "Could not add that allergy." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Allergy profile</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Pillie checks every extracted medicine against this list before flagging a risk. Allergies
        detected automatically from your prescriptions are added here too.
      </p>

      <form onSubmit={onAdd} className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            label="Add an allergy"
            placeholder="e.g. Penicillin"
            value={newAllergy}
            onChange={(event) => setNewAllergy(event.target.value)}
          />
        </div>
        <Button type="submit" variant="primary" disabled={submitting} className="shrink-0">
          {submitting ? <Spinner size={16} /> : <><Plus size={16} /> Add</>}
        </Button>
      </form>

      {feedback && (
        <Alert variant={feedback.variant} className="mt-4 max-w-md">
          {feedback.text}
        </Alert>
      )}

      <div className="mt-10">
        {loading && (
          <div className="flex items-center gap-2 text-ink-soft">
            <Spinner /> Loading your allergy profile…
          </div>
        )}

        {error && <Alert variant="error">Couldn&rsquo;t load your allergy profile. Please try again.</Alert>}

        {!loading && !error && (!allergies || allergies.length === 0) && (
          <EmptyState
            icon={ShieldAlert}
            title="No allergies recorded"
            description="Add one above, or upload a prescription and Pillie will detect and add allergens automatically."
          />
        )}

        {!loading && !error && allergies?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy) => (
              <span
                key={allergy}
                className="rounded-full border border-alert/20 bg-alert-soft px-4 py-2 text-sm font-medium text-alert"
              >
                {allergy}
              </span>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
