import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import AdminShell from '../../components/AdminShell';
import { requestJson } from '../../lib/adminApi';

const filters = ['All', 'Active', 'Upcoming', 'Completed', 'Canceled', 'Private', 'Public'];

export default function ContestManagement() {
  const [contests, setContests] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadContests() {
      try {
        setLoading(true);
        const data = await requestJson('/api/admin/contests');
        if (!cancelled) {
          setContests(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadContests();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleContests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return contests.filter((contest) => {
      if (!term) {
        return true;
      }

      return [contest.id, contest.contest_name, contest.contest_code, contest.status].join(' ').toLowerCase().includes(term);
    });
  }, [contests, search]);

  const toolbar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full items-center gap-3 lg:max-w-4xl">
        <input
          type="search"
          placeholder="Search contests"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
        />
      </div>
      <Link
        to="/admin/contest-management/create"
        className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
      >
        Create
      </Link>
    </div>
  );

  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Contest Management' }]} toolbar={toolbar}>
      {error ? <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <button
            key={filter}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm transition ${
              index === 0
                ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/55">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Contest ID</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Contest Name</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Start Date</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Start Time</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">End Date</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">End Time</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Duration</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-300" colSpan={8}>Loading contests...</td>
                </tr>
              ) : visibleContests.length > 0 ? (
                visibleContests.map((contest) => (
                  <tr key={contest.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-4 text-slate-200">{contest.id}</td>
                    <td className="px-4 py-4 text-slate-200">{contest.contest_name}</td>
                    <td className="px-4 py-4 text-slate-200">{contest.start_date}</td>
                    <td className="px-4 py-4 text-slate-200">{contest.start_time}</td>
                    <td className="px-4 py-4 text-slate-200">{contest.end_date}</td>
                    <td className="px-4 py-4 text-slate-200">{contest.end_time}</td>
                    <td className="px-4 py-4 text-slate-200">{contest.duration}</td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/contest-management/${contest.id}`}
                        className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:bg-cyan-300/20"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-300" colSpan={8}>No contests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}