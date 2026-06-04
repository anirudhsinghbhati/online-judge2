function formatJsonValue(value) {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'string' && value.length === 0) {
    return '-';
  }

  return value;
}

function ResultPanel({ result, loading = false }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
        Running code...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-slate-300">
        Run or submit code to see results here.
      </div>
    );
  }

  const verdict = result.verdict;

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-glow">
      {verdict ? (
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              verdict === 'Accepted'
                ? 'bg-emerald-300 text-slate-950'
                : verdict === 'Compilation Error'
                  ? 'bg-rose-300 text-slate-950'
                  : 'bg-amber-300 text-slate-950'
            }`}
          >
            {verdict}
          </span>
          {typeof result.passedCount === 'number' ? (
            <span className="text-sm text-slate-300">
              Passed {result.passedCount} / {result.totalCount}
            </span>
          ) : null}
          {result.failedTestcaseNumber ? (
            <span className="text-sm text-slate-300">Failed testcase #{result.failedTestcaseNumber}</span>
          ) : null}
        </div>
      ) : null}

      {result.compilationErrors ? (
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Compilation Errors</h3>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/80 p-4 text-sm text-rose-200 scrollbar-thin">
            {result.compilationErrors}
          </pre>
        </div>
      ) : null}

      {!verdict || result.stdout !== undefined ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Standard Output</h3>
            <pre className="mt-2 min-h-28 overflow-x-auto rounded-xl bg-slate-950/80 p-4 text-sm text-slate-100 scrollbar-thin">
              {formatJsonValue(result.stdout)}
            </pre>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Standard Error</h3>
            <pre className="mt-2 min-h-28 overflow-x-auto rounded-xl bg-slate-950/80 p-4 text-sm text-amber-100 scrollbar-thin">
              {formatJsonValue(result.stderr)}
            </pre>
          </div>
        </div>
      ) : null}

      {Array.isArray(result.details) && result.details.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Testcase Details</h3>
          <div className="mt-2 space-y-3">
            {result.details.map((detail) => (
              <div key={detail.testcaseNumber} className="rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-white">Testcase #{detail.testcaseNumber}</span>
                  <span className={detail.passed ? 'text-emerald-300' : 'text-rose-300'}>
                    {detail.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Input</p>
                    <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-slate-200">{formatJsonValue(detail.input)}</pre>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Expected</p>
                    <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-slate-200">{formatJsonValue(detail.expectedOutput)}</pre>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Actual</p>
                    <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-slate-200">{formatJsonValue(detail.actualOutput)}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ResultPanel;
