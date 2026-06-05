import AdminShell from '../../components/AdminShell';

const logs = [
  { time: '09:18', source: 'Auth', event: 'Moderator invited to team', severity: 'Info' },
  { time: '09:08', source: 'Judge', event: 'Queue spike detected', severity: 'Warning' },
  { time: '08:42', source: 'API', event: 'Submission retry triggered', severity: 'Info' },
  { time: '08:12', source: 'Security', event: 'Suspicious login blocked', severity: 'Critical' }
];

export default function Logs() {
  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Logs' }]}>
      <div className="mb-4 flex gap-3">
        <input
          type="search"
          placeholder="Search logs"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
        />
      </div>

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
              {logs.map((log) => (
                <tr key={`${log.time}-${log.event}`} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-4 text-slate-200">{log.time}</td>
                  <td className="px-4 py-4 text-slate-200">{log.source}</td>
                  <td className="px-4 py-4 text-slate-200">{log.event}</td>
                  <td className="px-4 py-4 text-slate-200">{log.severity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}