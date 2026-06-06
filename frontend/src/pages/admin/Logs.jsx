import { useEffect, useMemo, useState } from 'react';

import AdminShell from '../../components/AdminShell';
import { requestJson } from '../../lib/adminApi';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      try {
        setLoading(true);
        const data = await requestJson('/api/admin/logs');
        if (!cancelled) {
          setLogs(Array.isArray(data) ? data : []);
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

    loadLogs();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleLogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (!term) {
        return true;
      }
      return [log.source, log.event, log.severity].join(' ').toLowerCase().includes(term);
    });
  }, [logs, search]);

  function formatTime(dateString) {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return dateString;
    }
  }

  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Logs' }]}>
      <div className="mb-4 flex gap-3">
        <input
          type="search"
          placeholder="Search logs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
        />
      </div>

      {error ? <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/55">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Time</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Source</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Event</th>
                <th className="px-4 py-3 font-medium uppercase tracking-[0.28em]">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-300" colSpan={4}>Loading logs...</td>
                </tr>
              ) : visibleLogs.length > 0 ? (
                visibleLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.03]">
                    <td className="px-4 py-4 text-slate-200">{formatTime(log.created_at)}</td>
                    <td className="px-4 py-4 text-slate-200">{log.source}</td>
                    <td className="px-4 py-4 text-slate-200">{log.event}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        log.severity === 'Critical' || log.severity === 'Error'
                          ? 'bg-rose-400/15 text-rose-200 ring-1 ring-rose-300/30'
                          : log.severity === 'Warning'
                            ? 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30'
                            : 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/30'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-slate-300" colSpan={4}>No logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}