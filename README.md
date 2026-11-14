# GridRunner

A Sokoban-style box-pushing puzzle game. 10 hand-designed levels, undo history, move counter, par scoring, level select — all state in React, animations in CSS.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

## How to play

Push every orange box onto a yellow target. Arrows or WASD move; you can only push boxes (never pull), and only one at a time. Z undoes a move, R restarts the level. Progress (current level) is saved to localStorage.

## Levels

From "First Push" (8-move par) to "Final Exam" (52-move par, 4 boxes). Every level is solvable — no dead-end traps.

## Motion

Player and box moves pop with a spring curve `cubic-bezier(0.34, 1.56, 0.64, 1)` (openmotion style); level-complete banner fades in; win state pulses the board. `prefers-reduced-motion` respected.

## License

MIT
