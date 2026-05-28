import request from 'supertest'
import app from '../app.js'

describe('GET /api/health', () => {
  it('returns 200 with status ok and timestamp', async () => {
    const res = await request(app).get('/api/health')
    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('status', 'ok')
    expect(res.body).toHaveProperty('timestamp')
  })
})

describe('GET /unknown-route', () => {
  it('returns 404 for unregistered routes', async () => {
    const res = await request(app).get('/unknown-route')
    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('message')
  })
})
