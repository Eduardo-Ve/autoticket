// pages/index.tsx
import { useMemo, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import type { TicketCategory } from "@/types/ticket";

// Configuración de fuentes
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Tipos de respuesta del modelo (adaptados)
type TicketResponseData = {
  ticketId: string;
  category: TicketCategory;        // categoría final (puede ser REVIEW)
  category_label: TicketCategory;  // label top1 real
  confidence: number;
  threshold_used?: number;
  top3?: Array<[TicketCategory, number]>;  // Top-3 categorias y confianza
};

// Mapeo de categorías a nombres legibles
const labelPretty: Record<string, string> = {
  "Administrative rights": "Administrative Rights",
  "HR Support": "HR Support",
  "Internal Project": "Internal Project",
  Miscellaneous: "Miscellaneous",
  Hardware: "Hardware",
  Access: "Access",
  Purchase: "Purchase",
  Storage: "Storage",
  REVIEW: "Manual Review",
};

export default function Home() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketResponseData | null>(null);
  const [error, setError] = useState("");

  const isReview = result?.category === "REVIEW";

  const bannerText = useMemo(() => {
    if (!result) return "";
    if (!isReview) return "Auto-assigned by the model ✅";
    return `Manual review recommended ⚠️ (Top guess: ${labelPretty[result.category_label]})`;
  }, [result, isReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al clasificar");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${geistSans.className} ${geistMono.className} min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-black text-zinc-900 dark:text-zinc-100`}>
      <main className="w-full max-w-lg space-y-8">
        {/* Cabecera */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Auto-Ticket Classifier</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Describe your issue and let the AI suggest the best department to handle it.
          </p>
        </div>
        {/* Alerta de Modelo en Desarrollo */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <span className="text-lg">🚧</span>
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold">Experimental Model</p>
              <p className="mt-1 text-amber-700 dark:text-amber-300/80">
                This system is still under development. Please verify the results manually as some classifications may be inaccurate.
              </p>
            </div>
          </div>
        </div>
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Description of the Issue</label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              placeholder="Ex: Cannot install VPN client, says I don't have permission..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !description}
            className="w-full rounded-full bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Analyzing..." : "Classify Ticket"}
          </button>
        </form>

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Analysis Result</h3>
              <p className="text-xs text-zinc-500">ID: {result.ticketId}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Banner decisión */}
              <div className={`rounded-lg p-3 text-sm ${isReview ? "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"}`}>
                {bannerText}
              </div>

              {/* Categoría */}
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Suggested Category</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {labelPretty[result.category]}
                </p>
                {isReview && (
                  <p className="mt-1 text-xs text-zinc-500">
                    Top guess: <span className="font-semibold">{labelPretty[result.category_label]}</span>
                  </p>
                )}
              </div>

              {/* Confianza */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-500">Confidence</span>
                  <span className="font-mono">{(result.confidence * 100).toFixed(0)}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  Threshold used: <span className="font-mono">{((result.threshold_used ?? 0.6) * 100).toFixed(0)}%</span>
                </p>
              </div>

              {/* Top-3 */}
              {result.top3 && result.top3.length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Top suggestions</p>
                  <div className="space-y-2">
                    {result.top3.map(([label, p]) => (
                      <div key={label} className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
                        <span className="text-sm">{labelPretty[label]}</span>
                        <span className="font-mono text-sm">{(p * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
