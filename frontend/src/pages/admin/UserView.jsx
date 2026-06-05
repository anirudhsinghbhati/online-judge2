import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AdminShell from '../../components/AdminShell';
import { requestJson } from '../../lib/adminApi';

export default function UserView() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const data = await requestJson(`/api/admin/users/${userId}`);
        if (!cancelled) {
          setUser(data);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function toggleUserStatus() {
    const nextStatus = user?.status === 'Active' ? 'Deactivated' : 'Active';
    const data = await requestJson(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus })
    });
    setUser(data);
  }

  async function deleteUser() {
    await requestJson(`/api/admin/users/${userId}`, { method: 'DELETE' });
    window.location.href = '/admin/user-management';
  }

  if (error) {
    return (
      <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'User Management' }, { label: 'View User' }]}>
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      </AdminShell>
    );
  }

  if (!user) {
    return (
      <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'User Management' }, { label: 'View User' }]}>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">Loading user...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'User Management' }, { label: 'View User' }]}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">User Details</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{user.name}</h1>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Email', user.email],
              ['Role', user.role],
              ['Status', user.status],
              ['User ID', userId]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={toggleUserStatus} type="button" className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950">
              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={deleteUser} type="button" className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100">
              Delete
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Submissions', user.analytics?.submissions ?? 0],
              ['Acceptance Rate', `${user.analytics?.acceptanceRate ?? 0}%`],
              ['Contests', user.analytics?.contests ?? 0]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Analytics</p>
            <div className="mt-4 space-y-4">
              {[
                ['Problems solved', 74],
                ['Contest participation', 62],
                ['Profile completion', 88],
                ['Activity score', 69]
              ].map(([label, width]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{label}</span>
                    <span className="text-slate-500">{width}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5">
                    <div className="h-3 rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}