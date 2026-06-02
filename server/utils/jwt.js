import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production'

export function signToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn })
}

export function verifyTokenString(token) {
  return jwt.verify(token, SECRET)
}
