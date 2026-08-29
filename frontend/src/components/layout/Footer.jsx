export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <span className="font-display text-lg tracking-tight text-ink">Pillie</span>
          <p className="mt-1 max-w-xs text-sm text-ink-soft">
            Read the prescription. Check the ingredients. Flag what matters — before you take it.
          </p>
        </div>
        <p className="text-xs text-ink-soft/70">
          Pillie does not provide medical advice. Always confirm with a pharmacist or doctor.
        </p>
      </div>
    </footer>
  );
}
