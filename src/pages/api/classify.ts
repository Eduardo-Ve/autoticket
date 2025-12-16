// pages/api/classify-ticket.ts
import type { NextApiRequest, NextApiResponse } from "next";

// 1) Request que llega desde el frontend
interface TicketRequest {
  description: string;
}

// 2) Categorías reales del modelo (dataset IT)
export type TicketCategory =
  | "Access"
  | "Administrative rights"
  | "HR Support"
  | "Hardware"
  | "Internal Project"
  | "Miscellaneous"
  | "Purchase"
  | "Storage"
  | "REVIEW";

// 3) Forma exacta de lo que devuelve FastAPI (según tu screenshot)
interface FastApiResponse {
  success: boolean;
  data?: {
    category: TicketCategory;        // decisión final (puede venir REVIEW)
    category_label: TicketCategory;  // top1 real
    confidence: number;              // 0..1
    threshold_used?: number;         // ej 0.6
    top3?: Array<[TicketCategory, number]>; // [["Access",0.96], ...]
  };
  error?: string;
}

// 4) Respuesta que devuelve ESTA API de Next al frontend
interface TicketResponse {
  success: boolean;
  data?: {
    category: TicketCategory;
    category_label: TicketCategory;
    confidence: number;
    threshold_used?: number;
    top3?: Array<[TicketCategory, number]>;
    ticketId: string;
  };
  error?: string;
}

// ----------------------------------------------------------------------
// Helper: llama a FastAPI
// ----------------------------------------------------------------------
async function callFastApi(text: string): Promise<FastApiResponse> {
  const baseUrl = process.env.ML_API_URL; // ej: http://127.0.0.1:8000 o https://tu-api.onrender.com
  if (!baseUrl) {
    return { success: false, error: "ML_API_URL no está configurada." };
  }

  // timeout para evitar que el frontend quede colgado
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const r = await fetch(`${baseUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: text }),
      signal: controller.signal,
    });

    const data = (await r.json()) as FastApiResponse;

    if (!r.ok) {
      return {
        success: false,
        error: data?.error || `FastAPI respondió status ${r.status}`,
      };
    }

    return data;
  } catch (err: any) {
    const msg = err?.name === "AbortError"
      ? "Timeout conectando a la ML API"
      : "No se pudo conectar a la ML API";
    return { success: false, error: msg };
  } finally {
    clearTimeout(timeout);
  }
}

// ----------------------------------------------------------------------
// Handler
// ----------------------------------------------------------------------
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketResponse>
) {
  // A) Método
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método no permitido. Usa POST." });
  }

  // B) Body
  const body = req.body as TicketRequest;

  if (!body?.description || typeof body.description !== "string") {
    return res.status(400).json({ success: false, error: 'Falta el campo "description" o no es texto.' });
  }

  // C) Llamar a FastAPI
  const fast = await callFastApi(body.description);

  if (!fast.success || !fast.data) {
    // 502 = Bad Gateway (tu Next actuó como proxy y el backend falló)
    return res.status(502).json({ success: false, error: fast.error || "Error en el modelo." });
  }

  // D) Responder al frontend con ticketId + data
  return res.status(200).json({
    success: true,
    data: {
      ...fast.data,
      ticketId: `tkt-${Date.now()}`,
    },
  });
}
