import request from 'supertest'
import app from '../app.js'

describe('POST /api/scores', () => {
  it('saves a score and returns the entry', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({ username: 'mario', score: 300 })
    expect(res.status).toBe(201)
    expect(res.body.username).toBe('mario')
    expect(res.body.score).toBe(300)
    expect(res.body.id).toBeDefined()
  })

  it('returns 400 when score is missing', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({ username: 'mario' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when username is missing', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({ score: 100 })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/scores', () => {
  it('returns leaderboard array sorted by score desc', async () => {
    await request(app).post('/api/scores').send({ username: 'luigi', score: 50 })
    await request(app).post('/api/scores').send({ username: 'peach', score: 500 })
    const res = await request(app).get('/api/scores')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const scores = res.body.map(e => e.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })
})

describe('GET /api/scores/best', () => {
  it('returns one entry per player with their best score', async () => {
    await request(app).post('/api/scores').send({ username: 'wario', score: 100 })
    await request(app).post('/api/scores').send({ username: 'wario', score: 800 })
    await request(app).post('/api/scores').send({ username: 'waluigi', score: 400 })
    const res = await request(app).get('/api/scores/best')
    expect(res.status).toBe(200)
    const wario = res.body.find(e => e.username === 'wario')
    expect(wario.score).toBe(800)
    const names = res.body.map(e => e.username)
    expect(new Set(names).size).toBe(names.length)
    const scores = res.body.map(e => e.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })
})

describe('GET /api/scores/:username/high', () => {
  it('returns the highest score for a player', async () => {
    await request(app).post('/api/scores').send({ username: 'toad', score: 10 })
    await request(app).post('/api/scores').send({ username: 'toad', score: 999 })
    const res = await request(app).get('/api/scores/toad/high')
    expect(res.status).toBe(200)
    expect(res.body.score).toBe(999)
  })

  it('returns 404 for unknown player', async () => {
    const res = await request(app).get('/api/scores/unknown_xyz/high')
    expect(res.status).toBe(404)
  })
})
