import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

export function ChatPanel({ socket, name, roomCode }: { socket: Socket | null; name: string; roomCode: string }) {
  const [messages, setMessages] = useState<{ name: string; text: string; ts: number }[]>([]);
  const [draft, setDraft] = useState('');

  useEffect((): void | (() => void) => {
    if (socket) {
      const handler = (msg: any) => setMessages((prev) => [...prev, msg]);
      socket.on('chat:message', handler);
      return () => socket.off('chat:message', handler);
    }
  }, [socket]);

  function send() {
    if (!socket || draft.trim().length === 0) return;
    socket.emit('chat:message', { name, text: draft, roomCode });
    setDraft('');
  }

  return (
    <div style={{ position: 'absolute', right: 0, top: 0, width: 250 }}>
      <ul>
        {messages.map((m, i) => (
          <li key={i}>
            <strong>{m.name}:</strong> {m.text}
          </li>
        ))}
      </ul>
      <label htmlFor="chat-input">Chat message</label>
      <input id="chat-input" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={500} />
      <button onClick={send}>Send</button>
    </div>
  );
}
