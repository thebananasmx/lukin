import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.66602 23.3333V4.66667H11.666V12.8333L18.666 4.66667H23.3327V23.3333H16.3327V15.1667L9.33268 23.3333H4.66602Z" fill="black"/>
    </svg>
);

const DollarIcon = () => (
    <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5.5 12H12v2h-2v-2H8.5c-1.38 0-2.5-1.12-2.5-2.5S7.12 9 8.5 9H11V7h2v2h1.5c1.38 0 2.5 1.12 2.5 2.5S15.88 14 14.5 14zm0-3H12V9h2.5c.83 0 1.5.67 1.5 1.5S15.33 12 14.5 12zM11 12H8.5c-.83 0-1.5-.67-1.5-1.5S7.67 9 8.5 9H11v3z"/>
        </svg>
    </div>
);

const HomePage: React.FC = () => {
    const [businessName, setBusinessName] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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
                <button onClick={handleSubmit} className="bg-fuchsia-500 text-white font-bold py-2 px-5 rounded-full text-sm hover:bg-fuchsia-600 transition-colors">
                    GET STARTED
                </button>
            </header>
            <main className="flex flex-col items-center justify-center min-h-screen p-4 text-center pt-24">
                <div className="w-full max-w-xl mx-auto">
                    <div className="flex justify-center">
                        <DollarIcon />
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-black leading-none">
                       Scale up your best conversations
                    </h1>
                    <p className="text-gray-600 mt-4 max-w-lg mx-auto text-lg">
                       Powerful automations for all the ways you engage and monetize.
                    </p>
                    
                    <form onSubmit={handleSubmit} className="mt-10 space-y-6 text-left">
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
                        
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full py-4 px-8 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-transform transform hover:scale-105"
                            >
                                GENERAR PÁGINA DE RESEÑAS
                            </button>
                        </div>
                    </form>
                </div>
            </main>
             <div className="bg-yellow-300 p-10 text-center">
                <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-black leading-none">Turn comments into conversations that sell</h2>
                 <p className="text-black/80 mt-4 max-w-xl mx-auto">
                    “How much is this?” or “Do you ship to Mars?” Instant reply. Boom — wallets open, money.
                </p>
                <div className="mt-8">
                    <button
                        onClick={(e) => {
                            if (!shareUrl || !businessName) {
                                e.preventDefault();
                                document.getElementById('businessName')?.focus();
                            } else {
                                handleSubmit(e);
                            }
                        }}
                        className="py-4 px-10 border border-transparent rounded-full shadow-lg text-lg font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-transform transform hover:scale-105"
                    >
                        GET STARTED
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