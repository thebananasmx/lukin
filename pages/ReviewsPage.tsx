import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchReviewsFromGemini } from '../services/geminiService';
import { ReviewsData } from '../types';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';

const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6 p-8">
        <div className="h-10 bg-gray-700 rounded-lg w-3/4 mx-auto"></div>
        <div className="h-6 bg-gray-700 rounded-lg w-1/2 mx-auto"></div>
        <div className="h-24 bg-gray-700 rounded-lg w-full mt-4"></div>
        {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 bg-gray-800 rounded-xl space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                         <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                         <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    </div>
                </div>
                <div className="h-12 bg-gray-700 rounded w-full"></div>
            </div>
        ))}
    </div>
);


const QuoteIcon = () => (
    <svg className="w-10 h-10 text-indigo-500/30" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
        <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
    </svg>
);

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
)

const ReviewsPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const shareUrl = searchParams.get('url');

    const loadReviews = useCallback(async (url: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchReviewsFromGemini(url);
            setReviewsData(data);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (shareUrl) {
            loadReviews(shareUrl);
        } else {
            setError("Falta el enlace para compartir de Google Maps.");
            setLoading(false);
        }
    }, [shareUrl, loadReviews]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    return (
        <div className="relative min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-b-full blur-3xl opacity-20 transform -translate-x-1/4 translate-y-[-50%]"></div>
             <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-tl from-teal-500 to-cyan-600 rounded-t-full blur-3xl opacity-15 transform translate-x-1/4 translate-y-[50%]"></div>
            
            <div className="relative max-w-2xl mx-auto z-10">
                {error && (
                    <div className="text-center bg-red-900/50 border border-red-700 p-6 rounded-2xl my-12">
                        <h2 className="text-2xl font-bold text-red-300">¡Oops! Algo salió mal</h2>
                        <p className="text-red-400 mt-2">{error}</p>
                        <Link to="/" className="mt-6 inline-block bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                            Intentar de Nuevo
                        </Link>
                    </div>
                )}
                
                 {loading && <LoadingSkeleton />}

                {!loading && !error && reviewsData && (
                    <main className="bg-gray-800/60 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-700/50 my-8 sm:my-12 overflow-hidden animate-fade-in-up">
                        <header className="text-center p-8 bg-gradient-to-br from-gray-800/80 to-gray-900/60">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-lg">{reviewsData.businessName}</h1>
                            <div className="mt-5 flex items-center justify-center gap-3 text-gray-300">
                                <span className="font-bold text-2xl text-yellow-300">{reviewsData.averageRating.toFixed(1)}</span>
                                <StarRating rating={reviewsData.averageRating} />
                                <span className="text-sm">de {reviewsData.totalReviews} reseñas</span>
                            </div>
                        </header>
                        
                        <div className="p-6 sm:p-8 space-y-8">
                            <section className="relative p-6 bg-gray-900/50 rounded-2xl border border-gray-700">
                                <QuoteIcon />
                                <h2 className="text-xl font-semibold text-white mb-2 sr-only">Resumen General</h2>
                                <p className="text-gray-300 leading-relaxed italic text-center text-lg">{reviewsData.summary}</p>
                            </section>
                            
                            <section>
                                <h2 className="text-2xl font-bold text-white text-center mb-6">Lo que dicen nuestros clientes</h2>
                                <div className="space-y-6">
                                    {reviewsData.reviews.map((review, index) => (
                                        <ReviewCard key={index} review={review} />
                                    ))}
                                </div>
                            </section>
                        </div>

                        <footer className="text-center p-6 bg-gray-900/50">
                            <button
                                onClick={handleCopyLink}
                                className="w-full sm:w-auto inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                <ShareIcon />
                                {isCopied ? '¡Enlace Copiado!' : 'Compartir esta Página'}
                            </button>
                             <div className="mt-5">
                                <Link to="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                    &larr; Crear una nueva página
                                </Link>
                            </div>
                        </footer>
                    </main>
                )}
            </div>
        </div>
    );
};

export default ReviewsPage;