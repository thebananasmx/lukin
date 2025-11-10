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
    Tu tarea es actuar como un asistente de investigación para encontrar reseñas de un negocio en Google. Se te proporcionará un nombre de negocio y un enlace para compartir de Google Maps.

    Sigue estos pasos con precisión:
    1.  Usa la herramienta de Google Search para investigar el enlace de Google Maps ("${shareUrl}"). Tu objetivo es identificar el nombre exacto y la ubicación (dirección o coordenadas) a la que apunta este enlace.
    2.  Compara la información del enlace con el nombre de negocio proporcionado ("${businessName}").
    3.  Realiza una búsqueda combinada usando las herramientas de Google Search y Google Maps para encontrar un negocio que coincida con el nombre "${businessName}" Y que se encuentre en la ubicación identificada en el paso 1. La coincidencia debe ser alta.
    4.  Una vez que hayas identificado con seguridad el negocio correcto, recopila sus reseñas de Google.
    5.  Formatea la información recopilada en un objeto JSON.

    Responde ÚNICAMENTE con un objeto JSON válido.
    El JSON debe contener los siguientes campos:
    - "summary": Un resumen corto y atractivo del sentimiento general de las reseñas.
    - "averageRating": La calificación promedio en estrellas (un número de 1 a 5).
    - "totalReviews": El número total de reseñas encontradas.
    - "businessName": El nombre oficial y completo del negocio encontrado (debe coincidir lo más posible con el nombre proporcionado).
    - "reviews": Un array de al menos 5 de las reseñas más relevantes, donde cada objeto tiene "author" (string), "rating" (number), y "text" (string).

    Tu respuesta DEBE ser solo el código JSON, sin ningún texto introductorio, explicaciones, ni formato markdown como \`\`\`json.
    
    Si, después de seguir los pasos, no puedes encontrar un negocio que coincida claramente con la información proporcionada, responde con este objeto JSON de error:
    { "error": "No se pudo encontrar un negocio con la información proporcionada. Asegúrate de que el nombre sea correcto y que el enlace apunte a un lugar específico en Google Maps." }
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