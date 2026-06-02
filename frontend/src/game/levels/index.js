const level1 = {
  id: 1,
  name: 'World 1-1',
  background: '#5c94fc',
  spawn: { xFrac: 0.12 },
  platforms: [
    { xFrac: 0.25, fromBottom: 130, w: 140 },
    { xFrac: 0.55, fromBottom: 210, w: 160 },
    { xFrac: 0.80, fromBottom: 150, w: 120 },
  ],
  questionBlocks: [
    { xFrac: 0.30, fromBottom: 210 },
    { xFrac: 0.50, fromBottom: 120 },
    { xFrac: 0.55, fromBottom: 290 },
    { xFrac: 0.62, fromBottom: 290 },
  ],
  coins: [
    { xFrac: 0.15, fromBottom: 80  },
    { xFrac: 0.20, fromBottom: 80  },
    { xFrac: 0.25, fromBottom: 165 },
    { xFrac: 0.30, fromBottom: 165 },
    { xFrac: 0.48, fromBottom: 248 },
    { xFrac: 0.55, fromBottom: 248 },
    { xFrac: 0.62, fromBottom: 248 },
    { xFrac: 0.75, fromBottom: 80  },
    { xFrac: 0.80, fromBottom: 188 },
    { xFrac: 0.88, fromBottom: 80  },
  ],
  enemies: [
    { xFrac: 0.42, fromBottom: 64, leftFrac: 0.30, rightFrac: 0.54 },
    { xFrac: 0.68, fromBottom: 64, leftFrac: 0.58, rightFrac: 0.82 },
    { xFrac: 0.55, fromBottom: 250, leftFrac: 0.45, rightFrac: 0.65 },
  ],
  goal: { xFrac: 0.97, fromBottom: 70 },
  nextLevel: 1,
}

const level2 = {
  id: 2,
  name: 'World 1-2',
  background: '#1a1a2e',
  spawn: { xFrac: 0.06 },
  platforms: [
    { xFrac: 0.20, fromBottom: 110, w: 100 },
    { xFrac: 0.40, fromBottom: 170, w: 120 },
    { xFrac: 0.60, fromBottom: 230, w: 140 },
    { xFrac: 0.78, fromBottom: 160, w: 100 },
    { xFrac: 0.90, fromBottom: 100, w:  80 },
  ],
  coins: [
    { xFrac: 0.10, fromBottom: 80  },
    { xFrac: 0.20, fromBottom: 145 },
    { xFrac: 0.28, fromBottom: 145 },
    { xFrac: 0.40, fromBottom: 205 },
    { xFrac: 0.48, fromBottom: 205 },
    { xFrac: 0.60, fromBottom: 265 },
    { xFrac: 0.68, fromBottom: 265 },
    { xFrac: 0.78, fromBottom: 195 },
    { xFrac: 0.86, fromBottom: 195 },
    { xFrac: 0.90, fromBottom: 135 },
  ],
  enemies: [
    { xFrac: 0.30, fromBottom: 64,  leftFrac: 0.20, rightFrac: 0.40 },
    { xFrac: 0.55, fromBottom: 64,  leftFrac: 0.45, rightFrac: 0.65 },
    { xFrac: 0.40, fromBottom: 207, leftFrac: 0.32, rightFrac: 0.48 },
    { xFrac: 0.78, fromBottom: 197, leftFrac: 0.70, rightFrac: 0.86 },
  ],
  goal: { xFrac: 0.97, fromBottom: 70 },
  nextLevel: null,
}

export const LEVELS = [level1, level2]
