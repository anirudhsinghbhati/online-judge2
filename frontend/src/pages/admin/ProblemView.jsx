import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AdminShell from '../../components/AdminShell';
import { requestJson } from '../../lib/adminApi';

export default function ProblemView() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Form states
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    topic: 'General',
    constraints: '',
    imageUrl: '',
    testcases: []
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProblem() {
      try {
        setLoading(true);
        const data = await requestJson(`/api/admin/problems/${problemId}`);
        if (!cancelled) {
          setProblem(data);
          setForm({
            title: data.title || '',
            description: data.description || '',
            difficulty: data.difficulty || 'Easy',
            topic: data.topic || 'General',
            constraints: data.constraints || '',
            imageUrl: data.image_url || '',
            testcases: Array.isArray(data.testcases)
              ? data.testcases.map((tc) => ({
                  input_data: tc.input_data || '',
                  expected_output: tc.expected_output || '',
                  visibility: tc.visibility || 'visible',
                  sort_order: tc.sort_order || 0
                }))
              : []
          });
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

    loadProblem();

    return () => {
      cancelled = true;
    };
  }, [problemId]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTestcase(index, field, value) {
    setForm((current) => {
      const nextTestcases = [...current.testcases];
      nextTestcases[index] = {
        ...nextTestcases[index],
        [field]: value
      };
      return { ...current, testcases: nextTestcases };
    });
  }

  function addTestcase() {
    if (form.testcases.length >= 10) return;
    setForm((current) => ({
      ...current,
      testcases: [
        ...current.testcases,
        {
          input_data: '',
          expected_output: '',
          visibility: 'visible',
          sort_order: current.testcases.length
        }
      ]
    }));
  }

  function removeTestcase(index) {
    if (form.testcases.length <= 1) return;
    setForm((current) => ({
      ...current,
      testcases: current.testcases.filter((_, i) => i !== index)
    }));
  }

  async function handleSave(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');

      const updated = await requestJson(`/api/admin/problems/${problemId}`, {
        method: 'PUT',
        body: JSON.stringify(form)
      });

      setProblem(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this problem? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      await requestJson(`/api/admin/problems/${problemId}`, {
        method: 'DELETE'
      });
      navigate('/admin/problem-management');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Problem Management', to: '/admin/problem-management' }, { label: 'View Problem' }]}>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-slate-300">
          Loading problem details...
        </div>
      </AdminShell>
    );
  }

  if (error && !problem) {
    return (
      <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Problem Management', to: '/admin/problem-management' }, { label: 'View Problem' }]}>
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      </AdminShell>
    );
  }

  const sampleTestcases = form.testcases.filter((tc) => tc.visibility === 'visible');
  const judgeTestcases = form.testcases.filter((tc) => tc.visibility === 'hidden');

  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Problem Management', to: '/admin/problem-management' }, { label: isEditing ? 'Edit Problem' : 'View Problem' }]}>
      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {!isEditing ? (
        // VIEW DETAILS LAYOUT
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5 sm:p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">{problem.topic || 'General'}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  problem.difficulty === 'Hard'
                    ? 'bg-rose-400/15 text-rose-200 ring-1 ring-rose-300/30'
                    : problem.difficulty === 'Medium'
                      ? 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30'
                      : 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30'
                }`}>
                  {problem.difficulty}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white">{problem.title}</h1>
            </div>

            {problem.image_url ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 max-h-60 flex items-center justify-center bg-black/20">
                <img src={problem.image_url} alt={problem.title} className="object-contain max-h-60 w-full" />
              </div>
            ) : null}

            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Description</h2>
              <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                {problem.description}
              </div>
            </div>

            {problem.constraints ? (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Constraints</h2>
                <div className="inline-block rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-slate-300 font-mono">
                  {problem.constraints}
                </div>
              </div>
            ) : null}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Edit Problem
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-6 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
              >
                Delete Problem
              </button>
            </div>
          </section>

          <section className="space-y-4">
            {/* SAMPLE TESTCASES */}
            <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70 font-semibold">Sample Test Cases</p>
              <div className="mt-4 space-y-4">
                {sampleTestcases.length > 0 ? (
                  sampleTestcases.map((tc, index) => (
                    <div key={index} className="space-y-2 border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                      <p className="text-xs font-semibold text-slate-400">Sample #{index + 1}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-slate-500">Input</p>
                          <pre className="mt-1 rounded-lg bg-black/30 p-2 text-xs font-mono text-slate-300 whitespace-pre-wrap">{tc.input_data || '(empty)'}</pre>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-slate-500">Expected Output</p>
                          <pre className="mt-1 rounded-lg bg-black/30 p-2 text-xs font-mono text-slate-300 whitespace-pre-wrap">{tc.expected_output || '(empty)'}</pre>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No public sample test cases configured.</p>
                )}
              </div>
            </div>

            {/* HIDDEN JUDGE TESTCASES */}
            <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70 font-semibold">Judge Test Cases (Hidden)</p>
              <div className="mt-4 space-y-4">
                {judgeTestcases.length > 0 ? (
                  judgeTestcases.map((tc, index) => (
                    <div key={index} className="space-y-2 border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                      <p className="text-xs font-semibold text-slate-400">Judge Case #{index + 1}</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-slate-500">Input</p>
                          <pre className="mt-1 rounded-lg bg-black/30 p-2 text-xs font-mono text-slate-300 whitespace-pre-wrap">{tc.input_data || '(empty)'}</pre>
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-slate-500">Expected Output</p>
                          <pre className="mt-1 rounded-lg bg-black/30 p-2 text-xs font-mono text-slate-300 whitespace-pre-wrap">{tc.expected_output || '(empty)'}</pre>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No hidden judge test cases configured.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : (
        // EDIT MODE LAYOUT
        <form onSubmit={handleSave} className="space-y-6 rounded-[24px] border border-white/10 bg-slate-950/55 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span className="text-slate-400">Title</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40 text-slate-100"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span className="text-slate-400">Difficulty</span>
              <select
                value={form.difficulty}
                onChange={(event) => updateField('difficulty', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40 text-slate-100"
              >
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
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300/40 text-slate-100"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span className="text-slate-400">Problem Description</span>
              <textarea
                rows="8"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40 text-slate-100"
                required
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span className="text-slate-400">Image URL</span>
              <input
                type="text"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(event) => updateField('imageUrl', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40 text-slate-100"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span className="text-slate-400">Constraints</span>
              <input
                type="text"
                placeholder="e.g. 1 <= n <= 2 * 10^5"
                value={form.constraints}
                onChange={(event) => updateField('constraints', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/40 text-slate-100"
              />
            </label>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Test Cases</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Configure sample test cases (visible) or judge execution cases (hidden). Maximum 10.
                </p>
              </div>
              <button
                type="button"
                onClick={addTestcase}
                disabled={form.testcases.length >= 10}
                className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-300/20 disabled:opacity-50"
              >
                Add Test Case
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {form.testcases.map((tc, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Test Case #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        value={tc.visibility}
                        onChange={(e) => updateTestcase(index, 'visibility', e.target.value)}
                        className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200 outline-none"
                      >
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                      </select>
                      {form.testcases.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeTestcase(index)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="space-y-1 text-xs text-slate-400">
                      <span>Input</span>
                      <textarea
                        rows="2"
                        value={tc.input_data}
                        onChange={(e) => updateTestcase(index, 'input_data', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 font-mono text-xs text-slate-300 outline-none"
                      />
                    </label>
                    <label className="space-y-1 text-xs text-slate-400">
                      <span>Expected Output</span>
                      <textarea
                        rows="2"
                        value={tc.expected_output}
                        onChange={(e) => updateTestcase(index, 'expected_output', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 p-2 font-mono text-xs text-slate-300 outline-none"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError('');
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}
