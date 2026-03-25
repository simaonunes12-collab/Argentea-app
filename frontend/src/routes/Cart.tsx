import { useEffect, useMemo, useState } from 'react'
import { appContent } from '../config/content'
import { getCart, updateQuantity } from '../lib/cartStorage'
import { getProducts } from '../services/auth'

type ProductLike = {
  id: string
  title: string
  shortDescription: string
  longDescription?: string
  price?: string
  imageUrl?: string
  priceValue?: number | null
}

function thumbBackground(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  const hueA = hash % 360
  const hueB = (hueA + 55 + (hash % 50)) % 360
  return `linear-gradient(135deg, hsl(${hueA} 85% 60%) 0%, hsl(${hueB} 85% 45%) 100%)`
}

function parsePriceString(price?: string): number | null {
  if (!price) return null
  const normalized = price.replace(/[^\d,.-]/g, '').replace(',', '.')
  const numeric = Number.parseFloat(normalized)
  return Number.isFinite(numeric) ? numeric : null
}

export function Cart() {
  const [cart, setCart] = useState(getCart())

  const fallbackProducts = useMemo(() => {
    const fromProducts = appContent.products as unknown as ProductLike[]
    if (fromProducts.length > 0) return fromProducts
    return appContent.store.trainings as unknown as ProductLike[]
  }, [])

  const [products, setProducts] = useState<ProductLike[]>(fallbackProducts)
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProducts() {
      try {
        const rows = await getProducts()
        if (!active || rows.length === 0) return

        setProducts(
          rows.map((row) => {
            const priceValue = row.price_cents / 100
            return {
              id: row.id,
              title: row.name,
              shortDescription: row.short_description,
              longDescription: row.long_description ?? undefined,
              imageUrl: row.image_url ?? undefined,
              priceValue,
              price: `${priceValue.toFixed(2)} ${row.currency}`,
            }
          }),
        )
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Não foi possível carregar os produtos.'
        setProductsError(message)
      }
    }

    void loadProducts()
    return () => {
      active = false
    }
  }, [])

  const productsById = useMemo(() => {
    return new Map(products.map((p) => [p.id, p] as const))
  }, [products])

  const totalItems = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalAmount = cart.items.reduce((sum, item) => {
    const product = productsById.get(item.id)
    const unitPrice = product?.priceValue ?? parsePriceString(product?.price)
    if (unitPrice === null) return sum
    return sum + unitPrice * item.quantity
  }, 0)
  const hasPriceEstimate = totalAmount > 0

  return (
    <section className="page page--cart" aria-label="Carrinho">
      <header className="page-header">
        <h1>Carrinho</h1>
        {productsError && <p className="form-message form-message--error">{productsError}</p>}
      </header>

      {cart.items.length === 0 ? (
        <div className="cart-empty" role="status" aria-live="polite">
          O seu carrinho está vazio.
        </div>
      ) : (
        <>
          <ul className="cart-items" aria-label="Itens do carrinho">
            {cart.items.map((item) => {
              const product = productsById.get(item.id)
              return (
                <li key={item.id} className="cart-item">
                  <div
                    className="cart-item-thumb"
                    style={
                      product?.imageUrl
                        ? { backgroundImage: `url(${product.imageUrl})` }
                        : { backgroundImage: thumbBackground(item.id) }
                    }
                    aria-hidden="true"
                  />

                  <div className="cart-item-main">
                    <div className="cart-item-title">
                      {product?.title ?? item.id}
                    </div>
                    <div className="cart-item-subtext">
                      {product?.shortDescription ?? 'Detalhes em breve.'}
                    </div>
                    {product?.price && <div className="cart-item-price">Preço: {product.price}</div>}
                  </div>

                  <div className="cart-item-qty">
                    <button
                      type="button"
                      className="qty-btn"
                      aria-label="Diminuir quantidade"
                      onClick={() => {
                        updateQuantity(item.id, item.quantity - 1)
                        setCart(getCart())
                      }}
                    >
                      -
                    </button>

                    <div className="qty-value" aria-label={`Quantidade: ${item.quantity}`}>
                      {item.quantity}
                    </div>

                    <button
                      type="button"
                      className="qty-btn"
                      aria-label="Aumentar quantidade"
                      onClick={() => {
                        updateQuantity(item.id, item.quantity + 1)
                        setCart(getCart())
                      }}
                    >
                      +
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="cart-summary" aria-label="Resumo do carrinho">
            <div className="cart-summary-row">
              <span>Total de itens</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="cart-summary-row cart-summary-row--muted">
              <span>Valor total</span>
              <strong>{hasPriceEstimate ? `${totalAmount.toFixed(2)} EUR` : 'Sob consulta'}</strong>
            </div>
          </div>

          <div className="cart-actions">
            <button
              type="button"
              className="button button--primary"
              onClick={() => {
                // Placeholder para fluxo de checkout (futuramente integrado com backend/Supabase).
                alert('Finalizar compra: placeholder.')
              }}
            >
              Finalizar compra
            </button>
          </div>
        </>
      )}
    </section>
  )
}

