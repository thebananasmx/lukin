import React from 'react';
import { Review } from '../types';
import StarRating from './StarRating';

const UserIcon = () => (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
    </div>
);

const QuoteIcon = ({className}: {className: string}) => (
    <svg className={`w-8 h-8 text-gray-600/50 absolute ${className}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
        <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
    </svg>
)

interface ReviewCardProps {
    review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    return (
        <article className="bg-gray-800/70 p-6 rounded-2xl shadow-lg border border-gray-700 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10">
            <div className="flex items-center mb-4">
                <UserIcon />
                <div className="ml-4">
                    <h3 className="font-bold text-lg text-white">{review.author}</h3>
                    <StarRating rating={review.rating} />
                </div>
            </div>
            <blockquote className="relative text-gray-300 leading-relaxed px-4">
                <QuoteIcon className="-top-2 -left-4" />
                <p className="z-10 relative">
                  {review.text}
                </p>
                <QuoteIcon className="-bottom-5 -right-2 transform rotate-180" />
            </blockquote>
        </article>
    );
};

export default ReviewCard;
