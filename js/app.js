/* Utilidades compartilhadas entre páginas: header, cards, navegação */

function qs(name, fallback) {
  const v = new URLSearchParams(location.search).get(name);
  return v === null ? fallback : v;
}

function renderHeader(mount, variant = "default") {
  if (variant === "product") {
    mount.innerHTML = `
      <header class="header product">
        <div class="wrap">
          <button class="icon-btn" id="hdr-back" aria-label="Voltar">${icon("back")}</button>
          <div class="spacer"></div>
          <button class="icon-btn" id="hdr-share" aria-label="Compartilhar">${icon("share")}</button>
          <a href="carrinho.html" class="icon-btn header-cart" aria-label="Carrinho">
            ${icon("cart")}
            <span class="badge" id="hdr-badge" hidden>0</span>
          </a>
        </div>
      </header>`;
    mount.querySelector("#hdr-back").addEventListener("click", () => {
      document.dispatchEvent(new CustomEvent("app:back-intent"));
      setTimeout(() => history.back(), 0);
    });
    mount.querySelector("#hdr-share").addEventListener("click", () => {
      if (navigator.share) navigator.share({ url: location.href }).catch(() => {});
    });
  } else {
    mount.innerHTML = `
      <header class="header">
        <div class="wrap">
          <a href="produto.html?id=5" class="header-logo">
            <img src="assets/logo.png" alt="Central Fit" width="36" height="36" />
            <div class="brand"><span>Central</span><span>Fit</span></div>
          </a>
          <div class="header-search">
            ${icon("search")}
            <input type="search" placeholder="Buscar produtos..." />
          </div>
          <a href="carrinho.html" class="header-cart" aria-label="Carrinho">
            ${icon("cart")}
            <span class="badge" id="hdr-badge" hidden>0</span>
          </a>
        </div>
      </header>`;
  }
  updateCartBadge();
  document.addEventListener("cart:change", updateCartBadge);
}

function updateCartBadge() {
  const n = cartCount();
  document.querySelectorAll("#hdr-badge, .js-cart-badge").forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
}

function starsHtml(rating, size) {
  let out = '<span class="stars">';
  for (let i = 0; i < 5; i++) {
    out += `<svg class="${i < rating ? "on" : "off"}" viewBox="0 0 24 24" fill="${i < rating ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>`;
  }
  return out + "</span>";
}

function productCardHtml(p) {
  return `
    <a href="produto.html?id=${p.id}" class="product-card">
      <div class="img-wrap">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" width="400" height="400" />
        <span class="discount-badge">${getDiscount(p)}</span>
      </div>
      <div class="body">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="rating-row">
          ${icon("star")}
          <span class="num">${p.rating}</span><span>·</span><span>${p.sold} vendidos</span>
        </div>
        <div class="prices">
          <span class="price">${p.price}</span>
          <span class="old-price">${p.oldPrice}</span>
        </div>
      </div>
    </a>`;
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

/* ── Presença ao vivo (admin dashboard) ──────────────────────────────
   Envia heartbeat a cada 30s para visitor_presence no Supabase.
   O dashboard admin lê esta tabela para mostrar visitantes em tempo real. */
;(function () {
  var SB = 'https://dswawxckvmzftxumtdad.supabase.co';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzd2F3eGNrdm16ZnR4dW10ZGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MDIzNjUsImV4cCI6MjEwNTE3ODM2NX0.0Lnq6WdrFxntke23WZM-2mzAbb9z36PrOTr2eWMN9RM';

  var sid = '';
  try {
    sid = sessionStorage.getItem('plt-sid') || '';
    if (!sid) {
      sid = (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2)));
      sessionStorage.setItem('plt-sid', sid);
    }
  } catch (e) { sid = 'anon-' + Date.now(); }

  var path = location.pathname.toLowerCase();
  var cat = 'home';
  if (path.includes('produto') || path.includes('product')) {
    // id=5 é o produto em destaque usado como página inicial da loja (redirect de "/" e "/loja")
    var pid = new URLSearchParams(location.search).get('id') || '5';
    cat = (pid === '5') ? 'home' : 'product';
  }
  else if (path.includes('checkout')) cat = 'checkout';
  else if (path.includes('pix')) cat = 'pix';
  else if (path.includes('obrigado')) cat = 'other';

  function ping() {
    fetch(SB + '/rest/v1/visitor_presence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': KEY,
        'Authorization': 'Bearer ' + KEY,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ session_id: sid, page_category: cat, last_seen: new Date().toISOString() }),
    }).catch(function () {});
  }

  ping();
  setInterval(ping, 20000);
})();
