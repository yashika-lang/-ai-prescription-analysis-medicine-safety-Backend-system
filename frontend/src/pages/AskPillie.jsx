import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessagesSquare, Sparkles } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useAsync } from "../hooks/useAsync";
import { askPillie, getRagStatus } from "../services/ragService";
import { ApiError } from "../services/apiClient";

export default function AskPillie() {
  const { user, authHeader } = useAuth();
  const { data: status, loading: statusLoading } = useAsync(() => getRagStatus(authHeader), [authHeader]);

  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState([]);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    const q = question.trim();
    if (!q) return;

    setAsking(true);
    setError("");
    try {
      const result = await askPillie(user.email, q, authHeader);
      setExchanges((prev) => [...prev, { question: q, answer: result.answer, sources: result.sources }]);
      setQuestion("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setError(err.message || "Ask Pillie isn't configured yet on the server.");
      } else {
        setError(err.message || "Couldn't get an answer. Please try again.");
      }
    } finally {
      setAsking(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Ask Pillie</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Ask about your extracted prescriptions or the medicine catalogue. Answers are grounded in
        retrieved data, not invented.
      </p>

      {!statusLoading && status && !status.configured && (
        <Alert variant="warning" className="mt-6" title="Ask Pillie isn't available right now">
          The server hasn&rsquo;t been configured with an AI provider yet. You can still try — it will
          tell you clearly if it&rsquo;s unavailable.
        </Alert>
      )}

      <div className="mt-8 space-y-5">
        {exchanges.length === 0 && !asking && (
          <div className="rounded-3xl border border-dashed border-ink/15 px-6 py-12 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark">
              <MessagesSquare size={22} strokeWidth={1.6} />
            </span>
            <p className="mt-4 text-sm text-ink-soft">
              Try asking something like &ldquo;What ingredients are in my last prescription?&rdquo;
            </p>
          </div>
        )}

        {exchanges.map((exchange, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-3"
          >
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3 text-sm text-paper">
              {exchange.question}
            </div>
            <div className="mr-auto max-w-[90%] rounded-2xl rounded-tl-sm border border-brand/20 bg-brand-soft px-4 py-3 text-sm text-brand-dark">
              <p className="flex items-start gap-2">
                <Sparkles size={15} className="mt-0.5 shrink-0" />
                <span className="whitespace-pre-wrap">{exchange.answer}</span>
              </p>
              {exchange.sources?.length > 0 && (
                <details className="mt-3 text-xs text-brand-dark/80">
                  <summary className="cursor-pointer font-medium">
                    {exchange.sources.length} retrieved source{exchange.sources.length > 1 ? "s" : ""}
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {exchange.sources.map((source, i) => (
                      <li key={i} className="rounded-xl bg-paper/60 p-2.5">
                        {source}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </motion.div>
        ))}

        {asking && (
          <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl rounded-tl-sm border border-ink/10 bg-paper-dim px-4 py-3 text-sm text-ink-soft">
            <Spinner size={14} /> Retrieving and generating an answer…
          </div>
        )}

        {error && <Alert variant="error">{error}</Alert>}
      </div>

      <form onSubmit={onSubmit} className="sticky bottom-6 mt-8 flex gap-2 rounded-full border border-ink/10 bg-paper p-2 shadow-[0_20px_40px_-25px_rgba(16,21,26,0.3)]">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about your prescriptions…"
          className="flex-1 rounded-full bg-transparent px-4 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none"
        />
        <Button type="submit" variant="primary" disabled={asking} className="shrink-0 rounded-full px-4 py-2">
          <Send size={16} />
        </Button>
      </form>
    </AppLayout>
  );
}
