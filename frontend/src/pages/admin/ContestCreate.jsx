import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminShell from '../../components/AdminShell';
import { requestJson } from '../../lib/adminApi';

export default function ContestCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    contestName: '',
    contestCode: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    duration: '',
    visibility: 'Public',
    allowedUsers: '',
    status: 'Upcoming',
    problemIds: ''
  });
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

      await requestJson('/api/admin/contests', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          problemIds: form.problemIds
            .split(',')
            .map((value) => Number.parseInt(value.trim(), 10))
            .filter((value) => Number.isInteger(value) && value > 0)
        })
      });

      navigate('/admin/contest-management');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Contest Management' }, { label: 'Create Contest' }]}>
      {error ? <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl rounded-[24px] border border-white/10 bg-slate-950/55 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ['Contest Name', 'text'],
            ['Contest Code', 'text'],
            ['Start Date', 'date'],
            ['Start Time', 'time'],
            ['End Date', 'date'],
            ['End Time', 'time'],
            ['Duration', 'text']
          ].map(([label, type]) => (
            <label key={label} className="space-y-2 text-sm text-slate-200">
              <span className="text-slate-400">{label}</span>
              <input value={form[label.replace(/\s+/g, '').replace('ContestName', 'contestName').replace('ContestCode', 'contestCode').replace('StartDate', 'startDate').replace('StartTime', 'startTime').replace('EndDate', 'endDate').replace('EndTime', 'endTime').replace('Duration', 'duration')]} onChange={(event) => updateField(label.replace(/\s+/g, '').replace('ContestName', 'contestName').replace('ContestCode', 'contestCode').replace('StartDate', 'startDate').replace('StartTime', 'startTime').replace('EndDate', 'endDate').replace('EndTime', 'endTime').replace('Duration', 'duration'), event.target.value)} type={type} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40" />
            </label>
          ))}

          <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
            <span className="text-slate-400">Description</span>
            <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} rows="4" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40" />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Visibility Settings</span>
            <select value={form.visibility} onChange={(event) => updateField('visibility', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40">
              <option>Public</option>
              <option>Private</option>
              <option>Password Protected</option>
              <option>Organization Only</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Contest Access Control</span>
            <input value={form.allowedUsers} onChange={(event) => updateField('allowedUsers', event.target.value)} type="text" placeholder="Allowed Users" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40" />
          </label>

          <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
            <span className="text-slate-400">Contest Status</span>
            <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40">
              <option>Upcoming</option>
              <option>Active</option>
              <option>Completed</option>
              <option>Canceled</option>
              <option>Private</option>
              <option>Public</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
            <span className="text-slate-400">Add Problems</span>
            <textarea value={form.problemIds} onChange={(event) => updateField('problemIds', event.target.value)} rows="3" placeholder="Comma-separated problem IDs" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40" />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
            {saving ? 'Creating...' : 'Create Contest'}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}