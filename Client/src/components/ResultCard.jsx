import React, { useEffect, useState } from "react";

function qrDataUrl(text) {
  return `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(text)}&choe=UTF-8`;
}

function formatTimeLeft(ms) {
  if (ms <= 0) return "Expired";
  const sec = Math.floor(ms / 1000);
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  if (hrs > 0) return `${hrs}h ${String(mins).padStart(2,"0")}m ${String(secs).padStart(2,"0")}s`;
  return `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

export default function ResultCard({ id, path, redirect, expires_at, onCopy }) {
  const [timeLeft, setTimeLeft] = useState("");
  const shortUrl = `${window.location.origin}/${path}`;

  useEffect(() => {
    const expiry = new Date(expires_at).getTime();
    function update() {
      const diff = expiry - Date.now();
      setTimeLeft(formatTimeLeft(diff));
    }
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [expires_at]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      onCopy && onCopy();
    } catch {
      const el = document.createElement("textarea");
      el.value = shortUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
      onCopy && onCopy();
    }
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: "Short link", text: redirect, url: shortUrl }).catch(() => {});
    } else {
      copy();
    }
  }

  return (
    <div className="result-card" aria-live="polite">
      <div className="result-top">
        <div>
          <div className="label-small">Short link</div>
          <a className="short-link" href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
        </div>
        <div className="actions-vertical">
          <button className="icon-btn" onClick={copy} aria-label="Copy short link">Copy</button>
          <button className="icon-btn" onClick={share} aria-label="Share link">Share</button>
        </div>
      </div>

      <div className="result-middle">
        <div>
          <div className="label-small">Redirects to</div>
          <div className="muted small">{redirect}</div>
        </div>
        <div>
          <div className="label-small">Expires in</div>
          <div className="expiry">{timeLeft}</div>
        </div>
      </div>

      <div className="result-bottom">
        <img className="qr" src={qrDataUrl(shortUrl)} alt={`QR code for ${shortUrl}`} />
        <div className="meta">
          <div className="meta-row"><strong>ID:</strong> <span>{id}</span></div>
          <div className="meta-row"><strong>Path:</strong> <span>{path}</span></div>
          <div className="meta-row"><strong>Expires at:</strong> <span>{new Date(expires_at).toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
}
