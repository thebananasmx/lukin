import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// This is the serverless function handler
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }

  const { shareUrl, businessName } = request.body;
  console.log("Function invoked. Received shareUrl:", shareUrl, "and businessName:", businessName);


  if (!shareUrl || !businessName) {
    console.warn("Missing parameters: shareUrl or businessName.");
    return response.status(400).json({ error: 'Faltan los parámetros shareUrl o businessName en la solicitud.' });
  }

  // The API_KEY is securely accessed from environment variables on the server
  if (!process.env.API_KEY) {
    console.error("CRITICAL: API_KEY environment variable not found on server.");
    return response.status(500).json({ error: "Error de configuración del servidor: no se encontró la clave API." });
  }
  console.log("API_KEY found. Initializing GoogleGenAI.");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
**TASK:** Find Google reviews for a business, translate them to Mexican Spanish, and return the data as a JSON object.

**INPUT:**
*   \`business_name\`: "${businessName}"
*   \`google_maps_url\`: "${shareUrl}"

**INSTRUCTIONS:**
1.  Use the \`googleSearch\` and \`googleMaps\` tools to locate the business that matches **BOTH** the \`business_name\` and the \`google_maps_url\`.
2.  Extract the following information:
    *   The official business name.
    *   The overall average star rating.
    *   The total number of reviews.
    *   At least 5 of the most relevant public reviews. For each review, get:
        *   \`author\`: The full name of the user who wrote the review. Do not translate the name.
        *   \`rating\`: The star rating given (as a number).
        *   \`text\`: The original text of the review.
    *   A brief, engaging summary of all the reviews.
3.  **Translate the following text fields into Mexican Spanish (es-MX):**
    *   The \`summary\`.
    *   The \`text\` of each individual review.
4.  Format the final, translated data into a single JSON object.

**OUTPUT RULES:**
*   The **ENTIRE** response must be a single, valid JSON object.
*   Do **NOT** include any text outside the JSON object (no explanations, no markdown).
*   **SUCCESS CASE:** If the business is found, the JSON must follow this structure (with the specified fields translated to Mexican Spanish):
    {
      "summary": "string",
      "averageRating": "number",
      "totalReviews": "number",
      "businessName": "string",
      "reviews": [
        {
          "author": "string",
          "rating": "number",
          "text": "string"
        }
      ]
    }
*   **FAILURE CASE:** If you cannot definitively locate the business or its reviews, you **MUST** return this exact JSON object:
    {
      "error": "No se pudo encontrar un negocio con la información proporcionada. Asegúrate de que el nombre sea correcto y que el enlace apunte a un lugar específico en Google Maps."
    }
`;

  try {
    console.log("Sending request to Gemini API...");
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
      },
    });
    console.log("Received response from Gemini API.");

    const jsonText = geminiResponse.text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    console.log("Cleaned text from Gemini:", jsonText.substring(0, 500) + "..."); // Log a snippet
    
    // We parse it here to validate it before sending it to the client
    const parsedData = JSON.parse(jsonText);
    console.log("Successfully parsed JSON response from Gemini.");

    // Vercel serverless functions have a cache. Set headers to prevent caching of API responses.
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');

    return response.status(200).json(parsedData);
  } catch (error: any) {
    console.error("ERROR in serverless function:", error);
    let errorMessage = "Ocurrió un error desconocido al obtener las reseñas.";
    if (error instanceof SyntaxError) {
      errorMessage = "La API de Gemini devolvió una respuesta inesperada con formato incorrecto. Revisa los logs del servidor para más detalles.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    return response.status(500).json({ error: errorMessage });
  }
}
