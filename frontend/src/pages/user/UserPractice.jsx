import { useEffect, useState, useMemo } from 'react';
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

export default function UserPractice() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering States
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;

    async function loadProblems() {
      try {
        setLoading(true);
        setError('');
        const activeUserId = localStorage.getItem('demo_active_user_id') || 0;
        
        // Fetch practice problems along with user statuses
        const data = await requestJson(`/api/problems/practice?userId=${activeUserId}`);
        
        if (!cancelled) {
          setProblems(Array.isArray(data) ? data : []);
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

    loadProblems();

    return () => {
      cancelled = true;
    };
  }, []);

  // Compute filtered problems list
  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchSearch = problem.title.toLowerCase().includes(search.toLowerCase()) ||
                          problem.topic.toLowerCase().includes(search.toLowerCase()) ||
                          String(problem.id).includes(search);
      
      const matchDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
      
      const matchStatus = statusFilter === 'All' || problem.user_status === statusFilter;

      return matchSearch && matchDifficulty && matchStatus;
    });
  }, [problems, search, difficultyFilter, statusFilter]);

  function getStatusBadge(status) {
    switch (status) {
      case 'Solved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Solved
          </span>
        );
      case 'Attempted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Attempted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
            Todo
          </span>
        );
    }
  }

  function getDifficultyBadge(difficulty) {
    switch (difficulty) {
      case 'Hard':
        return <span className="text-xs font-semibold text-rose-400 bg-rose-400/5 px-2 py-0.5 rounded border border-rose-400/15">{difficulty}</span>;
      case 'Medium':
        return <span className="text-xs font-semibold text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/15">{difficulty}</span>;
      default:
        return <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/15">{difficulty}</span>;
    }
  }

  return (
    <UserLayout>
      <div className="space-y-6 flex-1 flex flex-col">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Practice Arena</h1>
          <p className="text-sm text-slate-400 mt-1">Hone your logic on code challenges published by administrators.</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {/* SEARCH AND FILTERS BOX */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 shadow-glow flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2 relative">
            <input
              type="text"
              placeholder="Search problems by name, tag, or id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-400/50 focus:bg-slate-950"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Difficulty Filter */}
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-slate-400">
              <span>Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-950 text-slate-100">All</option>
                <option value="Easy" className="bg-slate-950 text-slate-100">Easy</option>
                <option value="Medium" className="bg-slate-950 text-slate-100">Medium</option>
                <option value="Hard" className="bg-slate-950 text-slate-100">Hard</option>
              </select>
            </label>

            {/* Status Filter */}
            <label className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2.5 text-xs text-slate-400">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-950 text-slate-100">All Status</option>
                <option value="Solved" className="bg-slate-950 text-slate-100">Solved</option>
                <option value="Attempted" className="bg-slate-950 text-slate-100">Attempted</option>
                <option value="Unattempted" className="bg-slate-950 text-slate-100">Unattempted</option>
              </select>
            </label>

          </div>
        </section>

        {/* PROBLEMS TABLE LIST */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/40 overflow-hidden shadow-glow flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/60 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 w-20">ID</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4 w-40">Difficulty</th>
                  <th className="px-6 py-4 w-44">Topic Tag</th>
                  <th className="px-6 py-4 w-40">Status</th>
                  <th className="px-6 py-4 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {loading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-white/5" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-48 rounded bg-white/5" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 rounded bg-white/5" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-white/5" /></td>
                      <td className="px-6 py-4"><div className="h-6 w-20 rounded bg-white/5" /></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 w-16 ml-auto rounded bg-white/5" /></td>
                    </tr>
                  ))
                ) : filteredProblems.length > 0 ? (
                  filteredProblems.map((problem) => (
                    <tr
                      key={problem.id}
                      className="transition duration-150 hover:bg-white/[0.02] group"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-500 group-hover:text-cyan-300 transition">
                        #{problem.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        <Link
                          to={`/user/problems/${problem.id}`}
                          className="hover:text-cyan-300 transition"
                        >
                          {problem.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {getDifficultyBadge(problem.difficulty)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-900 border border-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                          {problem.topic}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(problem.user_status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/user/problems/${problem.id}`}
                          className="inline-flex items-center rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-400 hover:text-slate-950 transition duration-150"
                        >
                          Solve
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No problems found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}
