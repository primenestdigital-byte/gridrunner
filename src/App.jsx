import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LEVELS, parseLevel, cellAt } from './levels.js'

const DIRS = {
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
}

function GameBoard({ state, level, justMoved }) {
  const { walls, targets, boxes, player } = state
  const width = Math.max(...level.grid.map(r => r.length))
  const height = level.grid.length
  const size = Math.min(64, Math.floor(560 / Math.max(width, height)))

  const cells = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`
      const isWall = cellAt(walls, x, y)
      const isTarget = cellAt(targets, x, y)
      const hasBox = cellAt(boxes, x, y)
      const isPlayer = player.x === x && player.y === y
      cells.push(
        <div key={key} className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <div className="absolute inset-[1px] rounded"
            style={{ background: isWall ? 'var(--wall)' : 'var(--floor)', opacity: isWall ? 1 : 0.7 }} />
          {isTarget && !hasBox && (
            <div className="absolute rounded-full" style={{ width: size * 0.28, height: size * 0.28, background: 'var(--target)', opacity: 0.85 }} />
          )}
          {hasBox && (
            <div key={key + (justMoved ? '-m' : '')} className={`cell-anim absolute inset-[3px] rounded-md flex items-center justify-center`}
              style={{ background: isTarget ? 'var(--box-on-target)' : 'var(--box)', boxShadow: isTarget ? '0 0 12px rgba(76,195,138,0.5)' : 'none' }}>
              <div className="rounded-sm" style={{ width: size * 0.35, height: size * 0.35, border: '2px solid rgba(0,0,0,0.25)' }} />
            </div>
          )}
          {isPlayer && (
            <div key={'p' + key + (justMoved ? '-m' : '')} className="cell-anim absolute rounded-full z-10"
              style={{ width: size * 0.58, height: size * 0.58, background: 'var(--player)', boxShadow: '0 0 14px rgba(106,165,250,0.55)' }} />
          )}
        </div>
      )
    }
  }

  return (
    <div className="inline-grid gap-0" style={{ gridTemplateColumns: `repeat(${width}, ${size}px)` }} role="grid" aria-label="Game board">
      {cells}
    </div>
  )
}

export default function App() {
  const [levelIdx, setLevelIdx] = useState(() => {
    const saved = Number(localStorage.getItem('gridrunner-level'))
    return saved >= 0 && saved < LEVELS.length ? saved : 0
  })
  const level = LEVELS[levelIdx]
  const [state, setState] = useState(() => parseLevel(LEVELS[levelIdx]))
  const [moves, setMoves] = useState(0)
  const [history, setHistory] = useState([])
  const [won, setWon] = useState(false)
  const [justMoved, setJustMoved] = useState(0)

  const loadLevel = useCallback((idx) => {
    setLevelIdx(idx)
    localStorage.setItem('gridrunner-level', String(idx))
    setState(parseLevel(LEVELS[idx]))
    setMoves(0); setHistory([]); setWon(false)
  }, [])

  const stateRef = useRef(state)
  const tryMove = useCallback((dir) => {
    if (won) return
    const prev = stateRef.current
    const nx = prev.player.x + dir.x
    const ny = prev.player.y + dir.y
    if (cellAt(prev.walls, nx, ny)) return
    let next
    const boxKey = `${nx},${ny}`
    if (cellAt(prev.boxes, nx, ny)) {
      const bx = nx + dir.x, by = ny + dir.y
      if (cellAt(prev.walls, bx, by) || cellAt(prev.boxes, bx, by)) return
      const boxes = new Set(prev.boxes)
      boxes.delete(boxKey)
      boxes.add(`${bx},${by}`)
      next = { ...prev, boxes, player: { x: nx, y: ny } }
    } else {
      next = { ...prev, player: { x: nx, y: ny } }
    }
    stateRef.current = next
    setState(next)
    setHistory(h => [...h, prev])
    setMoves(m => m + 1)
    setJustMoved(Date.now())
    if ([...next.boxes].every(b => next.targets.has(b))) setTimeout(() => setWon(true), 150)
  }, [won])

  const undo = useCallback(() => {
    setHistory(h => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      stateRef.current = prev
      setState(prev)
      setMoves(m => Math.max(0, m - 1))
      setWon(false)
      return h.slice(0, -1)
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const dir = DIRS[e.key]
      if (dir) { e.preventDefault(); tryMove(dir) }
      else if (e.key === 'z' || e.key === 'Z' || (e.key === 'Backspace')) { e.preventDefault(); undo() }
      else if (e.key === 'r' || e.key === 'R') loadLevel(levelIdx)
      else if (e.key === 'Enter' && won) loadLevel(Math.min(LEVELS.length - 1, levelIdx + 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tryMove, undo, loadLevel, levelIdx, won])

  const targetsLeft = useMemo(() => {
    let n = 0
    for (const t of state.targets) if (!cellAt(state.boxes, ...t.split(',').map(Number))) n++
    return n
  }, [state])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">GridRunner</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Level {levelIdx + 1}/{LEVELS.length} — {level.name}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm tabular">
          <span>moves <strong className="text-base">{moves}</strong></span>
          <span style={{ color: 'var(--muted)' }}>par {level.par}</span>
          <span style={{ color: 'var(--target)' }}>targets left {targetsLeft}</span>
        </div>
      </header>

      <div className="flex flex-col items-center">
        <div className={`rounded-2xl p-5 ${won ? 'win-pulse' : ''}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <GameBoard state={state} level={level} justMoved={justMoved} />
        </div>

        {won && (
          <div className="fade-in mt-5 rounded-xl px-6 py-4 text-center"
            style={{ background: 'rgba(76,195,138,0.12)', border: '1px solid rgba(76,195,138,0.4)' }}>
            <p className="text-lg font-semibold">Level complete!</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {moves} moves · par {level.par} {moves <= level.par ? '· under par ★' : ''}
            </p>
            {levelIdx < LEVELS.length - 1 ? (
              <button onClick={() => loadLevel(levelIdx + 1)}
                className="mt-3 rounded-lg px-5 py-2 text-sm font-medium"
                style={{ background: 'var(--player)', color: '#171423' }}>
                Next level <span className="opacity-70">(Enter)</span>
              </button>
            ) : (
              <p className="mt-2 text-sm font-medium">All levels cleared — you finished the set! 🎉</p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button onClick={() => tryMove({ x: 0, y: -1 })} className="ctl">↑</button>
          <button onClick={() => tryMove({ x: -1, y: 0 })} className="ctl">←</button>
          <button onClick={() => tryMove({ x: 0, y: 1 })} className="ctl">↓</button>
          <button onClick={() => tryMove({ x: 1, y: 0 })} className="ctl">→</button>
          <span className="mx-2 h-6 w-px" style={{ background: 'var(--border)' }}></span>
          <button onClick={undo} className="ctl wide">undo <span className="hint">(Z)</span></button>
          <button onClick={() => loadLevel(levelIdx)} className="ctl wide">restart <span className="hint">(R)</span></button>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-1.5">
          {LEVELS.map((l, i) => (
            <button key={i} onClick={() => loadLevel(i)}
              className="h-8 w-8 rounded-md text-xs font-medium transition-transform"
              style={{
                background: i === levelIdx ? 'var(--player)' : 'var(--surface)',
                color: i === levelIdx ? '#171423' : 'var(--fg)',
                border: '1px solid ' + (i === levelIdx ? 'var(--player)' : 'var(--border)'),
                transform: i === levelIdx ? 'scale(1.1)' : 'none',
              }}
              title={l.name}>
              {i + 1}
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs text-center" style={{ color: 'var(--muted)' }}>
          arrows / WASD to move · push every box (orange) onto a target (yellow) · Z undo · R restart
        </p>
      </div>
    </div>
  )
}
