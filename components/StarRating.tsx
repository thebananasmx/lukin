import React from 'react';

interface StarRatingProps {
  rating: number;
}

const StarIcon: React.FC<{ fill: string, id: string }> = ({ fill, id }) => (
  <svg className="w-5 h-5" fill="url(#)" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
     <defs>
      <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
        <stop offset={fill} stopColor="#FBBF24" />
        <stop offset={fill} stopColor="#E5E7EB" stopOpacity="1" />
      </linearGradient>
    </defs>
    <path fill={`url(#${id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);


const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    let fillPercentage = "0%";
    if (starValue <= rating) {
      fillPercentage = "100%";
    } else if (starValue > rating && starValue - 1 < rating) {
      fillPercentage = `${(rating - index) * 100}%`;
    }
    // Unique ID for each gradient is necessary for it to work correctly
    const gradientId = `grad-${Math.random()}`;

    return <StarIcon key={index} fill={fillPercentage} id={gradientId} />;
  });

  return <div className="flex items-center">{stars}</div>;
};

export default StarRating;