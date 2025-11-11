
export interface Review {
  author: string;
  rating: number;
  text: string;
}

export interface SummaryData {
  price: string;
  service: string;
  the_good: string;
  the_bad: string;
}

export interface ReviewsData {
  summary: SummaryData;
  averageRating: number;
  totalReviews: number;
  businessName: string;
  reviews: Review[];
}

export interface LatLng {
  latitude: number;
  longitude: number;
}