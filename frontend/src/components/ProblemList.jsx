function ProblemList({ problems, selectedProblemId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (!problems.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-300">
        No problems are available yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {problems.map((problem) => {
        const isActive = Number(problem.id) === Number(selectedProblemId);

        return (
          <button
            key={problem.id}
            type="button"
            onClick={() => onSelect(problem.id)}
            className={`w-full rounded-2xl border p-4 text-left transition ${
              isActive
                ? 'border-cyan-400/40 bg-cyan-400/10 shadow-glow'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Problem #{problem.id}</p>
                <h3 className="mt-1 text-base font-semibold text-white">{problem.title}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs ${isActive ? 'bg-cyan-300 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
                Select
              </span>
            </div>
            <p className="mt-3 max-h-12 overflow-hidden text-sm text-slate-300">{problem.description}</p>
          </button>
        );
      })}
    </div>
  );
}

export default ProblemList;
