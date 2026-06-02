import request from 'supertest'

process.env.ADMIN_KEY = 'test-admin-key'

import app from '../app.js'

const ADMIN = { 'x-admin-key': 'test-admin-key' }

const VALID_CONFIG = JSON.stringify({
  spawn:     { xFrac: 0.1 },
  platforms: [{ xFrac: 0.3, fromBottom: 130, w: 140 }],
  coins:     [{ xFrac: 0.3, fromBottom: 165 }],
  enemies:   [{ xFrac: 0.5, fromBottom: 64, leftFrac: 0.4, rightFrac: 0.6 }],
  goal:      { xFrac: 0.95, fromBottom: 70 },
  nextLevel: null,
})

async function createTestLevel(name = 'Test World') {
  const res = await request(app)
    .post('/api/levels')
    .set(ADMIN)
    .send({ name, config_json: VALID_CONFIG })
  return res.body
}

describe('POST /api/levels', () => {
  it('creates a level and returns 201', async () => {
    const res = await request(app)
      .post('/api/levels')
      .set(ADMIN)
      .send({ name: 'World 2-1', config_json: VALID_CONFIG })
    expect(res.status).toBe(201)
    expect(res.body.name).toBe('World 2-1')
    expect(res.body.published).toBe(false)
    expect(res.body.id).toBeDefined()
  })

  it('returns 401 without admin key', async () => {
    const res = await request(app)
      .post('/api/levels')
      .send({ name: 'No Auth', config_json: VALID_CONFIG })
    expect(res.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/levels')
      .set(ADMIN)
      .send({ config_json: VALID_CONFIG })
    expect(res.status).toBe(400)
  })

  it('returns 400 when config_json is invalid JSON', async () => {
    const res = await request(app)
      .post('/api/levels')
      .set(ADMIN)
      .send({ name: 'Bad Config', config_json: '{not json}' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when config_json is missing required keys', async () => {
    const res = await request(app)
      .post('/api/levels')
      .set(ADMIN)
      .send({ name: 'Incomplete', config_json: JSON.stringify({ spawn: { xFrac: 0.1 } }) })
    expect(res.status).toBe(400)
  })
})

describe('GET /api/levels', () => {
  it('returns only published levels for public requests', async () => {
    const level = await createTestLevel('Public Level')
    await request(app).patch(`/api/levels/${level.id}/publish`).set(ADMIN).send({ published: true })

    await createTestLevel('Draft Level')  // stays unpublished

    const res = await request(app).get('/api/levels')
    expect(res.status).toBe(200)
    const names = res.body.map(l => l.name)
    expect(names).toContain('Public Level')
    expect(names).not.toContain('Draft Level')
  })

  it('returns all levels when admin key is provided', async () => {
    await createTestLevel('Admin Visible Draft')
    const res = await request(app).get('/api/levels').set(ADMIN)
    expect(res.status).toBe(200)
    expect(res.body.some(l => l.name === 'Admin Visible Draft')).toBe(true)
  })
})

describe('GET /api/levels/:id', () => {
  it('returns a level by id', async () => {
    const level = await createTestLevel('Fetch Me')
    const res = await request(app).get(`/api/levels/${level.id}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Fetch Me')
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/levels/99999')
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/levels/:id', () => {
  it('updates name and background', async () => {
    const level = await createTestLevel('Old Name')
    const res = await request(app)
      .put(`/api/levels/${level.id}`)
      .set(ADMIN)
      .send({ name: 'New Name', background: '#1a1a2e' })
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New Name')
    expect(res.body.background).toBe('#1a1a2e')
  })

  it('returns 401 without admin key', async () => {
    const level = await createTestLevel('Protected')
    const res = await request(app).put(`/api/levels/${level.id}`).send({ name: 'Hacked' })
    expect(res.status).toBe(401)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).put('/api/levels/99999').set(ADMIN).send({ name: 'Ghost' })
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/levels/:id/publish', () => {
  it('publishes and unpublishes a level', async () => {
    const level = await createTestLevel('Toggle Me')
    expect(level.published).toBe(false)

    const pub = await request(app)
      .patch(`/api/levels/${level.id}/publish`)
      .set(ADMIN)
      .send({ published: true })
    expect(pub.status).toBe(200)
    expect(pub.body.published).toBe(true)

    const unpub = await request(app)
      .patch(`/api/levels/${level.id}/publish`)
      .set(ADMIN)
      .send({ published: false })
    expect(unpub.status).toBe(200)
    expect(unpub.body.published).toBe(false)
  })
})

describe('DELETE /api/levels/:id', () => {
  it('deletes a level and returns 204', async () => {
    const level = await createTestLevel('Delete Me')
    const res = await request(app).delete(`/api/levels/${level.id}`).set(ADMIN)
    expect(res.status).toBe(204)
    const check = await request(app).get(`/api/levels/${level.id}`)
    expect(check.status).toBe(404)
  })

  it('returns 401 without admin key', async () => {
    const level = await createTestLevel('Protected Delete')
    const res = await request(app).delete(`/api/levels/${level.id}`)
    expect(res.status).toBe(401)
  })

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/levels/99999').set(ADMIN)
    expect(res.status).toBe(404)
  })
})
