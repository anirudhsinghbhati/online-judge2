import { useEffect, useState } from 'react';
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

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError('');
        const activeUserId = localStorage.getItem('demo_active_user_id');

        if (!activeUserId) {
          setError('No active simulated user selected.');
          setLoading(false);
          return;
        }

        const data = await requestJson(`/api/users/${activeUserId}/profile`);
        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <UserLayout>
        <div className="flex-1 flex flex-col justify-center items-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading profile analytics...</p>
        </div>
      </UserLayout>
    );
  }

  if (error || !profile) {
    return (
      <UserLayout>
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 mt-6">
          {error || 'Profile failed to load.'}
        </div>
      </UserLayout>
    );
  }

  const { user, stats } = profile;
  const easyStats = stats.difficultyBreakdown.Easy;
  const mediumStats = stats.difficultyBreakdown.Medium;
  const hardStats = stats.difficultyBreakdown.Hard;

  // Compute percentages
  const easyPercent = easyStats.total > 0 ? (easyStats.solved / easyStats.total) * 100 : 0;
  const mediumPercent = mediumStats.total > 0 ? (mediumStats.solved / mediumStats.total) * 100 : 0;
  const hardPercent = hardStats.total > 0 ? (hardStats.solved / hardStats.total) * 100 : 0;

  const totalPercent = stats.totalPracticeProblems > 0 ? (stats.totalSolved / stats.totalPracticeProblems) * 100 : 0;

  function getVerdictBadge(verdict) {
    switch (verdict) {
      case 'Accepted':
        return <span className="text-emerald-400 font-bold">Accepted</span>;
      case 'Wrong Answer':
        return <span className="text-rose-400 font-bold">Wrong Answer</span>;
      case 'Time Limit Exceeded':
        return <span className="text-amber-400 font-bold">Time Limit Exceeded</span>;
      case 'Runtime Error':
        return <span className="text-indigo-400 font-bold">Runtime Error</span>;
      case 'Compilation Error':
        return <span className="text-slate-400 font-semibold">Compilation Error</span>;
      default:
        return <span className="text-slate-400">{verdict}</span>;
    }
  }

  return (
    <UserLayout>
      <div className="space-y-6 flex-1 flex flex-col">
        
        {/* Profile User Header */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 p-6 shadow-glow backdrop-blur-xl">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-400/5 blur-3xl" />
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            {/* Initial Circle Avatar */}
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-[0_0_20px_rgba(34,211,238,0.3)] select-none shrink-0">
              {String(user.name || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-extrabold text-white tracking-wide">{user.name}</h1>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                  {user.role}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  user.status === 'Active' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-slate-500/20 bg-slate-500/10 text-slate-400'
                }`}>
                  {user.status}
                </span>
              </div>
              <p className="text-sm text-slate-400">{user.email}</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 font-mono">
                <div>Activity: {user.last_activity}</div>
                <div className="hidden sm:block text-slate-700">|</div>
                <div>Member Since: {new Date(user.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section Grid */}
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] items-start flex-1">
          
          {/* LEFT: SOLVED PROGRESS COUNT & DIFFICULTY breakdown */}
          <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-glow space-y-6 flex flex-col items-center">
            <h2 className="text-lg font-bold text-white tracking-wide w-full border-b border-white/5 pb-2">Solved Problems</h2>

            {/* Circular Progress Ring */}
            <div className="relative h-44 w-44 flex items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Track circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-900 fill-none"
                  strokeWidth="8"
                />
                {/* Active circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-cyan-400 fill-none transition-all duration-500"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - totalPercent / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white font-mono">{stats.totalSolved}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">
                  Solved / {stats.totalPracticeProblems}
                </span>
              </div>
            </div>

            {/* Difficulty breakdown list */}
            <div className="w-full space-y-4">
              
              {/* Easy Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-400">Easy</span>
                  <span className="text-slate-400 font-mono">{easyStats.solved} / {easyStats.total}</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${easyPercent}%` }}
                  />
                </div>
              </div>

              {/* Medium Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-amber-400">Medium</span>
                  <span className="text-slate-400 font-mono">{mediumStats.solved} / {mediumStats.total}</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300 rounded-full"
                    style={{ width: `${mediumPercent}%` }}
                  />
                </div>
              </div>

              {/* Hard Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-rose-400">Hard</span>
                  <span className="text-slate-400 font-mono">{hardStats.solved} / {hardStats.total}</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-rose-400 transition-all duration-300 rounded-full"
                    style={{ width: `${hardPercent}%` }}
                  />
                </div>
              </div>

            </div>
          </section>

          {/* RIGHT: ACCURACY STATS CARD & SUBMISSIONS LOG */}
          <div className="space-y-6">
            
            {/* Accuracy Summary Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 shadow-glow font-mono">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block font-sans">Total Submissions</span>
                <span className="text-3xl font-extrabold text-white mt-1 block">{user.submissions_count}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 shadow-glow font-mono">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block font-sans">Acceptance Rate</span>
                <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">{Number(user.acceptance_rate).toFixed(2)}%</span>
              </div>
            </div>

            {/* Submission Log */}
            <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-glow space-y-4">
              <h2 className="text-lg font-bold text-white tracking-wide border-b border-white/5 pb-2">Recent Submissions</h2>
              
              {stats.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                <div className="border border-white/5 bg-slate-950/40 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/15 bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-3">Problem</th>
                        <th className="px-4 py-3 w-28">Difficulty</th>
                        <th className="px-4 py-3 w-36">Verdict</th>
                        <th className="px-4 py-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                      {stats.recentSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 font-semibold text-white">
                            {sub.problem_title}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${
                              sub.problem_difficulty === 'Hard' ? 'text-rose-400' : sub.problem_difficulty === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {sub.problem_difficulty}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono">
                            {getVerdictBadge(sub.verdict)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500 font-mono">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400 text-sm">
                  No submissions reported yet.
                </div>
              )}
            </section>

          </div>

        </div>

      </div>
    </UserLayout>
  );
}
