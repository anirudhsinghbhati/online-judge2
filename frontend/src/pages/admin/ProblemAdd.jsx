import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminShell from '../../components/AdminShell';
import { requestJson } from '../../lib/adminApi';

export default function ProblemAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    topic: '',
    constraints: '',
    imageUrl: '',
    isPractice: true,
    officialSolution: '',
    visibleInput1: '',
    visibleOutput1: '',
    visibleInput2: '',
    visibleOutput2: '',
    hiddenInput1: '',
    hiddenOutput1: '',
    hiddenInput2: '',
    hiddenOutput2: ''
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

      const payload = {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        topic: form.topic,
        constraints: form.constraints,
        imageUrl: form.imageUrl,
        isPractice: form.isPractice,
        officialSolution: form.officialSolution,
        testcases: [
          { input_data: form.visibleInput1, expected_output: form.visibleOutput1, visibility: 'visible', sort_order: 0 },
          { input_data: form.visibleInput2, expected_output: form.visibleOutput2, visibility: 'visible', sort_order: 1 },
          { input_data: form.hiddenInput1, expected_output: form.hiddenOutput1, visibility: 'hidden', sort_order: 2 },
          { input_data: form.hiddenInput2, expected_output: form.hiddenOutput2, visibility: 'hidden', sort_order: 3 }
        ]
      };

      await requestJson('/api/admin/problems', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      navigate('/admin/problem-management');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Problem Management', to: '/admin/problem-management' }, { label: 'Add Problem' }]}>
      {error ? <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-white/10 bg-slate-950/55 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
            <span className="text-slate-400">Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Difficulty</span>
            <select value={form.difficulty} onChange={(event) => updateField('difficulty', event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Topic</span>
            <input
              type="text"
              value={form.topic}
              onChange={(event) => updateField('topic', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Visibility</span>
            <select
              value={form.isPractice ? 'public' : 'contest'}
              onChange={(event) => updateField('isPractice', event.target.value === 'public')}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40 text-slate-100"
            >
              <option value="public">Public (Practice Arena)</option>
              <option value="contest">Reserve for Contests</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-200 md:col-span-3">
            <span className="text-slate-400">Problem Description</span>
            <textarea
              rows="8"
              placeholder="Write plain text or markdown. You can also upload supporting images."
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Upload Image</span>
            <input
              type="text"
              placeholder="Image URL"
              value={form.imageUrl}
              onChange={(event) => updateField('imageUrl', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span className="text-slate-400">Constraint</span>
            <input
              type="text"
              placeholder="e.g. 1 <= n <= 2 * 10^5"
              value={form.constraints}
              onChange={(event) => updateField('constraints', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
            <span className="text-slate-400">Official Solution</span>
            <textarea
              rows="6"
              placeholder="Paste official code solution or text description here..."
              value={form.officialSolution}
              onChange={(event) => updateField('officialSolution', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40 font-mono text-slate-100"
            />
          </label>
        </div>

        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Visible to user</p>
              <h2 className="mt-2 text-lg font-semibold text-white">Sample Test Cases</h2>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ['Input', 'Example input 1'],
              ['Expected Output', 'Example output 1'],
              ['Input', 'Example input 2'],
              ['Expected Output', 'Example output 2']
            ].map(([label, placeholder]) => (
              <label key={`${label}-${placeholder}`} className="space-y-2 text-sm text-slate-200">
                <span className="text-slate-400">{label}</span>
                <textarea
                  rows="4"
                  placeholder={placeholder}
                  value={
                    label === 'Input'
                      ? placeholder.includes('1')
                        ? form.visibleInput1
                        : form.visibleInput2
                      : placeholder.includes('1')
                        ? form.visibleOutput1
                        : form.visibleOutput2
                  }
                  onChange={(event) => {
                    const fieldMap = {
                      'Example input 1': 'visibleInput1',
                      'Example output 1': 'visibleOutput1',
                      'Example input 2': 'visibleInput2',
                      'Example output 2': 'visibleOutput2',
                      'Judge input 1': 'hiddenInput1',
                      'Judge output 1': 'hiddenOutput1',
                      'Judge input 2': 'hiddenInput2',
                      'Judge output 2': 'hiddenOutput2'
                    };
                    updateField(fieldMap[placeholder], event.target.value);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">Hidden from user</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Judge Test Cases</h2>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ['Hidden Input', 'Judge input 1'],
              ['Hidden Expected Output', 'Judge output 1'],
              ['Hidden Input', 'Judge input 2'],
              ['Hidden Expected Output', 'Judge output 2']
            ].map(([label, placeholder]) => (
              <label key={`${label}-${placeholder}`} className="space-y-2 text-sm text-slate-200">
                <span className="text-slate-400">{label}</span>
                <textarea
                  rows="4"
                  placeholder={placeholder}
                  value={
                    placeholder.includes('1')
                      ? (label.includes('Input') ? form.hiddenInput1 : form.hiddenOutput1)
                      : (label.includes('Input') ? form.hiddenInput2 : form.hiddenOutput2)
                  }
                  onChange={(event) => {
                    const fieldMap = {
                      'Judge input 1': 'hiddenInput1',
                      'Judge output 1': 'hiddenOutput1',
                      'Judge input 2': 'hiddenInput2',
                      'Judge output 2': 'hiddenOutput2'
                    };
                    updateField(fieldMap[placeholder], event.target.value);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40"
                />
              </label>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Problem'}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}