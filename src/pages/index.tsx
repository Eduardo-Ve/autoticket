import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";

// Configuración de fuentes (igual que tenías)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Definimos el tipo de respuesta esperado (para TypeScript)
type TicketResponseData = {
  category: string;
  confidence: number;
  ticketId: string;
};

export default function Home() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketResponseData | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6 dark:bg-black text-zinc-900 dark:text-zinc-100`}
    >
      <main className="w-full max-w-lg space-y-8">
        
        {/* Cabecera */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Auto-Ticket Classifier
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Describe your issue and let the AI suggest the best department to handle it.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description of the Issue
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              placeholder="Ex: the screen of my laptop turns blue when I open the browser..."
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

        {/* Mensaje de Error */}
        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Resultados */}
        {result && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                Resultado del Análisis
              </h3>
              <p className="text-xs text-zinc-500">ID: {result.ticketId}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Categoría Detectada */}
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Departamento Sugerido</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {result.category}
                </p>
              </div>

              {/* Barra de Confianza */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-500">Confidence Level</span>
                  <span className="font-mono">{(result.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
                {result.confidence < 0.7 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                    ⚠️ Low confidence: Manual human review recommended.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}