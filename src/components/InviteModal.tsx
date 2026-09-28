import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PUBLIC_URL } from '../config';

export function inviteUrl(code: string) {
  return `${PUBLIC_URL ?? window.location.origin}/r/${code}`;
}

export function InviteModal({ code, onClose }: { code: string; onClose: () => void }) {
  const url = inviteUrl(code);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked (insecure origin) — the field is selectable
    }
  }

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal panel" role="dialog" aria-modal="true" aria-label="Invite people" onClick={(e) => e.stopPropagation()}>
        <div className="eyebrow">Table {code}</div>
        <h3>Invite people</h3>
        <p className="muted" style={{ margin: 0 }}>
          Scan the code or share the link. No account needed.
        </p>
        <div className="qr-frame">
          <QRCodeSVG value={url} size={176} bgColor="#f4efe4" fgColor="#1d1b17" />
        </div>
        <div className="link-row">
          <input className="input" readOnly value={url} onFocus={(e) => e.currentTarget.select()} aria-label="Invite link" />
          <button className="btn btn-primary" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}
