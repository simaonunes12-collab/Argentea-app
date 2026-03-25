export type CartItem = {
  id: string
  quantity: number
}

export type CartState = {
  items: CartItem[]
}

const CART_KEY = 'argentea_cart_v1'

function safeParseCart(raw: string | null): CartState {
  if (!raw) return { items: [] }
  try {
    const parsed = JSON.parse(raw) as Partial<CartState>
    const items = Array.isArray(parsed.items) ? parsed.items : []
    return {
      items: items
        .filter((it) => it && typeof it.id === 'string' && typeof it.quantity === 'number')
        .map((it) => ({ id: it.id, quantity: Math.max(0, it.quantity) })),
    }
  } catch {
    return { items: [] }
  }
}

export function getCart(): CartState {
  if (typeof window === 'undefined') return { items: [] }
  return safeParseCart(window.localStorage.getItem(CART_KEY))
}

export function setCart(cart: CartState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function getCartCount(): number {
  const cart = getCart()
  return cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
}

export function addToCart(id: string, quantity: number = 1): CartState {
  const cart = getCart()
  const existing = cart.items.find((item) => item.id === id)
  if (existing) existing.quantity += quantity
  else cart.items.push({ id, quantity })
  cart.items = cart.items.filter((item) => item.quantity > 0)
  setCart(cart)
  return cart
}

export function updateQuantity(id: string, quantity: number): CartState {
  const cart = getCart()
  const existing = cart.items.find((item) => item.id === id)
  if (!existing) {
    if (quantity > 0) cart.items.push({ id, quantity })
  } else {
    existing.quantity = quantity
  }
  cart.items = cart.items.filter((item) => item.quantity > 0)
  setCart(cart)
  return cart
}

export function removeFromCart(id: string): CartState {
  const cart = getCart()
  cart.items = cart.items.filter((item) => item.id !== id)
  setCart(cart)
  return cart
}

export function clearCart(): void {
  setCart({ items: [] })
}

