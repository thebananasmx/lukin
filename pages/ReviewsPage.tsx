import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchReviewsFromGemini } from '../services/geminiService';
import { ReviewsData } from '../types';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';

const SpinnerIcon = () => (
    <svg className="animate-spin h-10 w-10 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const loadingMessages = [
    "Contactando a nuestros agentes de IA...",
    "Buscando tu negocio en el universo digital...",
    "Leyendo y analizando las reseñas de clientes...",
    "Traduciendo las opiniones más relevantes...",
    "Creando un resumen espectacular...",
    "Dando los últimos toques de diseño...",
    "¡Casi listo para impresionar!"
];

const LoadingState = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center flex flex-col items-center justify-center p-8 space-y-6 my-12">
            <SpinnerIcon />
            <h2 className="text-2xl font-bold text-gray-900">Generando tu página...</h2>
            <p className="text-gray-600 text-lg transition-opacity duration-500 h-6">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};


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
    const businessName = searchParams.get('name');

    const loadReviews = useCallback(async (url: string, name: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchReviewsFromGemini(url, name);
            setReviewsData(data);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        if (shareUrl && businessName) {
            loadReviews(shareUrl, businessName);
        } else {
            setError("Falta información del negocio (enlace o nombre).");
            setLoading(false);
        }
    }, [shareUrl, businessName, loadReviews]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
    };

    return (
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {error && (
                    <div className="text-center bg-red-50 border border-red-200 p-6 rounded-2xl my-12">
                        <h2 className="text-2xl font-bold text-red-800">¡Oops! Algo salió mal</h2>
                        <p className="text-red-600 mt-2">{error}</p>
                        <Link to="/" className="mt-6 inline-block bg-black text-white font-bold py-2 px-5 rounded-full hover:bg-gray-800 transition-colors">
                            Intentar de Nuevo
                        </Link>
                    </div>
                )}
                
                 {loading && <LoadingState />}

                {!loading && !error && reviewsData && (
                    <main>
                        <header className="text-center p-8">
                            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-black leading-none">{reviewsData.businessName}</h1>
                            <div className="mt-5 flex items-center justify-center gap-3 text-gray-600">
                                <span className="font-bold text-2xl text-gray-800">{reviewsData.averageRating.toFixed(1)}</span>
                                <StarRating rating={reviewsData.averageRating} />
                                <span className="text-sm">de {reviewsData.totalReviews} reseñas</span>
                            </div>
                        </header>
                        
                        <div className="p-4 sm:p-0 space-y-8">
                            <section className="p-8 bg-yellow-300 rounded-2xl">
                                <h2 className="text-xl font-bold text-black mb-2 sr-only">Resumen General</h2>
                                <p className="text-black/80 leading-relaxed text-center text-lg">{reviewsData.summary}</p>
                            </section>
                            
                            <section>
                                <h2 className="text-3xl font-black text-black text-center mb-6">Lo que dicen nuestros clientes</h2>
                                <div className="space-y-6">
                                    {reviewsData.reviews.map((review, index) => (
                                        <ReviewCard key={index} review={review} />
                                    ))}
                                </div>
                            </section>
                        </div>

                        <footer className="text-center p-6 mt-8">
                            <button
                                onClick={handleCopyLink}
                                className="w-full sm:w-auto inline-flex items-center justify-center bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                <ShareIcon />
                                {isCopied ? '¡Enlace Copiado!' : 'Compartir esta Página'}
                            </button>
                             <div className="mt-5">
                                <Link to="/" className="text-sm text-gray-600 hover:text-black transition-colors">
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