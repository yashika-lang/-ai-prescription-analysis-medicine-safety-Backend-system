import { forwardRef, useId } from "react";
import clsx from "clsx";

const Input = forwardRef(function Input({ label, error, className, id, name, ...props }, ref) {
  const autoId = useId();
  const inputId = id || name || autoId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        name={name}
        className={clsx(
          "rounded-xl border bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/50",
          "transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40",
          error ? "border-alert" : "border-ink/15 focus:border-brand",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-alert">{error}</p>}
    </div>
  );
});

export default Input;
