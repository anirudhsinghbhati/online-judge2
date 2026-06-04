import { useEffect, useMemo, useState } from 'react';

import MonacoEditor from '../components/MonacoEditor';
import ResultPanel from '../components/ResultPanel';
import { DEFAULT_LANGUAGE_KEY, LANGUAGE_OPTIONS, getLanguageOption } from '../constants';

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

function User() {
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedLanguageKey, setSelectedLanguageKey] = useState(DEFAULT_LANGUAGE_KEY);
  const [code, setCode] = useState(getLanguageOption(DEFAULT_LANGUAGE_KEY).starterCode);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [error, setError] = useState('');
  const [activeMainTab, setActiveMainTab] = useState('description');
  const [activeBottomTab, setActiveBottomTab] = useState('result');
  const [activeTestcaseIndex, setActiveTestcaseIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProblems() {
      try {
        setLoadingProblems(true);
        setError('');
        const data = await requestJson('/api/problems');

        if (!cancelled) {
          setProblems(Array.isArray(data) ? data : []);
          setSelectedProblemId((currentId) => currentId || data?.[0]?.id || null);
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

  useEffect(() => {
    if (!selectedProblemId) {
      setSelectedProblem(null);
      return;
    }

    let cancelled = false;

    async function loadProblem() {
      try {
        setLoadingProblem(true);
        setError('');
        const data = await requestJson(`/api/problems/${selectedProblemId}`);

        if (!cancelled) {
          setSelectedProblem(data);
          setCode(getLanguageOption(selectedLanguageKey).starterCode);
          setRunResult(null);
          setSubmitResult(null);
          setActiveTestcaseIndex(0);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingProblem(false);
        }
      }
    }

    loadProblem();

    return () => {
      cancelled = true;
    };
  }, [selectedProblemId]);

  const activeResult = useMemo(() => submitResult || runResult, [runResult, submitResult]);
  const testcases = Array.isArray(selectedProblem?.testcases) ? selectedProblem.testcases : [];
  const activeTestcase = testcases[activeTestcaseIndex] || testcases[0] || null;
  const selectedLanguage = getLanguageOption(selectedLanguageKey);

  function selectProblem(problemId) {
    setSelectedProblemId(problemId);
    setError('');
    setRunResult(null);
    setSubmitResult(null);
    setActiveTestcaseIndex(0);
    setActiveBottomTab('result');
  }

  function handleLanguageChange(nextLanguageKey) {
    const nextLanguage = getLanguageOption(nextLanguageKey);
    setSelectedLanguageKey(nextLanguage.key);
    setCode(nextLanguage.starterCode);
    setRunResult(null);
    setSubmitResult(null);
    setError('');
  }

  function renderTabButton(label, isActive, onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`rounded-full px-4 py-2 text-sm transition ${
          isActive
            ? 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/30'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`}
      >
        {label}
      </button>
    );
  }

  async function handleRunCode() {
    if (!code.trim()) {
      setError('Please enter code before running it.');
      return;
    }

    try {
      setRunningCode(true);
      setError('');
      setSubmitResult(null);
      const data = await requestJson('/api/run', {
        method: 'POST',
        body: JSON.stringify({
          code,
          languageId: selectedLanguage.judge0LanguageId,
          compilerOptions: selectedLanguage.compilerOptions
        })
      });

      setRunResult(data);
    } catch (runError) {
      setRunResult(null);
      setError(runError.message);
    } finally {
      setRunningCode(false);
    }
  }

  async function handleSubmitCode() {
    if (!selectedProblemId) {
      setError('Select a problem before submitting.');
      return;
    }

    if (!code.trim()) {
      setError('Please enter code before submitting it.');
      return;
    }

    try {
      setSubmittingCode(true);
      setError('');
      setRunResult(null);
      const data = await requestJson('/api/submit', {
        method: 'POST',
        body: JSON.stringify({
          code,
          problemId: selectedProblemId,
          languageId: selectedLanguage.judge0LanguageId,
          compilerOptions: selectedLanguage.compilerOptions
        })
      });

      setSubmitResult(data);
    } catch (submitError) {
      setSubmitResult(null);
      setError(submitError.message);
    } finally {
      setSubmittingCode(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1680px] px-3 py-4 sm:px-4 lg:px-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <span className="text-slate-500">Problem</span>
            <select
              value={selectedProblemId || ''}
              onChange={(event) => selectProblem(Number(event.target.value))}
              className="bg-transparent text-slate-100 outline-none"
            >
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id} className="bg-slate-950 text-slate-100">
                  #{problem.id} {problem.title}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.25fr)]">
        <aside className="glass-panel flex min-h-[calc(100vh-160px)] flex-col overflow-hidden rounded-[20px] shadow-glow">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {renderTabButton('Description', activeMainTab === 'description', () => setActiveMainTab('description'))}
              {renderTabButton('Editorial', activeMainTab === 'editorial', () => setActiveMainTab('editorial'))}
              {renderTabButton('Solutions', activeMainTab === 'solutions', () => setActiveMainTab('solutions'))}
              {renderTabButton('Submissions', activeMainTab === 'submissions', () => setActiveMainTab('submissions'))}
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {loadingProblems ? 'Loading problems...' : `${problems.length} problems`}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-5 py-4 scrollbar-thin">
            {loadingProblem ? (
              <div className="space-y-4">
                <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-11/12 animate-pulse rounded bg-white/5" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
              </div>
            ) : activeMainTab === 'description' && selectedProblem ? (
              <div className="space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Description</p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">{selectedProblem.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-300/15 px-3 py-1 text-amber-200">Medium</span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">Problem #{selectedProblem.id}</span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300">
                      {testcases.length} testcase{testcases.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{selectedProblem.description}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                  <h4 className="text-sm font-semibold text-white">Sample Testcases</h4>
                  <div className="mt-4 space-y-3">
                    {testcases.length > 0 ? (
                      testcases.map((testcase, index) => {
                        const isSelected = index === activeTestcaseIndex;

                        return (
                          <button
                            key={`${index}-${testcase.input_data}`}
                            type="button"
                            onClick={() => setActiveTestcaseIndex(index)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              isSelected
                                ? 'border-cyan-400/40 bg-cyan-400/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-white">Testcase #{index + 1}</span>
                              <span className="text-xs text-slate-400">Click to preview</span>
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Input</p>
                                <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/80 p-3 text-sm text-slate-200 scrollbar-thin">
                                  {testcase.input_data || '-'}
                                </pre>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Expected</p>
                                <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/80 p-3 text-sm text-slate-200 scrollbar-thin">
                                  {testcase.expected_output || '-'}
                                </pre>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-slate-300">
                        No testcases found for this problem.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-300">
                {activeMainTab === 'description'
                  ? 'Select a problem to start coding.'
                  : 'This section can host editorial, solutions, and submission history later.'}
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-160px)] flex-col gap-4">
          <section className="glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] shadow-glow">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                  <span className="text-slate-500">Language</span>
                  <select
                    value={selectedLanguageKey}
                    onChange={(event) => handleLanguageChange(event.target.value)}
                    className="bg-transparent text-slate-100 outline-none"
                  >
                    {LANGUAGE_OPTIONS.map((language) => (
                      <option key={language.key} value={language.key} className="bg-slate-950 text-slate-100">
                        {language.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={runningCode || submittingCode}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {runningCode ? 'Running...' : 'Run'}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCode}
                  disabled={runningCode || submittingCode || !selectedProblemId}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingCode ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 p-4">
              <MonacoEditor
                value={code}
                onChange={setCode}
                language={selectedLanguage.monacoLanguage}
                height="100%"
                className="h-full"
              />
            </div>
          </section>

          <section className="glass-panel min-h-[280px] overflow-hidden rounded-[20px] shadow-glow">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              {renderTabButton('Testcase', activeBottomTab === 'testcase', () => setActiveBottomTab('testcase'))}
              {renderTabButton('Test Result', activeBottomTab === 'result', () => setActiveBottomTab('result'))}
            </div>

            <div className="p-4">
              {activeBottomTab === 'testcase' ? (
                activeTestcase ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Input</p>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white/5 p-4 text-sm text-slate-100 scrollbar-thin">
                        {activeTestcase.input_data || '-'}
                      </pre>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Expected Output</p>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl bg-white/5 p-4 text-sm text-slate-100 scrollbar-thin">
                        {activeTestcase.expected_output || '-'}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-slate-300">
                    Pick a problem testcase to preview it here.
                  </div>
                )
              ) : (
                <div>
                  <ResultPanel result={activeResult} loading={runningCode || submittingCode} />
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default User;
