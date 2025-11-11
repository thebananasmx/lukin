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

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
);

const SummaryDisplay = ({ summary }: { summary: ReviewsData['summary'] }) => {
    
    const PriceIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
        </svg>
    );

    const ServiceIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
    
    const GoodIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.086 4.172A2 2 0 005.172 10h1.172a2 2 0 011.72 1.055l1.83 3.102a1 1 0 001.732 0l1.83-3.102a2 2 0 011.72-1.055h1.172z" />
        </svg>
    );

    const BadIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.736-.97l2.086-4.172A2 2 0 0019.828 14h-1.172a2 2 0 01-1.72-1.055l-1.83-3.102a1 1 0 00-1.732 0l-1.83 3.102A2 2 0 0110.828 14H9.656z" />
        </svg>
    );

    const summaryItems = [
        { Icon: PriceIcon, title: "Precio", text: summary.price },
        { Icon: ServiceIcon, title: "Servicio", text: summary.service },
        { Icon: GoodIcon, title: "Lo Bueno", text: summary.the_good },
        { Icon: BadIcon, title: "A mejorar", text: summary.the_bad },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            {summaryItems.map(({ Icon, title, text }) => (
                <div key={title} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black/10 rounded-full">
                        <Icon />
                    </div>
                    <div>
                        <p className="font-bold text-black">{title}</p>
                        <p className="text-black/80 leading-snug">{text}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};


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
            const errorMessage = err.message || 'Ocurrió un error inesperado.';
            if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API key not valid")) {
                setError("Tu clave de API parece no ser válida o no tiene los permisos necesarios. Por favor, regresa y selecciona una clave de API válida para continuar.");
            } else {
                setError(errorMessage);
            }
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

    const isApiKeyError = error && (error.includes("clave de API") || error.includes("API key"));

    return (
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {error && (
                    <div className="text-center bg-red-50 border border-red-200 p-6 rounded-2xl my-12">
                        {isApiKeyError && <WarningIcon />}
                        <h2 className="text-2xl font-bold text-red-800 mt-4">
                            {isApiKeyError ? 'Error de Clave de API' : '¡Oops! Algo salió mal'}
                        </h2>
                        <p className="text-red-600 mt-2">{error}</p>
                        <Link to="/" className="mt-6 inline-block bg-black text-white font-bold py-2 px-5 rounded-full hover:bg-gray-800 transition-colors">
                            {isApiKeyError ? 'Volver a la Página Principal' : 'Intentar de Nuevo'}
                        </Link>
                    </div>
                )}
                
                 {loading && !error && <LoadingState />}

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
                                <h2 className="text-2xl font-black text-black text-center mb-6">Resumen General</h2>
                                <SummaryDisplay summary={reviewsData.summary} />
                                {reviewsData.summary.overall_summary && (
                                    <p className="mt-6 text-center text-black/90 font-medium text-lg leading-relaxed">
                                        {reviewsData.summary.overall_summary}
                                    </p>
                                )}
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