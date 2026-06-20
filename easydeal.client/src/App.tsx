import './App.css';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Pages/Landing.tsx';
import Home from './Pages/Home.tsx';
import Login from './Pages/Login.tsx';
import Register from './Pages/Register.tsx';
import ConfirmEmail from './Pages/ConfirmEmail';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/confirm-email" element={<ConfirmEmail />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;