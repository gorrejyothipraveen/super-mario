import { signToken } from '../utils/jwt.js'

export function issueToken(req, res) {
  const { secret } = req.body
  if (!secret || typeof secret !== 'string') {
    return res.status(400).json({ message: 'secret is required' })
  }
  if (secret !== (process.env.ADMIN_KEY || 'dev-admin-key')) {
    return res.status(401).json({ message: 'Invalid secret' })
  }
  const token = signToken({ role: 'admin' }, '1h')
  res.json({ token, expiresIn: '1h' })
}
