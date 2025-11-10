import { GoogleGenAI } from "@google/genai";
import { ReviewsData } from '../types';

export const fetchReviewsFromGemini = async (
  shareUrl: string,
  businessName: string,
): Promise<ReviewsData> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
      },
    });

    // Clean up potential markdown formatting from the response
    const jsonText = response.text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    const parsedData: Partial<ReviewsData> & { error?: string } = JSON.parse(jsonText);

    if (parsedData.error) {
        throw new Error(parsedData.error);
    }

    // More robust validation
    if (!parsedData.reviews || !parsedData.businessName || !parsedData.summary || parsedData.averageRating === undefined || parsedData.totalReviews === undefined) {
      throw new Error("La respuesta de la API no contenía todos los datos necesarios.");
    }

    return parsedData as ReviewsData;

  } catch (error) {
    console.error("Error fetching or parsing reviews:", error);
    if (error instanceof SyntaxError) {
      throw new Error("La API devolvió una respuesta inesperada con formato incorrecto. Inténtalo de nuevo.");
    }
    if (error instanceof Error) {
        // Re-throw the specific error from the parsed JSON or any other network error.
        throw error;
    }
    throw new Error("Ocurrió un error desconocido al obtener las reseñas.");
  }
};
