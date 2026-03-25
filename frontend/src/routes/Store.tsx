import { useEffect, useState } from 'react'
import { appContent } from '../config/content'
import { addToCart } from '../lib/cartStorage'
import { getProducts } from '../services/auth'

type ProductLike = {
  id: string
  title: string
  shortDescription: string
  longDescription?: string
  price?: string
  imageUrl?: string
}

function thumbBackground(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  const hueA = hash % 360
  const hueB = (hueA + 55 + (hash % 50)) % 360
  return `linear-gradient(135deg, hsl(${hueA} 85% 60%) 0%, hsl(${hueB} 85% 45%) 100%)`
}

export function Store() {
  const { title, intro } = appContent.store

  const [products, setProducts] = useState<ProductLike[]>([])
  const [loading, setLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductLike | null>(null)

  useEffect(() => {
    let active = true

    async function loadProducts() {
      setLoading(true)
      try {
        const rows = await getProducts()
        if (!active) return
        setProducts(
          rows.map((row) => ({
            id: row.id,
            title: row.name,
            shortDescription: row.short_description,
            longDescription: row.long_description ?? undefined,
            imageUrl: row.image_url ?? undefined,
            price: `${(row.price_cents / 100).toFixed(2)} ${row.currency}`,
          })),
        )
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Não foi possível carregar os produtos.'
        setProductsError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadProducts()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedProduct) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProduct(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedProduct])

  const handleAddToCart = (productId: string) => {
    addToCart(productId, 1)
  }

  return (
    <section className="page page--store">
      <header className="page-header">
        <h1>{title}</h1>
        <p>{intro}</p>
        {productsError && <p className="form-message form-message--error">{productsError}</p>}
      </header>

      {loading && (
        <p className="page-loading" aria-live="polite">A carregar produtos…</p>
      )}

      <section className="store-list" aria-label="Lista de produtos disponíveis">
        <ul className="thumb-grid" aria-label="Lista de produtos">
          {products.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                className="thumb-card thumb-card--center"
                onClick={() => setSelectedProduct(product)}
              >
                {product.imageUrl ? (
                  <div className="thumb thumb--product-photo">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div
                    className="thumb"
                    style={{ backgroundImage: thumbBackground(product.id) }}
                    aria-hidden="true"
                  />
                )}
                <div className="thumb-card-body">
                  <div className="thumb-card-title">{product.title}</div>
                  <div className="thumb-card-text">{product.shortDescription}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selectedProduct && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes do produto ${selectedProduct.title}`}
          onMouseDown={() => setSelectedProduct(null)}
        >
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              aria-label="Fechar"
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>

            {selectedProduct.imageUrl ? (
              <div className="modal-thumb modal-thumb--product-photo">
                <img src={selectedProduct.imageUrl} alt={selectedProduct.title} decoding="async" />
              </div>
            ) : (
              <div
                className="modal-thumb"
                style={{ backgroundImage: thumbBackground(selectedProduct.id) }}
              />
            )}

            <h2 className="modal-title">{selectedProduct.title}</h2>
            <p className="modal-text">{selectedProduct.shortDescription}</p>
            {selectedProduct.longDescription && (
              <p className="modal-text modal-text--muted">{selectedProduct.longDescription}</p>
            )}
            {selectedProduct.price && <p className="modal-price">{selectedProduct.price}</p>}

            <div className="modal-actions">
              <button
                type="button"
                className="button button--primary"
                onClick={() => handleAddToCart(selectedProduct.id)}
              >
                Adicionar ao carrinho
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setSelectedProduct(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}


