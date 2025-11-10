
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReviewsPage from './pages/ReviewsPage';

function App() {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
