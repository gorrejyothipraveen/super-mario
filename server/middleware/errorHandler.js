import { logger } from '../utils/logger.js'

export function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

export function errorHandler(err, req, res, next) {
  const status = res.statusCode !== 200 ? res.statusCode : 500
  logger.error(err.message, {
    status,
    method: req.method,
    url:    req.originalUrl,
    stack:  process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  })
  res.status(status).json({
    message: err.message,
    code:    err.code ?? 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}
