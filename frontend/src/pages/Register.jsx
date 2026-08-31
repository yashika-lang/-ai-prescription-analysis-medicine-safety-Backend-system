import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";

const initialForm = { name: "", email: "", password: "", age: "", gender: "", illnesses: "" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        age: form.age ? Number(form.age) : null,
        gender: form.gender || null,
        illnesses: form.illnesses.trim() || null,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your Pillie account"
      subtitle="Set up your profile so every safety check is personal to you."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-ink underline underline-offset-2">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Full name" name="name" required value={form.name} onChange={onChange} />
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
          autoComplete="new-password"
          required
          minLength={4}
          value={form.password}
          onChange={onChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Age" type="number" name="age" min="0" value={form.age} onChange={onChange} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="gender" className="text-sm font-medium text-ink">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="rounded-xl border border-ink/15 bg-paper px-4 py-2.5 text-sm text-ink transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <Input
          label="Existing illnesses (optional)"
          name="illnesses"
          placeholder="e.g. Asthma, Diabetes"
          value={form.illnesses}
          onChange={onChange}
        />

        {error && <Alert variant="error">{error}</Alert>}

        <Button type="submit" variant="primary" disabled={loading} className="mt-2 justify-center">
          {loading ? <Spinner size={16} /> : (
            <>
              Create account
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
