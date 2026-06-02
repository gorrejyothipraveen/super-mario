import request from 'supertest'
import app from '../app.js'

describe('GET /api/saves/:username', () => {
  it('returns 404 when no save exists', async () => {
    const res = await request(app).get('/api/saves/nobody_xyz')
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/saves/:username', () => {
  const payload = { levelIndex: 1, score: 250, unlockedLevels: [0, 1] }

  it('creates a new save and returns it', async () => {
    const res = await request(app).put('/api/saves/mario').send(payload)
    expect(res.status).toBe(200)
    expect(res.body.username).toBe('mario')
    expect(res.body.levelIndex).toBe(1)
    expect(res.body.score).toBe(250)
    expect(res.body.unlockedLevels).toEqual([0, 1])
  })

  it('overwrites an existing save (upsert)', async () => {
    await request(app).put('/api/saves/luigi').send(payload)
    const updated = { levelIndex: 2, score: 999, unlockedLevels: [0, 1, 2] }
    const res = await request(app).put('/api/saves/luigi').send(updated)
    expect(res.status).toBe(200)
    expect(res.body.levelIndex).toBe(2)
    expect(res.body.score).toBe(999)
  })

  it('returns 400 when body is invalid', async () => {
    const res = await request(app).put('/api/saves/bad').send({ score: 'x' })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/saves/:username (after save)', () => {
  it('returns the saved state', async () => {
    await request(app)
      .put('/api/saves/peach')
      .send({ levelIndex: 0, score: 100, unlockedLevels: [0] })
    const res = await request(app).get('/api/saves/peach')
    expect(res.status).toBe(200)
    expect(res.body.score).toBe(100)
    expect(res.body.unlockedLevels).toEqual([0])
  })
})
