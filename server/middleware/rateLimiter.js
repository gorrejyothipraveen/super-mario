import { rateLimit } from 'express-rate-limit'

// General API limit — 200 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  limit:            200,
  standardHeaders: 'draft-7',
  legacyHeaders:    false,
  message:          { message: 'Too many requests, please try again later.' },
})

// Strict limit for score submissions — 30 per minute (prevents score spam)
export const submitLimiter = rateLimit({
  windowMs:         60 * 1000,
  limit:            30,
  standardHeaders: 'draft-7',
  legacyHeaders:    false,
  message:          { message: 'Score submission rate limit exceeded.' },
})
