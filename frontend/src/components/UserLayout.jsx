import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

export default function UserLayout({ children, fullWidth }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeUser, setActiveUser] = useState(() => {
    const id = localStorage.getItem('demo_active_user_id');
    const name = localStorage.getItem('demo_active_user_name');
    const role = localStorage.getItem('demo_active_user_role');
    return id ? { id: Number(id), name, role } : null;
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Load user profile details synchronously and fetch email from api
  useEffect(() => {
    const id = localStorage.getItem('demo_active_user_id');
    if (!id) {
      navigate('/login');
      return;
    }

    let cancelled = false;

    async function loadActiveUser() {
      try {
        const data = await requestJson(`/api/users/${id}/profile`);
        if (!cancelled && data && data.user) {
          setActiveUser(data.user);
          localStorage.setItem('demo_active_user_name', data.user.name);
          localStorage.setItem('demo_active_user_role', data.user.role);
        }
      } catch (err) {
        console.error('Failed to load active user profile:', err);
      }
    }

    loadActiveUser();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Click outside listener to close profile dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutsideClick(event) {
      if (!event.target.closest('.profile-dropdown-container')) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [dropdownOpen]);

  function handleLogout() {
    localStorage.removeItem('demo_active_user_id');
    localStorage.removeItem('demo_active_user_name');
    localStorage.removeItem('demo_active_user_role');

    // Notify other components/tabs
    window.dispatchEvent(new Event('storage'));

    navigate('/login');
  }

  // Production layout links: Profile resides inside top-right dropdown, not main tabs
  const navLinks = [
    { label: 'Dashboard', to: '/user' },
    { label: 'Practice', to: '/user/practice' },
    { label: 'Contests', to: '/user/contests' }
  ];

  const initial = String(activeUser?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#070b19] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] text-slate-100 flex flex-col">
      {/* GLOBAL NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/70 backdrop-blur-xl px-4 py-3 sm:px-6 lg:px-8">
        <div className={`mx-auto flex items-center justify-between gap-4 ${fullWidth ? 'w-full' : 'max-w-7xl'}`}>
          
          {/* Logo & Brand Name */}
          <Link to="/user" className="flex items-center gap-2 group">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
            <span className="font-extrabold text-lg tracking-wider text-white uppercase group-hover:text-cyan-300 transition">
              Code Runner
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = link.to === '/user' 
                ? location.pathname === '/user' 
                : location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    active
                      ? 'bg-cyan-400/10 text-cyan-300 border border-cyan-400/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            
            {/* Quick Admin Console shortcut (Only for Admin/Mod) */}
            {activeUser && (activeUser.role === 'Admin' || activeUser.role === 'Moderator') && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/20"
              >
                Admin Panel
              </Link>
            )}

            {/* Notification, Profile, Settings toolbar (100% same as in the admin panel) */}
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              
              {/* Notifications bell button */}
              <button
                type="button"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                title="Notifications"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {/* Active notifications indicator dot */}
                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              </button>

              {/* Profile button (toggles dropdown menu) */}
              <div className="relative profile-dropdown-container">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                    dropdownOpen
                      ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                      : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10'
                  }`}
                  title="User Profile"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="8" r="4" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3.5 w-60 rounded-2xl border border-white/10 bg-slate-950/95 p-3 shadow-glow backdrop-blur-3xl z-50 animate-fade-in">
                    {/* User Info Header */}
                    <div className="px-3 py-2.5">
                      <p className="text-sm font-bold text-white truncate">{activeUser?.name || 'User'}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{activeUser?.email || 'Guest Session'}</p>
                      <div className="mt-2.5">
                        <span className={`text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                          activeUser?.role === 'Admin' || activeUser?.role === 'Moderator'
                            ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
                            : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300'
                        }`}>
                          {activeUser?.role || 'Contestant'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-white/5 my-2" />
                    
                    {/* Navigation Items */}
                    <div className="space-y-1">
                      <Link
                        to="/user/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21a8 8 0 0 0-16 0" />
                          <circle cx="12" cy="8" r="4" />
                        </svg>
                        Profile Analytics
                      </Link>
                      
                      <button
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        System Settings
                      </button>

                      {(activeUser?.role === 'Admin' || activeUser?.role === 'Moderator') && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                          </svg>
                          Admin Console
                        </Link>
                      )}
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-white/5 my-2" />
                    
                    {/* Logout Option */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>

              {/* Settings button */}
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
                title="Settings"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* MOBILE NAV BAR */}
      <div className="md:hidden border-b border-white/5 bg-slate-950/50 flex justify-around py-2.5">
        {navLinks.map((link) => {
          const active = link.to === '/user' 
            ? location.pathname === '/user' 
            : location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`text-xs font-bold uppercase transition ${
                active ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* MAIN CONTAINER */}
      <main className={`flex-1 w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col animate-fade-in ${fullWidth ? 'max-w-none' : 'max-w-7xl'}`}>
        {children}
      </main>
    </div>
  );
}
