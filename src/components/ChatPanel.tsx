import { useState } from 'react';

interface Msg {
  role: 'user' | 'ai';
  text: string;
}

export default function ChatPanel({
  accent,
  onOpenGraph,
  onGenerated,
}: {
  accent: string;
  onOpenGraph: () => void;
  onGenerated: () => void;
}) {
  const [input, setInput] = useState('generate bioluminescent mushroom');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: 'Describe what you want to create and I’ll author a Model Graph for it.' },
  ]);
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);

  const send = () => {
    const text = input.trim();
    if (!text || thinking || done) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setDone(true);
      onGenerated();
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: 'Done — I authored a Model Graph for a bioluminescent mushroom: a generate → shape pipeline, every attribute editable. Open the graph to tweak it.',
        },
      ]);
    }, 1100);
  };

  return (
    <div className="chat">
      <div className="chat-head">
        <span className="chat-dot" style={{ background: accent }} />
        Creation Assistant
      </div>

      <div className="chat-log">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.role === 'ai' && (
              <div className="chat-avatar" style={{ background: accent }}>
                AI
              </div>
            )}
            <div className="chat-bubble">{m.text}</div>
          </div>
        ))}
        {thinking && (
          <div className="chat-msg ai">
            <div className="chat-avatar" style={{ background: accent }}>
              AI
            </div>
            <div className="chat-bubble chat-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        {done && (
          <div className="chat-actions">
            <button className="chat-open" style={{ background: accent }} onClick={onOpenGraph}>
              Open the generated graph →
            </button>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          value={input}
          placeholder="Ask the assistant to create something…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send();
          }}
          disabled={done}
        />
        <button
          onClick={send}
          disabled={!input.trim() || thinking || done}
          style={{ background: accent }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
