import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = () => (
    <div className="text-2xl font-black tracking-tighter text-black">
        LUKN
    </div>
);

const HeroIcon = () => (
    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    </div>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L4.636 19.38l-1.414-1.414L8.86 12.328A6 6 0 1118 8zm-8 3a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
    </svg>
);


const HomePage: React.FC = () => {
    const [businessName, setBusinessName] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const formRef = useRef<HTMLFormElement>(null);

    const [isApiKeySelected, setIsApiKeySelected] = useState(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                try {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setIsApiKeySelected(hasKey);
                } catch (e) {
                    console.error("Error checking for API key:", e);
                    setIsApiKeySelected(true); // Assume key exists if check fails
                }
            } else {
                // If not in AI Studio, assume key is available through environment variables
                setIsApiKeySelected(true);
            }
            setIsCheckingApiKey(false);
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // As per instructions, assume key selection was successful to avoid race conditions.
            setIsApiKeySelected(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCheckingApiKey) return;

        if (!isApiKeySelected) {
            handleSelectKey();
            return;
        }

        if (!shareUrl.trim() || !businessName.trim()) {
            setError('Por favor, ingresa el nombre del negocio y el enlace de Google Maps.');
            return;
        }
        if (!shareUrl.includes('maps.app.goo.gl') && !shareUrl.includes('google.com/maps')) {
             setError('El enlace no parece ser válido. Asegúrate de que sea un enlace para compartir de Google Maps.');
             return;
        }
        const searchParams = new URLSearchParams({
            url: shareUrl,
            name: businessName,
        });
        navigate(`/reviews?${searchParams.toString()}`);
    };
    
    return (
        <>
            <header className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-center">
                <Logo />
                <button 
                    onClick={() => formRef.current?.requestSubmit()} 
                    className="bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-full text-sm hover:bg-fuchsia-600 transition-colors"
                    disabled={isCheckingApiKey}
                >
                    {isApiKeySelected ? 'GET STARTED' : 'CONFIGURAR API KEY'}
                </button>
            </header>
            <main className="flex flex-col items-center justify-center min-h-screen p-4 text-center pt-24">
                <div className="w-full max-w-xl mx-auto">
                    <div className="flex justify-center">
                        <HeroIcon />
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-black leading-none">
                       Prueba Social impulsada por IA
                    </h1>
                    <p className="text-gray-600 mt-4 max-w-lg mx-auto text-lg">
                       Genera páginas de reseñas de Google Maps en segundos para convencer a más clientes.
                    </p>
                    
                    <form ref={formRef} onSubmit={handleSubmit} className="mt-10 space-y-6 text-left">
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-bold text-gray-700 mb-1">Nombre del Negocio</label>
                            <input
                                id="businessName"
                                type="text"
                                value={businessName}
                                onChange={(e) => { setBusinessName(e.target.value); setError(''); }}
                                placeholder="Ej: Restaurante El Buen Sabor"
                                className="block w-full bg-transparent border-b-2 border-gray-300 py-3 text-lg text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="shareUrl" className="block text-sm font-bold text-gray-700 mb-1">Enlace de Google Maps</label>
                            <input
                                id="shareUrl"
                                type="url"
                                value={shareUrl}
                                onChange={(e) => { setShareUrl(e.target.value); setError(''); }}
                                placeholder="Ej: https://maps.app.goo.gl/..."
                                className="block w-full bg-transparent border-b-2 border-gray-300 py-3 text-lg text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>
                        
                        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                        
                        {!isApiKeySelected && !isCheckingApiKey && (
                            <p className="text-center text-fuchsia-700 font-semibold flex items-center justify-center pt-2">
                                <KeyIcon /> Es necesario configurar tu API Key para continuar.
                            </p>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isCheckingApiKey}
                                className="w-full py-4 px-8 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCheckingApiKey && 'VERIFICANDO...'}
                                {!isApiKeySelected && !isApiKeySelected && (
                                    <span className="flex items-center justify-center"><KeyIcon /> CONFIGURAR API KEY</span>
                                )}
                                {!isCheckingApiKey && isApiKeySelected && 'GENERAR PÁGINA DE RESEÑAS'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
             <div className="bg-yellow-300 p-10 text-center">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-black leading-none">Convierte comentarios en conversaciones que venden</h2>
                 <p className="text-black/80 mt-4 max-w-xl mx-auto">
                    "¿Cuánto cuesta?" o "¿Hacen envíos a Marte?". Respuestas al instante. Boom — las carteras se abren.
                </p>
                <div className="mt-8">
                    <button
                        onClick={(e) => {
                             if (!isApiKeySelected) {
                                e.preventDefault();
                                handleSelectKey();
                                return;
                            }
                            if (!shareUrl || !businessName) {
                                e.preventDefault();
                                document.getElementById('businessName')?.focus();
                            } else {
                                formRef.current?.requestSubmit();
                            }
                        }}
                        className="py-4 px-10 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-transform transform hover:scale-105 disabled:opacity-50"
                        disabled={isCheckingApiKey}
                    >
                        {isCheckingApiKey && 'VERIFICANDO...'}
                        {!isCheckingApiKey && !isApiKeySelected && 'CONFIGURAR API KEY'}
                        {!isCheckingApiKey && isApiKeySelected && 'GET STARTED'}
                    </button>
                </div>
            </div>
            <footer className="text-center py-8 text-gray-500 text-sm">
                <p>Potenciado por Gemini API.</p>
            </footer>
        </>
    );
};

export default HomePage;