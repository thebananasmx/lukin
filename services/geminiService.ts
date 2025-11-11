import { ReviewsData } from '../types';

export const fetchReviewsFromGemini = async (
  shareUrl: string,
  businessName: string,
): Promise<ReviewsData> => {
  try {
    const response = await fetch('/api/generate-reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shareUrl, businessName }),
    });

    const parsedData: Partial<ReviewsData> & { error?: string } = await response.json();
    
    if (!response.ok || parsedData.error) {
      throw new Error(parsedData.error || `Error del servidor: ${response.status}`);
    }

    // Client-side validation for the received data
    if (!parsedData.reviews || !parsedData.businessName || !parsedData.summary || parsedData.averageRating === undefined || parsedData.totalReviews === undefined) {
      throw new Error("La respuesta del servidor no contenía todos los datos necesarios.");
    }
    
    return parsedData as ReviewsData;

  } catch (error) {
    console.error("Error fetching reviews from serverless function:", error);
    if (error instanceof Error) {
        // Re-throw the specific error from the server or any other network error.
        throw error;
    }
    throw new Error("No se pudo comunicar con el servidor para obtener las reseñas.");
  }
};
