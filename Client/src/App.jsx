import React, { useState } from "react";
import { createGateway } from "./api";
import { useToast } from "./components/ToastContext";
import ResultCard from "./components/ResultCard";

function isValidUrl(url) {
  try { new URL(url); return true; } catch { return false; }
}

export default function App() {
  const [redirect, setRedirect] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [gateway, setGateway] = useState(null);
  const toast = useToast();

  async function handleCreate(e) {
    e && e.preventDefault();
    toast.remove && null;

    if (!isValidUrl(redirect)) {
      toast.push("Please enter a valid redirect URL (include https://)", { type: "error" });
      return;
    }

    if (customPath && !/^[A-Za-z0-9_-]{4,40}$/.test(customPath)) {
      toast.push("Custom path: 4–40 chars, letters, numbers, _ or - only", { type: "error" });
      return;
    }

    setLoading(true);
    setGateway(null);

    try {
      if (customPath) {
        const origin = window.location.origin;
        const checkRes = await fetch(`${origin}/${customPath}`, { method: "GET", cache: "no-store" });
        if (checkRes.status !== 404) {
          toast.push("This custom path already exists. Pick another.", { type: "error" });
          setLoading(false);
          return;
        }
      }

      const payload = customPath ? { redirect, path: customPath } : { redirect };
      const data = await createGateway(payload);
      setGateway(data);
      toast.push("Short link created!", { type: "success" });
      try { await navigator.clipboard.writeText(`${window.location.origin}/${data.path}`); toast.push("Copied to clipboard", { type: "info", duration: 2500 }); } catch {}
      setRedirect("");
      setCustomPath("");
    } catch (err) {
      toast.push(err.message || "Failed to create short link", { type: "error", duration: 6000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand">
          <svg className="logo" viewBox="0 0 24 24" aria-hidden focusable="false">
            <path fill="currentColor" d="M10 3H5a2 2 0 0 0-2 2v5h2V5h5V3m4 0v2h5v5h2V5a2 2 0 0 0-2-2h-5M3 14v5a2 2 0 0 0 2 2h5v-2H5v-5H3m18 0h-2v5h-5v2h5a2 2 0 0 0 2-2v-5z" />
          </svg>
          <div>
            <div className="brand-title">URL Buddy</div>
            <div className="brand-sub">Short links with style</div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="card">
          <div className="card-left">
            <h1 className="headline">Create a short link</h1>
            <p className="muted">Paste your destination and optionally choose a custom path. Paths are checked live against the origin for collisions.</p>

            <form className="form" onSubmit={handleCreate}>
              <label className="label">
                Destination URL
                <input
                  name="redirect"
                  value={redirect}
                  onChange={(e) => setRedirect(e.target.value)}
                  className="input"
                  placeholder="https://example.com/very/long/path"
                  type="url"
                  required
                />
              </label>

              <label className="label">
                Custom path (optional)
                <input
                  name="path"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="input"
                  placeholder="my-special-link"
                  type="text"
                  aria-describedby="pathHelp"
                />
                <small id="pathHelp" className="muted">4–40 chars: letters, numbers, _, -</small>
              </label>

              <div className="actions">
                <button className="btn primary" type="submit" disabled={loading}>
                  {loading ? "Creating…" : "Create Short Link"}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => { setRedirect(""); setCustomPath(""); setGateway(null); }}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div className="card-right">
            {gateway ? (
              <ResultCard {...gateway} onCopy={() => toast.push("Copied to clipboard", { type: "success" })} />
            ) : (
              <div className="placeholder">
                <svg width="120" height="120" viewBox="0 0 24 24" aria-hidden focusable="false">
                  <path fill="currentColor" d="M10 3H5a2 2 0 0 0-2 2v5h2V5h5V3m4 0v2h5v5h2V5a2 2 0 0 0-2-2h-5M3 14v5a2 2 0 0 0 2 2h5v-2H5v-5H3m18 0h-2v5h-5v2h5a2 2 0 0 0 2-2v-5z"/>
                </svg>
                <p className="muted">Paste a link and optionally a custom path. If the path is available, you'll get a short link that expires automatically.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">Links expire automatically after 30 minutes | copyright(c) Jxdn </footer>
    </div>
  );
}
