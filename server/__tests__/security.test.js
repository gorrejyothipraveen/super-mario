import request from 'supertest'

process.env.ADMIN_KEY  = 'test-admin-key'
process.env.JWT_SECRET = 'test-jwt-secret'

import app from '../app.js'

// ── JWT / auth ────────────────────────────────────────────────────────────────

describe('POST /api/auth/token', () => {
  it('issues a JWT when the correct admin secret is provided', async () => {
    const res = await request(app)
      .post('/api/auth/token')
      .send({ secret: 'test-admin-key' })
    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.expiresIn).toBe('1h')
  })

  it('returns 401 for wrong secret', async () => {
    const res = await request(app)
      .post('/api/auth/token')
      .send({ secret: 'wrong-key' })
    expect(res.status).toBe(401)
  })

  it('returns 400 when secret is missing', async () => {
    const res = await request(app).post('/api/auth/token').send({})
    expect(res.status).toBe(400)
  })
})

describe('JWT Bearer token on admin routes', () => {
  async function getToken() {
    const res = await request(app)
      .post('/api/auth/token')
      .send({ secret: 'test-admin-key' })
    return res.body.token
  }

  const VALID_CONFIG = JSON.stringify({
    spawn: { xFrac: 0.1 }, platforms: [], coins: [], enemies: [],
    goal: { xFrac: 0.95, fromBottom: 70 }, nextLevel: null,
  })

  it('allows admin action with valid Bearer token', async () => {
    const token = await getToken()
    const res = await request(app)
      .post('/api/levels')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'JWT Level', config_json: VALID_CONFIG })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('JWT Level')
  })

  it('blocks admin action with invalid Bearer token', async () => {
    const res = await request(app)
      .post('/api/levels')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({ name: 'Hacked', config_json: VALID_CONFIG })
    expect(res.status).toBe(401)
  })

  it('blocks admin action with no credentials', async () => {
    const res = await request(app)
      .post('/api/levels')
      .send({ name: 'No Auth', config_json: VALID_CONFIG })
    expect(res.status).toBe(401)
  })
})

// ── Input sanitization ────────────────────────────────────────────────────────

describe('Input sanitization on score submission', () => {
  it('strips angle brackets from username', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({ username: '<script>alert(1)</script>', score: 100 })
    expect(res.status).toBe(201)
    expect(res.body.username).not.toMatch(/<|>/)
    expect(res.body.username).toBe('scriptalert(1)/script')
  })

  it('trims leading/trailing whitespace from username', async () => {
    const res = await request(app)
      .post('/api/scores')
      .send({ username: '  mario  ', score: 200 })
    expect(res.status).toBe(201)
    expect(res.body.username).toBe('mario')
  })
})

// ── Rate limiting headers ─────────────────────────────────────────────────────

describe('Rate limiting headers', () => {
  it('includes RateLimit headers on API responses', async () => {
    const res = await request(app).get('/api/scores')
    expect(res.status).toBe(200)
    // express-rate-limit draft-7 sends combined 'RateLimit' + 'RateLimit-Policy' headers
    const hasRateLimit =
      'ratelimit'        in res.headers ||
      'ratelimit-policy' in res.headers ||
      'x-ratelimit-limit' in res.headers
    expect(hasRateLimit).toBe(true)
  })
})
