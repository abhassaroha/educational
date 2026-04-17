
// ─── Scratch pad ───────────────────────────────────────────────────────────

import { useState } from "react";

export type CmdDir = 'F' | 'B' | 'L' | 'R' | 'J'
export interface Cmd { dir: CmdDir; dist: number }

function parseCommands(text: string): Cmd[] {
  const cmds: Cmd[] = []
  for (const line of text.split('\n')) {
    const parts = line.trim().toUpperCase().split(/\s+/)
    const dir = parts[0] as CmdDir
    if (!['F', 'B', 'L', 'R', 'J'].includes(dir)) continue
    const raw = parseFloat(parts[1])
    cmds.push({ dir, dist: isNaN(raw) ? 5 : Math.max(0.1, raw) })
  }
  return cmds
}

export function ScratchPad({ onSubmit }: { onSubmit: (cmds: Cmd[]) => void }) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    const cmds = parseCommands(text)
    if (cmds.length > 0) onSubmit(cmds)
  }

  const panelStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    padding: '12px 14px 14px',
    fontFamily: 'monospace',
    color: '#d4f0d4',
    fontSize: 13,
    pointerEvents: 'auto',
    userSelect: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    letterSpacing: 1,
    fontSize: 11,
    color: '#7ec87e',
    textTransform: 'uppercase',
  }

  const taStyle: React.CSSProperties = {
    width: '100%',
    height: 110,
    background: 'rgba(0,0,0,0.45)',
    border: '1px solid rgba(80,160,80,0.35)',
    borderRadius: 6,
    color: '#e8ffe8',
    fontFamily: 'monospace',
    fontSize: 13,
    padding: '7px 9px',
    resize: 'none',
    outline: 'none',
    lineHeight: 1.7,
    boxSizing: 'border-box',
  }

  const hintStyle: React.CSSProperties = {
    color: 'rgba(150,210,150,0.55)',
    fontSize: 11,
    marginTop: 7,
    lineHeight: 1.6,
  }

  const btnStyle: React.CSSProperties = {
    marginTop: 10,
    width: '100%',
    padding: '7px 0',
    background: 'rgba(60,140,60,0.7)',
    border: '1px solid rgba(100,200,100,0.5)',
    borderRadius: 6,
    color: '#d4f0d4',
    fontFamily: 'monospace',
    fontSize: 13,
    cursor: 'pointer',
    letterSpacing: 1,
  }

  return (
    <div style={panelStyle}>
      <div style={labelStyle}>
        <span>Scratch Pad</span>
      </div>
      <textarea
        id="scratchpad"
        style={taStyle}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'F 10\nR 5\nJ\nB 3'}
        spellCheck={false}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit() }}
      />
      <div style={hintStyle}>
        F/B/L/R [dist] · J [height]<br />
        one command per line · Ctrl+Enter to run
      </div>
      <button style={btnStyle} onClick={handleSubmit}>
        ▶ Run
      </button>
    </div>
  )
}