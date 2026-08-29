import Alert from "./ui/Alert";

// Backend risk messages start with a decorative emoji (⚠️/✅) which is redundant
// next to the Alert component's own icon - stripped for display only, text kept intact.
function stripLeadingEmoji(text) {
  return typeof text === "string" ? text.replace(/^[^\w]+/, "").trim() : text;
}

export default function MedicineResultCard({ result }) {
  const {
    medicine,
    quantity,
    timing,
    duration,
    ingredients,
    allergensDetected = [],
    riskMessage,
    userAllergyMatch,
  } = result;

  const variant = userAllergyMatch ? "error" : allergensDetected.length > 0 ? "warning" : "success";

  return (
    <div className="rounded-3xl border border-ink/10 bg-paper p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-xl text-ink">{medicine}</h3>
        {allergensDetected.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allergensDetected.map((allergen) => (
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

      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-soft/60">Quantity</dt>
          <dd className="mt-0.5 text-ink">{quantity || "Not found"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-soft/60">Timing</dt>
          <dd className="mt-0.5 text-ink">{timing || "Not found"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-soft/60">Duration</dt>
          <dd className="mt-0.5 text-ink">{duration || "Not found"}</dd>
        </div>
      </dl>

      {ingredients && (
        <p className="mt-4 text-sm text-ink-soft">
          <span className="font-medium text-ink">Ingredients: </span>
          {ingredients}
        </p>
      )}

      <Alert variant={variant} className="mt-5">
        {stripLeadingEmoji(riskMessage)}
      </Alert>
    </div>
  );
}
