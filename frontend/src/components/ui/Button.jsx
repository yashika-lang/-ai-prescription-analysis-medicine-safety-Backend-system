import { forwardRef } from "react";
import clsx from "clsx";

const variants = {
  primary:
    "bg-ink text-paper hover:bg-brand-dark active:scale-[0.98] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]",
  ghost:
    "bg-transparent text-ink hover:bg-ink/5 active:scale-[0.98]",
  outline:
    "bg-transparent text-paper border border-paper/30 hover:border-paper/70 hover:bg-paper/10 active:scale-[0.98]",
};

const Button = forwardRef(function Button(
  { as: Component = "button", variant = "primary", className, children, ...props },
  ref
) {
  return (
    <Component
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium",
        "transition-all duration-200 ease-out will-change-transform",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Button;
