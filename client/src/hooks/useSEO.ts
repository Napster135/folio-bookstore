import { useEffect } from 'react'

type SEOOptions = {
  title: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'product' | 'article'
  price?: number
  availability?: 'InStock' | 'OutOfStock'
  brand?: string
  category?: string
  author?: string
  schema?: object
}

const SITE_NAME = 'Folio — Librería Online'
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setSchemaLD(schema: object) {
  let el = document.getElementById('schema-ld') as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = 'schema-ld'
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(schema)
}

export function useSEO({
  title,
  description,
  image,
  url,
  type = 'website',
  price,
  availability,
  category,
  author,
  schema,
}: SEOOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const fullUrl = url ? `${BASE_URL}${url}` : typeof window !== 'undefined' ? window.location.href : ''

    // Document title
    document.title = fullTitle

    // Meta description
    if (description) setMeta('description', description)

    // Open Graph
    setMeta('og:title', fullTitle, 'property')
    setMeta('og:site_name', SITE_NAME, 'property')
    setMeta('og:type', type === 'product' ? 'og:product' : 'website', 'property')
    setMeta('og:url', fullUrl, 'property')
    if (description) setMeta('og:description', description, 'property')
    if (image) setMeta('og:image', image, 'property')
    if (price) setMeta('product:price:amount', String(price), 'property')
    if (price) setMeta('product:price:currency', 'USD', 'property')

    // Twitter Card
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary')
    setMeta('twitter:title', fullTitle)
    if (description) setMeta('twitter:description', description)
    if (image) setMeta('twitter:image', image)

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = fullUrl

    // Schema.org JSON-LD
    if (schema) {
      setSchemaLD(schema)
    }
  }, [title, description, image, url, type, price, availability, category, author, schema])
}

// Shortcut hook for simple title-only usage
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    return () => { document.title = SITE_NAME }
  }, [title])
}
