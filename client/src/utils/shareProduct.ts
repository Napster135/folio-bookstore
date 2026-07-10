export type ShareableProduct = {
  _id: string
  title: string
  author?: string
}

type ShowToast = (message: string, type?: 'success' | 'error' | 'info') => void

export async function shareProduct(
  product: ShareableProduct,
  showToast?: ShowToast
): Promise<void> {
  const url = `${window.location.origin}/products/${product._id}`
  const text = `Mirá este libro en Folio: "${product.title}"${product.author ? ` de ${product.author}` : ''}.`

  try {
    if (navigator.share) {
      await navigator.share({ title: product.title, text, url })
      // Web Share API muestra su propia UI — no necesita toast
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      showToast?.('Link copiado al portapapeles', 'success')
    } else {
      showToast?.('Copiá el link: ' + url, 'info')
    }
  } catch (err) {
    // AbortError = el usuario cerró el menú — ignorar silenciosamente
    if (err instanceof Error && err.name !== 'AbortError') {
      showToast?.('No se pudo compartir el link', 'error')
    }
  }
}
