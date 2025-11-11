
import type { VercelRequest, VercelResponse } from '@vercel/node';
// FIX: Removed unused `Type` import as responseSchema is no longer used.
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

  // FIX: Updated prompt to request JSON output directly, as responseSchema is not allowed with Google Maps grounding.
  const prompt = `
**TASK:** Find Google reviews for a business using its Google Maps URL and return its details.

**BUSINESS DETAILS:**
*   \`business_name_hint\`: "${businessName}"
*   \`google_maps_url\`: "${shareUrl}"

**INSTRUCTIONS:**
1.  **Use the \`google_maps_url\` as the primary identifier**. Use the \`googleMaps\` tool to find the exact business at this URL. This is your source of truth.
2.  The \`business_name_hint\` is just for context. The official name from the Google Maps URL is what you must use.
3.  Extract the business's official name, average star rating, total number of reviews, and at least 5 of its most relevant reviews.
4.  **Analyze all reviews for common themes** and generate a structured summary object. This object should contain:
    *   Four key points based on general sentiment: 'price', 'service', 'the_good' (a short positive highlight), and 'the_bad' (a short area for improvement).
    *   A single, engaging summary paragraph ('overall_summary') of max 25 words that captures the business's essence.
5.  **Translate to Mexican Spanish (es-MX):**
    *   Translate the text for all five summary points.
    *   Translate the text of each individual review.
6.  Respond with a single JSON object containing the extracted and translated information. If you cannot find the business, the JSON object should contain an "error" key with an appropriate message.

**OUTPUT FORMAT:**
Your response must be a single, valid JSON object. Do not include any other text, markdown formatting (like \`\`\`json), or explanations outside of the JSON object itself. The JSON object must have the following structure and data types:

{
  "summary": {
    "price": "string (e.g., 'Económico', 'Moderado', 'Caro')",
    "service": "string (e.g., 'Excelente', 'Bueno', 'Regular')",
    "the_good": "string (short positive highlight, max 10 words)",
    "the_bad": "string (short area for improvement, max 10 words)",
    "overall_summary": "string (engaging summary, max 25 words)"
  },
  "averageRating": number,
  "totalReviews": integer,
  "businessName": "string",
  "reviews": [
    {
      "author": "string",
      "rating": integer (1-5),
      "text": "string"
    }
  ],
  "error": "string"
}

If the business cannot be found, return a JSON object with only the "error" field, for example: {"error": "No se pudo encontrar el negocio en la URL proporcionada."}
`;

  // FIX: The `reviewsSchema` is no longer needed as the output format is described in the prompt.


  try {
    console.log("Sending request to Gemini API...");
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      // FIX: Removed `responseMimeType` and `responseSchema` as they are not allowed when using the `googleMaps` tool.
      config: {
        tools: [{ googleMaps: {} }],
      },
    });
    console.log("Received response from Gemini API.");
    
    // FIX: Added logic to clean up potential markdown formatting from the response before parsing JSON.
    let jsonText = geminiResponse.text.trim();
    const match = jsonText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    if (match) {
        jsonText = match[1];
    }
    console.log("Raw JSON text from Gemini:", jsonText.substring(0, 500) + "...");
    
    const parsedData = JSON.parse(jsonText);
    console.log("Successfully parsed JSON response from Gemini.");

    if (parsedData.error) {
        console.warn("Gemini returned a functional error:", parsedData.error);
        return response.status(404).json({ error: parsedData.error });
    }

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