import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

const UserIcon = () => (
    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);

interface ReviewCardProps {
    review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    return (
        <article className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
                <UserIcon />
                <div className="ml-4">
                    <h3 className="font-bold text-lg text-black">{review.author}</h3>
                    <StarRating rating={review.rating} />
                </div>
            </div>
            <blockquote className="text-gray-700 leading-relaxed">
                <p>
                  {review.text}
                </p>
            </blockquote>
        </article>
    );
};

export default ReviewCard;