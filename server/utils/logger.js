const IS_TEST = process.env.NODE_ENV === 'test'
const IS_PROD = process.env.NODE_ENV === 'production'

function write(level, message, data) {
  if (IS_TEST) return
  const ts = new Date().toISOString()
  if (IS_PROD) {
    process.stderr.write(
      JSON.stringify({ ts, level, message, ...data }) + '\n'
    )
  } else {
    const extra = data && Object.keys(data).length
      ? ' ' + JSON.stringify(data)
      : ''
    process.stderr.write(`[${ts}] ${level.toUpperCase()}: ${message}${extra}\n`)
  }
}

export const logger = {
  info:  (msg, data = {}) => write('info',  msg, data),
  warn:  (msg, data = {}) => write('warn',  msg, data),
  error: (msg, data = {}) => write('error', msg, data),
}
