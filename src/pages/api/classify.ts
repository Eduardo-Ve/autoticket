// pages/api/classify-ticket.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// 1. Definimos la forma de los datos de Entrada (Request)
interface TicketRequest {
  description: string;
}

type TicketCategory = 'Soporte Técnico' | 'Facturación' | 'Recursos Humanos' | 'Otros';

interface TicketResponse {
  success: boolean;
  data?: {
    category: TicketCategory;
    confidence: number; // Porcentaje de seguridad del modelo (0 a 1) que es que si pasa a revisión humana
    ticketId: string;
  };
  error?: string;
}

// ----------------------------------------------------------------------
// 3. Lógica del Modelo (Simulada)
// ----------------------------------------------------------------------
async function predictCategory(text: string): Promise<{ category: TicketCategory; confidence: number }> {
  // SIMULACIÓN: Lógica simple basada en palabras clave
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('pago') || lowerText.includes('factura') || lowerText.includes('dinero')) {
    return { category: 'Facturación', confidence: 0.95 };
  }
  if (lowerText.includes('wifi') || lowerText.includes('error') || lowerText.includes('pantalla')) {
    return { category: 'Soporte Técnico', confidence: 0.88 };
  }
  if (lowerText.includes('contrato') || lowerText.includes('vacaciones')) {
    return { category: 'Recursos Humanos', confidence: 0.92 };
  }

  return { category: 'Otros', confidence: 0.50 };
}

// ----------------------------------------------------------------------
// 4. El Handler de la API (Controlador)
// ----------------------------------------------------------------------
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketResponse>
) {
  // A. Validar método HTTP
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Usa POST.' });
  }

  try {
    // B. Obtener y validar el body
    // Forzamos el tipo 'TicketRequest' para tener autocompletado, pero validamos que exista.
    const body = req.body as TicketRequest;

    if (!body.description || typeof body.description !== 'string') {
      return res.status(400).json({ success: false, error: 'Falta el campo "description" o no es texto.' });
    }

    // C. Llamar al modelo (Simulado o Real)
    const prediction = await predictCategory(body.description);

    // D. Responder con el JSON estructurado
    return res.status(200).json({
      success: true,
      data: {
        category: prediction.category,
        confidence: prediction.confidence,
        ticketId: `tkt-${Date.now()}` // Generamos un ID ficticio
      }
    });

  } catch (error) {
    console.error('Error clasificando ticket:', error);
    return res.status(500).json({ success: false, error: 'Error interno del servidor al procesar el modelo.' });
  }
}