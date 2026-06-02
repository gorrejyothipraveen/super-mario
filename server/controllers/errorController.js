import { logger } from '../utils/logger.js'

export function reportError(req, res) {
  const { message, source, stack, url, userAgent } = req.body
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'message (string) is required' })
  }
  logger.error('[client]', {
    message: message.slice(0, 500),
    source:  source  ?? 'unknown',
    url:     url     ?? 'unknown',
    ua:      userAgent ? userAgent.slice(0, 200) : 'unknown',
    stack:   stack ? stack.slice(0, 1000) : undefined,
  })
  res.status(201).json({ logged: true })
}
