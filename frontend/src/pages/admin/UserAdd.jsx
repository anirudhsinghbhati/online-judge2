import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminShell from '../../components/AdminShell';
import { requestJson } from '../../lib/adminApi';

export default function UserAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', role: 'Contestant', password: '', validTill: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      await requestJson('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      navigate('/admin/user-management');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'User Management', to: '/admin/user-management' }, { label: 'Add User' }]}>
      {error ? <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl rounded-[24px] border border-white/10 bg-slate-950/55 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Name</span>
            <input value={form.name} onChange={(event) => updateField('name', event.target.value)} type="text" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40" />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Email</span>
            <input value={form.email} onChange={(event) => updateField('email', event.target.value)} type="email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40" />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Role</span>
            <select value={form.role} onChange={(event) => updateField('role', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40 text-slate-100">
              <option className="bg-slate-950 text-slate-100">Admin</option>
              <option className="bg-slate-950 text-slate-100">Moderator</option>
              <option className="bg-slate-950 text-slate-100">Contestant</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Password</span>
            <input value={form.password} onChange={(event) => updateField('password', event.target.value)} type="password" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40" />
          </label>
          <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
            <span className="text-slate-400">Valid Till</span>
            <input value={form.validTill} onChange={(event) => updateField('validTill', event.target.value)} type="date" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}