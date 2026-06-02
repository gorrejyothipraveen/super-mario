// Pseudo-random: deterministic per (wave, slot) pair
function rng(wave, slot) {
  const x = Math.sin(wave * 127.1 + slot * 311.7) * 43758.5453
  return x - Math.floor(x)
}

const BACKGROUNDS = ['#5c94fc', '#1a1a2e', '#2d5a1b', '#4a2060', '#7b3a1a']

export function generateEndlessLevel(wave) {
  const bg = BACKGROUNDS[wave % BACKGROUNDS.length]

  // 3–5 platforms spread across the width
  const platformCount = 3 + Math.floor(rng(wave, 0) * 3)
  const platforms = []
  for (let i = 0; i < platformCount; i++) {
    platforms.push({
      xFrac:      0.15 + rng(wave, i * 10)      * 0.70,
      fromBottom: 100  + rng(wave, i * 10 + 1)  * 180,
      w:          80   + rng(wave, i * 10 + 2)  * 100,
    })
  }

  // Coins: one above each platform + a few on the ground
  const coins = []
  platforms.forEach(({ xFrac, fromBottom }, i) => {
    coins.push({ xFrac, fromBottom: fromBottom + 42 })
    if (rng(wave, i * 7) > 0.5) {
      coins.push({ xFrac: Math.min(0.93, xFrac + 0.05), fromBottom: fromBottom + 42 })
    }
  })
  for (let i = 0; i < 4; i++) {
    coins.push({ xFrac: 0.1 + rng(wave, i * 13 + 5) * 0.8, fromBottom: 72 })
  }

  // Enemies: 2 base + 1 per 2 waves, capped at 6
  const groundEnemyCount = Math.min(5, 2 + Math.floor(wave / 2))
  const enemies = []
  for (let i = 0; i < groundEnemyCount; i++) {
    const xFrac = 0.25 + rng(wave, i * 17) * 0.60
    enemies.push({
      xFrac,
      fromBottom: 64,
      leftFrac:  Math.max(0.05, xFrac - 0.12),
      rightFrac: Math.min(0.93, xFrac + 0.12),
    })
  }

  // From wave 3: put one enemy on a platform
  if (wave >= 3 && platforms.length > 0) {
    const p = platforms[Math.floor(rng(wave, 99) * platforms.length)]
    enemies.push({
      xFrac:      p.xFrac,
      fromBottom: p.fromBottom + 40,
      leftFrac:   Math.max(0.05, p.xFrac - 0.10),
      rightFrac:  Math.min(0.93, p.xFrac + 0.10),
    })
  }

  return {
    id:         `endless-wave-${wave}`,
    name:       `Wave ${wave}`,
    background: bg,
    spawn:      { xFrac: 0.06 },
    platforms,
    questionBlocks: [],
    coins,
    enemies,
    goal:       { xFrac: 0.97, fromBottom: 70 },
    nextLevel:  null,
    // Difficulty modifiers consumed by PlayScene
    enemySpeedMult: Math.min(3.0, 1 + (wave - 1) * 0.2),
    timeLimit:      Math.max(120, 400 - (wave - 1) * 20),
  }
}
