const DEMO_MODE = process.env.DEMO_MODE === 'true'

// Rutas bloqueadas en modo demo: [método, regex del path]
const BLOCKED = [
  // Admin — usuarios
  ['DELETE', /^\/auth\/adminView\/users/],
  ['PUT',    /^\/auth\/adminView\/users/],
  ['DELETE', /^\/auth\/users\/inactive/],

  // Admin — productos
  ['POST',   /^\/api\/products/],
  ['PUT',    /^\/api\/products/],
  ['DELETE', /^\/api\/products/],
]

const demoMode = (req, res, next) => {
  if (!DEMO_MODE) return next()

  const isBlocked = BLOCKED.some(
    ([method, pattern]) => req.method === method && pattern.test(req.path)
  )

  if (isBlocked) {
    return res.status(403).json({
      status: 'demo',
      message: '🔒 Acción deshabilitada en modo demo. Este sitio es solo de muestra.',
    })
  }

  next()
}

export default demoMode
