import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import clsx from "clsx";

const STYLES = {
  success: { icon: CheckCircle2, wrap: "border-brand/25 bg-brand-soft text-brand-dark" },
  error: { icon: XCircle, wrap: "border-alert/25 bg-alert-soft text-alert" },
  warning: { icon: AlertTriangle, wrap: "border-alert/25 bg-alert-soft text-alert" },
  info: { icon: Info, wrap: "border-ink/10 bg-paper-dim text-ink-soft" },
};

export default function Alert({ variant = "info", title, children, className }) {
  const { icon: Icon, wrap } = STYLES[variant] ?? STYLES.info;

  return (
    <div className={clsx("flex items-start gap-3 rounded-2xl border px-4 py-3.5", wrap, className)}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="text-sm leading-relaxed">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
    </div>
  );
}
