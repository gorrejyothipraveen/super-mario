import request from 'supertest'
import app from '../app.js'

describe('POST /api/errors', () => {
  it('accepts a client error report and returns 201', async () => {
    const res = await request(app)
      .post('/api/errors')
      .send({ message: 'Uncaught TypeError', source: 'react-boundary', stack: 'Error\n  at App.jsx:12' })
    expect(res.status).toBe(201)
    expect(res.body.logged).toBe(true)
  })

  it('returns 400 when message is missing', async () => {
    const res = await request(app).post('/api/errors').send({ source: 'window.onerror' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when message is not a string', async () => {
    const res = await request(app).post('/api/errors').send({ message: 42 })
    expect(res.status).toBe(400)
  })
})

describe('Unknown routes', () => {
  it('returns 404 JSON for unknown API paths', async () => {
    const res = await request(app).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('message')
  })
})
