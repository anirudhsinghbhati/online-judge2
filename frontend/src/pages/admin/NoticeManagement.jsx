import { useEffect, useState } from 'react';
import AdminShell from '../../components/AdminShell';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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

export default function NoticeManagement() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function loadNotices() {
    try {
      setLoading(true);
      const data = await requestJson('/api/admin/notices');
      setNotices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotices();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Both title and content are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMsg('');
      await requestJson('/api/admin/notices', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });
      setSuccessMsg('Notice published successfully!');
      setTitle('');
      setContent('');
      loadNotices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this notice?')) {
      return;
    }

    try {
      setError('');
      setSuccessMsg('');
      await requestJson(`/api/admin/notices/${id}`, {
        method: 'DELETE'
      });
      setSuccessMsg('Notice deleted successfully.');
      loadNotices();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AdminShell breadcrumb={[{ label: 'Admin Dashboard', to: '/admin' }, { label: 'Notice Board' }]}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        
        {/* PUBLISH NOTICE FORM */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-glow">
          <h2 className="text-xl font-semibold text-white mb-4">Publish New Announcement</h2>
          
          {error && (
            <div className="mb-4 rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="notice-title" className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">Notice Title</label>
              <input
                id="notice-title"
                type="text"
                placeholder="e.g. Upcoming Weekly Contest Scheduled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-400/50 focus:bg-slate-950"
              />
            </div>

            <div>
              <label htmlFor="notice-content" className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">Notice Content</label>
              <textarea
                id="notice-content"
                rows={6}
                placeholder="Write description or notice details here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-cyan-400/50 focus:bg-slate-950 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-cyan-400 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition duration-200 disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        </section>

        {/* RECENT NOTICES LIST */}
        <section className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 shadow-glow">
          <h2 className="text-xl font-semibold text-white mb-4">Published Announcements</h2>

          {loading ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 relative group hover:border-white/10 transition"
                >
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-semibold text-white text-sm">{notice.title}</h3>
                    <button
                      type="button"
                      onClick={() => handleDelete(notice.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 transition font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                  <div className="mt-3 text-[10px] text-slate-500 font-mono">
                    Published: {new Date(notice.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-slate-400 text-sm">
              No notices published yet.
            </div>
          )}
        </section>

      </div>
    </AdminShell>
  );
}
