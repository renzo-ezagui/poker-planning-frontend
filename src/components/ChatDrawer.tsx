import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../socket/useRoom';
import { colorFor } from '../lib/avatar';
import { CloseIcon } from './Icons';

export function ChatDrawer({
  messages,
  muted,
  onSend,
  onClose,
}: {
  messages: ChatMessage[];
  muted: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  }

  return (
    <aside className="chat panel" aria-label="Table chat">
      <div className="chat-head">
        <strong className="display" style={{ fontSize: 17 }}>
          Table talk
        </strong>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close chat">
          <CloseIcon />
        </button>
      </div>
      <div className="chat-log" ref={logRef}>
        {messages.length === 0 && <div className="chat-empty">Messages disappear when the table closes.</div>}
        {messages.map((m) => (
          <div className="chat-msg" key={`${m.ts}-${m.participantId ?? m.name}`}>
            <b style={{ color: colorFor(m.participantId ?? m.name) }}>{m.name}</b>
            {m.text}
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <label htmlFor="chat-input" className="sr-only">
          Chat message
        </label>
        <input
          id="chat-input"
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={500}
          placeholder={muted ? 'The host muted you' : 'Say something…'}
          disabled={muted}
          autoComplete="off"
        />
        <button className="btn btn-primary" type="submit" disabled={muted || !draft.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
}
