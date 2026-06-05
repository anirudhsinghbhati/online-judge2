import { Link } from 'react-router-dom';

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.01a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.87.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.01a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.34-1.87l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.01a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.87-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9c.38.58.96.95 1.6 1H21a2 2 0 1 1 0 4h-.01a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

export default function AdminShell({ breadcrumb, toolbar, children }) {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-950/70 shadow-glow backdrop-blur-xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
            {breadcrumb.map((item, index) => (
              <span key={item.label} className="flex items-center gap-2">
                {index === 0 ? (
                  <Link
                    to={item.to}
                    className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 transition hover:border-cyan-300/30 hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-300">{item.label}</span>
                )}
                {index < breadcrumb.length - 1 ? <span className="text-slate-500">&gt;</span> : null}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              aria-label="Profile"
            >
              <ProfileIcon />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
              aria-label="Settings"
            >
              <SettingsIcon />
            </button>
          </div>
        </header>

        <div className="px-4 py-5 sm:px-6 sm:py-6">{toolbar}</div>
        <div className="px-4 pb-5 sm:px-6 sm:pb-6">{children}</div>
      </div>
    </div>
  );
}