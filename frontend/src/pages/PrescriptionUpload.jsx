import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, X } from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Spinner from "../components/ui/Spinner";
import MedicineResultCard from "../components/MedicineResultCard";
import { useAuth } from "../context/AuthContext";
import { uploadPrescription, analyzePrescriptionText } from "../services/ocrService";

export default function PrescriptionUpload() {
  const { user, authHeader } = useAuth();
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState("image"); // "image" | "text"
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const pickFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setResult(null);
    setError("");
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const onDrop = (event) => {
    event.preventDefault();
    pickFile(event.dataTransfer.files?.[0]);
  };

  const runUpload = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      if (mode === "image") {
        if (!file) throw new Error("Choose a prescription image first.");
        const data = await uploadPrescription(file, user.email, authHeader);
        setResult(data);
      } else {
        if (!text.trim()) throw new Error("Enter some prescription text first.");
        const medicines = await analyzePrescriptionText(text, user.email, authHeader);
        setResult({ rawOcrText: text, medicines });
      }
    } catch (err) {
      setError(err.message || "Something went wrong while analyzing the prescription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">Analyze a prescription</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Upload a photo of a prescription and Pillie will read it with Tesseract OCR, extract each
        medicine, and check it against your allergy profile.
      </p>

      <div className="mt-8 inline-flex rounded-full border border-ink/10 bg-paper-dim p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("image")}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
            mode === "image" ? "bg-ink text-paper" : "text-ink-soft"
          }`}
        >
          Upload image
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
            mode === "text" ? "bg-ink text-paper" : "text-ink-soft"
          }`}
        >
          Paste text
        </button>
      </div>

      <form onSubmit={runUpload} className="mt-6 max-w-2xl">
        {mode === "image" ? (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={onDrop}
            className="relative flex min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink/15 bg-paper-dim/40 p-6 text-center transition-colors hover:border-brand/40"
          >
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="max-h-64 rounded-2xl border border-ink/10 object-contain"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remove image"
                  className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper shadow-md"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-dark">
                  <UploadCloud size={22} />
                </span>
                <p className="mt-4 text-sm font-medium text-ink">Drag a prescription image here</p>
                <p className="mt-1 text-xs text-ink-soft">or click below to browse</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-4 border border-ink/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => pickFile(event.target.files?.[0])}
            />
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={6}
            placeholder="Combiflam 2 tablets after breakfast for 5 days"
            className="w-full rounded-3xl border border-ink/15 bg-paper p-5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        )}

        {error && (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        )}

        <Button type="submit" variant="primary" disabled={loading} className="mt-5">
          {loading ? (
            <>
              <Spinner size={16} />
              Analyzing…
            </>
          ) : (
            "Run safety check"
          )}
        </Button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-12"
        >
          {result.rawOcrText && (
            <div className="mb-6 rounded-3xl border border-ink/10 bg-ink px-6 py-5 text-paper">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-paper/50">
                <FileText size={14} /> Raw OCR text
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-paper/85">{result.rawOcrText}</pre>
            </div>
          )}

          {result.medicines?.length ? (
            <div className="space-y-4">
              {result.medicines.map((medicine, index) => (
                <MedicineResultCard key={`${medicine.medicine}-${index}`} result={medicine} />
              ))}
            </div>
          ) : (
            <Alert variant="info">No medicines could be extracted from this text.</Alert>
          )}
        </motion.div>
      )}
    </AppLayout>
  );
}
