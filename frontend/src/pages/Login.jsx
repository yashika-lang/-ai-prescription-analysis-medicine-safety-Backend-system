import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/apiClient";

export default function Login() {
  const { login, sessionExpiredNotice, clearSessionExpiredNotice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      const destination = location.state?.from || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect password. Please try again.");
      } else if (err instanceof ApiError && err.status === 404) {
        setError("No account found with that email.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Log in to Pillie"
      subtitle="Check your prescriptions and allergy profile."
      footer={
        <>
          Don&rsquo;t have an account?{" "}
          <Link to="/register" className="font-medium text-ink underline underline-offset-2">
            Create one
          </Link>
        </>
      }
    >
      {sessionExpiredNotice && (
        <Alert variant="warning" className="mb-5" title="You've been signed out">
          Please log in again to continue.{" "}
          <button type="button" onClick={clearSessionExpiredNotice} className="underline underline-offset-2">
            Dismiss
          </button>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={onChange}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={onChange}
        />

        {error && <Alert variant="error">{error}</Alert>}

        <Button type="submit" variant="primary" disabled={loading} className="mt-2 justify-center">
          {loading ? <Spinner size={16} /> : (
            <>
              Log in
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
