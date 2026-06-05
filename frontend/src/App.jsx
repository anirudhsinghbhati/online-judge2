import { Navigate, Route, Routes } from 'react-router-dom';

import Admin from './pages/Admin';
import ContestCreate from './pages/admin/ContestCreate';
import ContestManagement from './pages/admin/ContestManagement';
import ContestView from './pages/admin/ContestView';
import Logs from './pages/admin/Logs';
import ProblemAdd from './pages/admin/ProblemAdd';
import ProblemManagement from './pages/admin/ProblemManagement';
import UserAdd from './pages/admin/UserAdd';
import UserManagement from './pages/admin/UserManagement';
import UserView from './pages/admin/UserView';
import User from './pages/User';

export default function App() {
  return (
    <div className="min-h-screen text-slate-100">
      <Routes>
        <Route path="/" element={<Navigate to="/user" replace />} />
        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/problem-management" element={<ProblemManagement />} />
        <Route path="/admin/problem-management/add" element={<ProblemAdd />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/admin/user-management/add" element={<UserAdd />} />
        <Route path="/admin/user-management/:userId" element={<UserView />} />
        <Route path="/admin/contest-management" element={<ContestManagement />} />
        <Route path="/admin/contest-management/create" element={<ContestCreate />} />
        <Route path="/admin/contest-management/:contestId" element={<ContestView />} />
        <Route path="/admin/logs" element={<Logs />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
