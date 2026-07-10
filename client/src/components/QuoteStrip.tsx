import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import './QuoteStrip.css'

const benefits = [
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Selección curada',
    subtitle: 'Libros seleccionados por nuestro equipo editorial.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Calidad garantizada',
    subtitle: 'Nuevos y originales, siempre.',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Comunidad lectora',
    subtitle: 'Únete a miles de lectores apasionados.',
  },
]

const ease = [0.25, 0.1, 0.25, 1] as const

export default function QuoteStrip() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className="qs-root" ref={ref}>
      <div className="qs-inner">

        {/* Quote — left */}
        <motion.div
          className="qs-quote-col"
          initial={{ opacity: 0, y: 22 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={{ duration: 0.6, delay: 0, ease }}
        >
          <p className="qs-text">
            <span className="qs-mark">&ldquo;</span>Un buen libro es un viaje que comienza en la página y termina en el alma.
          </p>
          <p className="qs-attr">— Anónimo</p>
        </motion.div>

        {/* Benefits — right */}
        <div className="qs-benefits">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              className="qs-benefit"
              initial={{ opacity: 0, y: 22 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
              transition={{ duration: 0.6, delay: (i + 1) * 0.1, ease }}
            >
              <span className="qs-benefit-icon">{b.icon}</span>
              <div>
                <p className="qs-benefit-title">{b.title}</p>
                <p className="qs-benefit-sub">{b.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}
