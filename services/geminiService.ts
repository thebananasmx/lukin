import { GoogleGenAI } from "@google/genai";
import { ReviewsData } from '../types';

export const fetchReviewsFromGemini = async (
  shareUrl: string,
): Promise<ReviewsData> => {
  if (!process.env.API_KEY) {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analiza el siguiente enlace para compartir de Google Maps: "${shareUrl}".
    
    Tu tarea es identificar el negocio en esa URL, buscar sus reseñas en Google Maps y extraer la información.

    Responde ÚNICAMENTE con un objeto JSON válido.
    El JSON debe contener los siguientes campos:
    - "summary": Un resumen corto y atractivo del sentimiento general de las reseñas.
    - "averageRating": La calificación promedio en estrellas (un número de 1 a 5).
    - "totalReviews": El número total de reseñas encontradas.
    - "businessName": El nombre oficial y completo del negocio encontrado.
    - "reviews": Un array de al menos 5 de las reseñas más relevantes, donde cada objeto tiene "author" (string), "rating" (number), y "text" (string).

    Tu respuesta DEBE ser solo el código JSON, sin ningún texto introductorio, explicaciones, ni formato markdown como \`\`\`json.
    
    Si el enlace no apunta a un negocio específico o no puedes encontrar reseñas, responde con este objeto JSON de error:
    { "error": "No se pudo encontrar un negocio en el enlace. Asegúrate de que sea un enlace para 'Compartir' de un lugar específico en Google Maps y no una ruta o una búsqueda general." }
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
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