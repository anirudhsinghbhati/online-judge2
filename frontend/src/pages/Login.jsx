import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload.data;
}

export default function Login() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is already logged in, redirect them
    const activeUserId = localStorage.getItem('demo_active_user_id');
    const activeUserRole = localStorage.getItem('demo_active_user_role');
    if (activeUserId && activeUserRole) {
      if (activeUserRole === 'Admin' || activeUserRole === 'Moderator') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
      return;
    }

    let cancelled = false;
    async function loadUsers() {
      try {
        setLoading(true);
        const data = await requestJson('/api/admin/users');
        if (!cancelled) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to fetch simulated profiles. Please check if backend is running.');
          console.error(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleSelectUser(user) {
    localStorage.setItem('demo_active_user_id', user.id);
    localStorage.setItem('demo_active_user_name', user.name);
    localStorage.setItem('demo_active_user_role', user.role);

    // Dispatch event to sync state across tabs
    window.dispatchEvent(new Event('storage'));

    if (user.role === 'Admin' || user.role === 'Moderator') {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(148,163,184,0.08),rgba(255,255,255,0))] text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="absolute top-10 flex items-center gap-2 group select-none">
        <span className="h-3.5 w-3.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        <span className="font-black text-2xl tracking-widest text-white uppercase group-hover:text-cyan-300 transition">
          Code Runner
        </span>
      </div>

      <div className="glass-panel max-w-md w-full rounded-[32px] border border-white/10 bg-slate-950/65 p-8 shadow-glow backdrop-blur-2xl mt-12 animate-fade-in">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-extrabold text-white tracking-wide">Portal Authentication</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select a simulated user profile from the database to log in and access their respective portal workspace.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">Loading profiles...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3.5 text-xs text-rose-300 font-medium leading-relaxed text-center">
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full rounded-2xl bg-white/5 border border-white/10 py-3 text-xs font-bold text-white transition hover:bg-white/10"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
            {users.map((u) => {
              const isAdmin = u.role === 'Admin' || u.role === 'Moderator';
              const initial = String(u.name || 'U').charAt(0).toUpperCase();

              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-400/30 transition-all duration-200 group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white transition group-hover:scale-105 shrink-0 ${
                      isAdmin 
                        ? 'bg-gradient-to-tr from-amber-500 to-rose-600 shadow-[0_0_10px_rgba(245,158,11,0.25)]' 
                        : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    }`}>
                      {initial}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{u.email}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    isAdmin 
                      ? 'border-amber-400/25 bg-amber-400/10 text-amber-300' 
                      : 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300'
                  }`}>
                    {u.role}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-8 border-t border-white/5 pt-4 text-center">
          <p className="text-[10px] text-slate-500 leading-normal">
            Production mode credentials restriction active. Role selection is simulated via active database profiles for review purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
