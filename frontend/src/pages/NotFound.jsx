import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center text-ink">
      <span className="font-display text-7xl tracking-tight text-ink/15">404</span>
      <h1 className="mt-4 font-display text-2xl tracking-tight text-ink">This page doesn&rsquo;t exist</h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        The page you&rsquo;re looking for may have moved, or the link might be broken.
      </p>
      <Button as={Link} to="/" variant="primary" className="mt-8">
        <ArrowLeft size={16} />
        Back to home
      </Button>
    </div>
  );
}
