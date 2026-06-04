import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function requestJson(path, options = {}) {
  const response = await fetch(buildUrl(path), {
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

function createBlankTestcase() {
  return { input_data: '', expected_output: '' };
}

function Admin() {
  const [problems, setProblems] = useState([]);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    testcases: [createBlankTestcase()]
  });
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [savingProblem, setSavingProblem] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProblems() {
      try {
        setLoadingProblems(true);
        const data = await requestJson('/api/problems');
        if (!cancelled) {
          setProblems(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingProblems(false);
        }
      }
    }

    loadProblems();

    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setEditingProblemId(null);
    setForm({
      title: '',
      description: '',
      testcases: [createBlankTestcase()]
    });
  }

  async function refreshProblems() {
    const data = await requestJson('/api/problems');
    setProblems(Array.isArray(data) ? data : []);
  }

  function updateField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value
    }));
  }

  function updateTestcase(index, field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      testcases: currentForm.testcases.map((testcase, testcaseIndex) => (
        testcaseIndex === index ? { ...testcase, [field]: value } : testcase
      ))
    }));
  }

  function addTestcase() {
    setForm((currentForm) => {
      if (currentForm.testcases.length >= 10) {
        return currentForm;
      }

      return {
        ...currentForm,
        testcases: [...currentForm.testcases, createBlankTestcase()]
      };
    });
  }

  function removeTestcase(index) {
    setForm((currentForm) => {
      if (currentForm.testcases.length === 1) {
        return currentForm;
      }

      return {
        ...currentForm,
        testcases: currentForm.testcases.filter((_, testcaseIndex) => testcaseIndex !== index)
      };
    });
  }

  async function handleEditProblem(problemId) {
    try {
      setLoadingProblem(true);
      setError('');
      setSuccess('');
      const data = await requestJson(`/api/problems/${problemId}`);
      setEditingProblemId(problemId);
      setForm({
        title: data.title || '',
        description: data.description || '',
        testcases: Array.isArray(data.testcases) && data.testcases.length > 0
          ? data.testcases.map((testcase) => ({
              input_data: testcase.input_data || '',
              expected_output: testcase.expected_output || ''
            }))
          : [createBlankTestcase()]
      });
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoadingProblem(false);
    }
  }

  async function handleDeleteProblem(problemId) {
    const confirmation = window.confirm('Delete this problem and all of its testcases?');
    if (!confirmation) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await requestJson(`/api/problems/${problemId}`, { method: 'DELETE' });
      await refreshProblems();

      if (editingProblemId === problemId) {
        resetForm();
      }

      setSuccess('Problem deleted successfully.');
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSavingProblem(true);
      setError('');
      setSuccess('');

      const payload = {
        title: form.title,
        description: form.description,
        testcases: form.testcases.slice(0, 10)
      };

      if (editingProblemId) {
        await requestJson(`/api/problems/${editingProblemId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setSuccess('Problem updated successfully.');
      } else {
        await requestJson('/api/problems', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setSuccess('Problem created successfully.');
      }

      await refreshProblems();
      resetForm();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSavingProblem(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="glass-panel rounded-3xl p-5 shadow-glow">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Admin Tools</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Problem Management</h2>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              New Problem
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {loadingProblems ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : problems.length > 0 ? (
              problems.map((problem) => (
                <div key={problem.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Problem #{problem.id}</p>
                      <h3 className="mt-1 text-base font-semibold text-white">{problem.title}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditProblem(problem.id)}
                        className="rounded-full bg-cyan-300 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProblem(problem.id)}
                        className="rounded-full bg-rose-300 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-rose-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 max-h-20 overflow-hidden text-sm text-slate-300">{problem.description}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-300">
                No problems have been created yet.
              </div>
            )}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-5 shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
                {editingProblemId ? `Editing Problem #${editingProblemId}` : 'Create Problem'}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                {editingProblemId ? 'Update the selected problem' : 'Add a new coding challenge'}
              </h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              Loading: {loadingProblem ? 'Yes' : 'No'}
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              {success}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-200">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
                placeholder="Two Sum"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">Description</label>
              <textarea
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                rows={7}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
                placeholder="Describe the problem statement here..."
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Testcases</h3>
                <p className="text-sm text-slate-400">Add up to 10 test cases. Each one contains input and expected output.</p>
              </div>
              <button
                type="button"
                onClick={addTestcase}
                disabled={form.testcases.length >= 10}
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Testcase
              </button>
            </div>

            <div className="space-y-4">
              {form.testcases.map((testcase, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-white">Testcase #{index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeTestcase(index)}
                      className="rounded-full bg-rose-300 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-rose-200"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-slate-300">Input</label>
                      <textarea
                        value={testcase.input_data}
                        onChange={(event) => updateTestcase(index, 'input_data', event.target.value)}
                        rows={6}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
                        placeholder="1 2\n"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-300">Expected Output</label>
                      <textarea
                        value={testcase.expected_output}
                        onChange={(event) => updateTestcase(index, 'expected_output', event.target.value)}
                        rows={6}
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/40"
                        placeholder="3\n"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={savingProblem}
                className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProblem ? 'Saving...' : editingProblemId ? 'Update Problem' : 'Create Problem'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Clear Form
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Admin;
