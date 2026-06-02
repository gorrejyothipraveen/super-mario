import { verifyTokenString } from '../utils/jwt.js'

const adminKey = () => process.env.ADMIN_KEY || 'dev-admin-key'

export function adminAuth(req, res, next) {
  // Option 1: X-Admin-Key header (backward-compatible)
  const key = req.headers['x-admin-key']
  if (key && key === adminKey()) return next()

  // Option 2: Bearer JWT in Authorization header
  const auth = req.headers['authorization']
  if (auth && auth.startsWith('Bearer ')) {
    try {
      verifyTokenString(auth.slice(7))
      return next()
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }
  }

  res.status(401).json({ message: 'Admin access required' })
}
