import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0m-2.828 2.828a2 2 0 01-2.828 0l-3-3a2 2 0 112.828-2.828l3 3z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M6 8a2 2 0 012-2h4a2 2 0 110 4H8a2 2 0 01-2-2z" clipRule="evenodd" />
    </svg>
);


const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L13 12l-1.293-1.293a1 1 0 010-1.414L14 7m5 5l2.293 2.293a1 1 0 010 1.414L19 18l-1.293-1.293a1 1 0 010-1.414L20 13M3 13l2.293 2.293a1 1 0 010 1.414L3 18l-1.293-1.293a1 1 0 010-1.414L4 13" />
    </svg>
);

const HomePage: React.FC = () => {
    const [shareUrl, setShareUrl] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shareUrl.trim()) {
            setError('Por favor, ingresa un enlace para compartir de Google Maps.');
            return;
        }
        // Basic validation for Google Maps link
        if (!shareUrl.includes('goo.gl') && !shareUrl.includes('google.com/maps')) {
             setError('El enlace no parece ser válido. Asegúrate de que sea un enlace para compartir de Google Maps.');
             return;
        }
        const searchParams = new URLSearchParams({
            url: shareUrl,
        });
        navigate(`/reviews?${searchParams.toString()}`);
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
            <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Social Proof Studio</h1>
                    <p className="text-gray-400 mt-2">Pega un enlace de Google Maps y crea una página de reseñas al instante.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="shareUrl" className="block text-sm font-medium text-gray-300">Enlace para Compartir de Google Maps</label>
                        <div className="mt-1 relative">
                             <LinkIcon />
                             <input
                                id="shareUrl"
                                type="url"
                                value={shareUrl}
                                onChange={(e) => { setShareUrl(e.target.value); setError(''); }}
                                placeholder="Ej: https://maps.app.goo.gl/..."
                                className="block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-lg text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800 transition-transform transform hover:scale-105"
                        >
                            <SparklesIcon />
                            Generar Página de Reseñas
                        </button>
                    </div>
                </form>
            </div>
            <footer className="text-center mt-8 text-gray-500 text-sm">
                <p>Potenciado por Gemini API.</p>
            </footer>
        </div>
    );
};

export default HomePage;