import { Navigate, Route, Routes } from 'react-router-dom';

import Admin from './pages/Admin';
import User from './pages/User';

export default function App() {
  return (
    <div className="min-h-screen text-slate-100">
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
