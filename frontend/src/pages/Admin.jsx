import { Link } from 'react-router-dom';

const dashboardCards = [
  {
    title: 'User Management',
    to: '/admin/user-management',
    description: 'Handle users, roles, access, and account review tasks from one place.',
    accent: 'from-cyan-400/30 to-sky-500/10'
  },
  {
    title: 'Problem Management',
    to: '/admin/problem-management',
    description: 'Create, review, and organize coding problems for the platform.',
    accent: 'from-emerald-400/30 to-teal-500/10'
  },
  {
    title: 'Contest Management',
    to: '/admin/contest-management',
    description: 'Plan contests, manage schedules, and keep event operations visible.',
    accent: 'from-amber-400/30 to-orange-500/10'
  },
  {
    title: 'Logs',
    to: '/admin/logs',
    description: 'Review audit trails, system events, and important operational activity.',
    accent: 'from-rose-400/30 to-red-500/10'
  }
];

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

function Admin() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-white/10 bg-slate-950/70 shadow-glow backdrop-blur-xl">
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/10"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
            Admin Dashboard
          </Link>

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

        <main className="px-4 py-6 sm:px-6 sm:py-8">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboardCards.map((card) => (
              <Link
                key={card.title}
                to={card.to}
                className="group rounded-[24px] border border-white/10 bg-slate-950/55 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.06]"
              >
                <div className={`h-1.5 rounded-full bg-gradient-to-r ${card.accent}`} />
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{card.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{card.description}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-300 transition group-hover:border-white/20">
                    Open
                  </span>
                </div>
              </Link>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Admin;