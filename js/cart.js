/* Carrinho — portado de src/contexts/CartContext.tsx, usando localStorage */

const CART_KEY = "pdap-cart-v1";

function cartRead() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function cartWrite(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  document.dispatchEvent(new CustomEvent("cart:change"));
}
function cartAdd(product, quantity = 1, variant) {
  const items = cartRead();
  const idx = items.findIndex((it) => it.product.id === product.id);
  if (idx >= 0) {
    items[idx].quantity += quantity;
    if (variant) items[idx].variant = variant;
  } else {
    items.push({ product, quantity, variant });
  }
  cartWrite(items);
  /* TikTok AddToCart */
  if (typeof ttk !== 'undefined') {
    ttk.addToCart({ id: product.id, name: product.name, price: priceToNumber(product.price) }, quantity);
  }
}
function cartRemove(productId) {
  cartWrite(cartRead().filter((it) => it.product.id !== productId));
}
function cartUpdateQty(productId, quantity) {
  if (quantity <= 0) return cartRemove(productId);
  const items = cartRead().map((it) => (it.product.id === productId ? { ...it, quantity } : it));
  cartWrite(items);
}
function cartClear() {
  cartWrite([]);
}
function cartHasItem(productId) {
  return cartRead().some((it) => it.product.id === productId);
}
function cartCount() {
  return cartRead().reduce((s, it) => s + it.quantity, 0);
}
function cartTotal() {
  return cartRead().reduce((s, it) => s + priceToNumber(it.product.price) * it.quantity, 0);
}
