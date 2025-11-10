
export interface Review {
  author: string;
  rating: number;
  text: string;
}

export interface ReviewsData {
  summary: string;
  averageRating: number;
  totalReviews: number;
  businessName: string;
  reviews: Review[];
}

export interface LatLng {
  latitude: number;
  longitude: number;
}
