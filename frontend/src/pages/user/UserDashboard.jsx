import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/UserLayout';

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

export default function UserDashboard() {
  const [latestNotice, setLatestNotice] = useState(null);
  const [activeContestCount, setActiveContestCount] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      try {
        setLoading(true);

        // 1. Load latest notice
        const notices = await requestJson('/api/notices');
        if (!cancelled && notices && notices.length > 0) {
          setLatestNotice(notices[0]);
        }

        // 2. Load contests to check for active ones
        const contests = await requestJson('/api/contests');
        if (!cancelled && Array.isArray(contests)) {
          const activeCount = contests.filter((c) => c.status === 'Active').length;
          setActiveContestCount(activeCount);
        }

        // 3. Load active simulated user profile stats
        const activeUserId = localStorage.getItem('demo_active_user_id');
        if (activeUserId) {
          const profileData = await requestJson(`/api/users/${activeUserId}/profile`);
          if (!cancelled) {
            setUserProfile(profileData);
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <UserLayout>
      <div className="space-y-6 flex-1 flex flex-col justify-center py-4">
        
        {/* BIG NOTICE BAR / BANNER */}
        {latestNotice ? (
          <div className="relative overflow-hidden rounded-[24px] border border-cyan-400/30 bg-slate-950/60 p-6 shadow-glow backdrop-blur-xl animate-fade-in">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-cyan-300 font-mono">Latest Notice by Admin</p>
                </div>
                <h2 className="text-xl font-bold text-white">{latestNotice.title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">{latestNotice.content}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-500 font-mono block">
                  Posted: {new Date(latestNotice.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-slate-950/60 p-6 backdrop-blur-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <div>
                <h2 className="text-sm font-semibold text-slate-200">Welcome to Code Runner</h2>
                <p className="text-xs text-slate-400 mt-0.5">Check out practice tasks or sign up for active coding contests below.</p>
              </div>
            </div>
          </div>
        )}

        {/* ECOSYSTEM CARDS GRID */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* PRACTICE CARD */}
          <Link
            to="/user/practice"
            className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.05] shadow-glow flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-sky-500 w-full" />
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 18l6-6-6-6M8 6L2 12l6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">Practice Arena</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Solve curated algorithmic problems grouped by tags. Run your code in Monaco editor, test on multiple testcases, and review performance metrics.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-white transition">
              <span>Enter Arena</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* CONTESTS CARD */}
          <Link
            to="/user/contests"
            className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:bg-white/[0.05] shadow-glow flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 w-full" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a4 4 0 0 1 4 4v7.3a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V6a4 4 0 0 1 4-4z" />
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  </svg>
                </div>
                
                {/* LIVE BLINKER FOR CONTEST */}
                {activeContestCount > 0 ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-300 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                    {activeContestCount} Live
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    No Live Events
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition">Code Contests</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  Join real-time coding events, battle with colleagues, and check the live Leaderboard standings. Test your speed and logic under tight timed conditions.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-white transition">
              <span>View Schedule</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* USER STATS PROFILE ANALYTICS CARD */}
          <Link
            to="/user/profile"
            className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-white/[0.05] shadow-glow flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 w-full" />
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21a8 8 0 0 0-16 0" />
                  <circle cx="12" cy="8" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition">User Analytics</h3>
                
                {loading ? (
                  <div className="mt-2 space-y-2">
                    <div className="h-3 w-16 animate-pulse rounded bg-white/10" />
                    <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
                  </div>
                ) : userProfile ? (
                  <div className="mt-3 space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                      <span>Total Solved</span>
                      <span className="font-bold text-white font-mono">{userProfile.stats.totalSolved}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-1">
                      <span>Acceptance Rate</span>
                      <span className="font-bold text-emerald-300 font-mono">
                        {Number(userProfile.user.acceptance_rate).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Submissions Count</span>
                      <span className="font-bold text-white font-mono">{userProfile.user.submissions_count}</span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    View detailed LeetCode-style statistics of your submitted problems by difficulty level, accuracy metrics, and activity history.
                  </p>
                )}

              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-white transition">
              <span>View Analytics</span>
              <span>&rarr;</span>
            </div>
          </Link>

        </div>

      </div>
    </UserLayout>
  );
}
