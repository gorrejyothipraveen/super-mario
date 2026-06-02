// Strip angle brackets (XSS prevention), trim whitespace, cap length.
// better-sqlite3 uses parameterized queries so SQL injection is already prevented.
function clean(val, maxLen = 200) {
  if (typeof val !== 'string') return val
  return val.replace(/[<>]/g, '').trim().slice(0, maxLen)
}

export function sanitizeBody(fields) {
  return (req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      fields.forEach(field => {
        if (req.body[field] !== undefined) req.body[field] = clean(req.body[field])
      })
    }
    next()
  }
}
