// GridRunner levels. Legend:
// '#' wall  '.' floor  '$' box  '*' box on target
// '@' player  '+' player on target  'o' target

export const LEVELS = [
  {
    name: 'First Push', par: 8,
    grid: [
      '#####',
      '#@o.#',
      '#.$.#',
      '#...#',
      '#####',
    ],
  },
  {
    name: 'Corner Case', par: 14,
    grid: [
      '######',
      '#..o.#',
      '#.$..#',
      '#.@..#',
      '#....#',
      '######',
    ],
  },
  {
    name: 'Hallway', par: 18,
    grid: [
      '#######',
      '#.....#',
      '#.@$o.#',
      '#.....#',
      '#.$.o.#',
      '#######',
    ],
  },
  {
    name: 'Two Step', par: 22,
    grid: [
      '#######',
      '#..o..#',
      '#.$.$.#+#',
      '#.....#',
      '#######',
    ],
  },
  {
    name: 'Storage Room', par: 26,
    grid: [
      '########',
      '#..#...#',
      '#.$..$.#',
      '#.o##o.#',
      '#.@....#',
      '########',
    ],
  },
  {
    name: 'The Pillar', par: 30,
    grid: [
      '#######',
      '#..o..#',
      '#..$..#',
      '#..+..#',
      '#..$..#',
      '#..o..#',
      '#..@..#',
      '#######',
    ],
  },
  {
    name: 'Diagonal', par: 34,
    grid: [
      '########',
      '#o.....#',
      '#.$....#',
      '#..#...#',
      '#...#..#',
      '#....#.#',
      '#.....@#',
      '########',
    ],
  },
  {
    name: 'Crossroads', par: 38,
    grid: [
      '#########',
      '#...o...#',
      '#.$.#.$.#+#',
      '#...#...#',
      '#.o.....#',
      '#########',
    ],
  },
  {
    name: 'Warehouse', par: 44,
    grid: [
      '#########',
      '#..o..o.#',
      '#.$...$.#',
      '#..###..#',
      '#.$...$.#',
      '#..o.@..#',
      '#########',
    ],
  },
  {
    name: 'Final Exam', par: 52,
    grid: [
      '##########',
      '#...oo...#',
      '#.$.....$#',
      '#..####..#',
      '#.$.....$#',
      '#...+@...#',
      '##########',
    ],
  },
]

export function parseLevel(level) {
  const walls = new Set()
  const targets = new Set()
  const boxes = new Set()
  let player = null
  const rows = level.grid.map(row => [...row])
  rows.forEach((row, y) => {
    row.forEach((ch, x) => {
      const key = `${x},${y}`
      if (ch === '#') walls.add(key)
      if (ch === 'o' || ch === '*' || ch === '+') targets.add(key)
      if (ch === '$' || ch === '*') boxes.add(key)
      if (ch === '@' || ch === '+') player = { x, y }
    })
  })
  return { walls, targets, boxes, player }
}

export function cellAt(set, x, y) { return set.has(`${x},${y}`) }
