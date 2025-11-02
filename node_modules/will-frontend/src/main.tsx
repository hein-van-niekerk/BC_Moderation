import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import ModuleOverview from './pages/ModuleOverview';
import TestDetail from './pages/TestDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/modules" element={<ModuleOverview/>} />
        <Route path="/tests/:testId" element={<TestDetail/>} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(<App/>);
