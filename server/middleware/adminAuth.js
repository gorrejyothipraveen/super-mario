export function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key']
  if (!key || key !== (process.env.ADMIN_KEY || 'dev-admin-key')) {
    return res.status(401).json({ message: 'Admin access required' })
  }
  next()
}
