import { useState } from 'react';

interface Msg {
  role: 'user' | 'ai';
  text: string;
}

export default function ChatPanel({
  accent,
  onOpenGraph,
  onGenerated,
  onPrompt,
  onOpenAssetGraph,
  standalone = false,
}: {
  accent: string;
  onOpenGraph: () => void;
  onGenerated: () => void;
  // Called with each prompt the creator sends (feeds the Asset Graph history).
  onPrompt?: (text: string) => void;
  // When provided, shows an entry point into the Asset Graph (prompt history).
  onOpenAssetGraph?: () => void;
  // Standalone (rail) mode keeps the input live so you can send many prompts.
  standalone?: boolean;
}) {
  const [input, setInput] = useState('generate bioluminescent mushroom');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'ai', text: 'Describe what you want to create and I’ll author a CreationGraph for it.' },
  ]);
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);

  const locked = done && !standalone;

  const send = () => {
    const text = input.trim();
    if (!text || thinking || locked) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setThinking(true);
    onPrompt?.(text);
    setTimeout(() => {
      setThinking(false);
      setDone(true);
      onGenerated();
      setMessages((m) => [
        ...m,
        {
          role: 'ai',
          text: 'Done — I generated the mesh in the Asset Graph and authored a CreationGraph for it: a fetch → shape pipeline, every attribute editable. Open the graph to tweak it.',
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
            {onOpenAssetGraph && (
              <button className="chat-link" style={{ borderColor: accent, color: accent }} onClick={onOpenAssetGraph}>
                View Asset Graph · prompt history ↗
              </button>
            )}
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
          disabled={locked}
        />
        <button
          onClick={send}
          disabled={!input.trim() || thinking || locked}
          style={{ background: accent }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
