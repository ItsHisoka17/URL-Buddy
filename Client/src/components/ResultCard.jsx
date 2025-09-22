import React, { useEffect, useState } from "react";

function qrDataUrl(text) {
  return text ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}` : "";
}

function formatTimeLeft(ms) {
  if (ms <= 0) return "Expired";
  const sec = Math.floor(ms / 1000);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
}

export default function ResultCard({ id, path, redirect, expires_at, onCopy }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [shortUrl, setShortUrl] = useState("");

  useEffect(() => {
    if (path) setShortUrl(`${window.location.origin}/${path}`);
  }, [path]);

  useEffect(() => {
    if (!expires_at) return;

    const expiry = new Date(expires_at).getTime();
    if (isNaN(expiry)) return;

    function update() {
      const diff = expiry - Date.now();
      setTimeLeft(formatTimeLeft(diff));
    }
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [expires_at]);

  async function copy() {
    if (!shortUrl) return;
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
    if (navigator.share && shortUrl) {
      navigator.share({ title: "Short link", text: redirect, url: shortUrl }).catch(() => {});
    } else {
      copy();
    }
  }

  if (!shortUrl) return null;

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
      </div>
    </div>
  );
}
